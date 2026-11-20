import { db } from "@/infrastructure/db/client";
import {
  investmentTransactions,
  positions,
  instruments,
  financialAccounts,
  NewInvestmentTransaction,
} from "@/infrastructure/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Decimal } from "decimal.js";
import { CostBasisEngine } from "@/domain/portfolio/cost-basis";
import { PositionProjector } from "@/domain/portfolio/position-projector";

export interface RecordTransactionDTO {
  instrumentId: string;
  accountId: string;
  type: string; // buy, sell, subscription, redemption, deposit_open, etc.
  tradeDate: string | Date;
  quantity: string;
  unitPrice: string;
  currency?: string;
  note?: string;
  status?: string; // posted, draft
}

export class TransactionsService {
  /**
   * Preview calculation before posting a transaction.
   */
  static async previewTransaction(
    userId: string,
    instrumentId: string,
    accountId: string,
    type: string,
    quantityStr: string,
    unitPriceStr: string
  ) {
    const qty = new Decimal(quantityStr || "0");
    const price = new Decimal(unitPriceStr || "0");

    if (qty.lte(0) || price.lte(0)) {
      return {
        isValid: false,
        error: "Kuantitas dan harga satuan harus bernilai lebih dari 0",
      };
    }

    const grossAmount = qty.times(price);

    // Get current position
    const [currentPos] = await db
      .select()
      .from(positions)
      .where(
        and(
          eq(positions.userId, userId),
          eq(positions.instrumentId, instrumentId),
          eq(positions.accountId, accountId)
        )
      )
      .limit(1);

    const currentQty = new Decimal(currentPos?.quantity || "0");
    const currentAvgCost = new Decimal(currentPos?.averageCostPerUnit || "0");

    const isBuy = ["buy", "subscription", "deposit_open", "bond_buy"].includes(type.toLowerCase());

    if (isBuy) {
      const calculation = CostBasisEngine.calculateBuy(currentQty, currentAvgCost, qty, price);
      return {
        isValid: true,
        grossAmount: grossAmount.toString(),
        currentQuantity: currentQty.toString(),
        currentAverageCost: currentAvgCost.toString(),
        projectedQuantity: calculation.newQuantity.toString(),
        projectedAverageCost: calculation.newAverageCost.toFixed(4),
        projectedTotalCostBasis: calculation.totalCostBasis.toFixed(2),
        projectedRealizedPL: "0",
      };
    } else {
      if (qty.gt(currentQty)) {
        return {
          isValid: false,
          error: `Kuantitas penjualan (${qty.toString()}) melebihi kepemilikan aktif saat ini (${currentQty.toString()}). Penjualan kosong (short selling) dilarang.`,
        };
      }

      const calculation = CostBasisEngine.calculateSell(currentQty, currentAvgCost, qty, price);
      return {
        isValid: true,
        grossAmount: grossAmount.toString(),
        currentQuantity: currentQty.toString(),
        currentAverageCost: currentAvgCost.toString(),
        projectedQuantity: calculation.remainingQuantity.toString(),
        projectedAverageCost: calculation.remainingAverageCost.toFixed(4),
        projectedTotalCostBasis: calculation.totalCostBasis.toFixed(2),
        projectedRealizedPL: calculation.realizedPL.toFixed(2),
      };
    }
  }

  /**
   * Record and post a transaction, then update position state deterministically.
   */
  static async recordTransaction(userId: string, dto: RecordTransactionDTO) {
    const qty = new Decimal(dto.quantity);
    const price = new Decimal(dto.unitPrice);

    if (qty.lte(0)) {
      throw new Error("Kuantitas transaksi harus lebih besar dari 0");
    }
    if (price.lte(0)) {
      throw new Error("Harga satuan transaksi harus lebih besar dari 0");
    }

    const isSell = ["sell", "redemption", "bond_sell"].includes(dto.type.toLowerCase());

    // Check existing position if sell
    if (isSell && dto.status !== "draft") {
      const [pos] = await db
        .select()
        .from(positions)
        .where(
          and(
            eq(positions.userId, userId),
            eq(positions.instrumentId, dto.instrumentId),
            eq(positions.accountId, dto.accountId)
          )
        )
        .limit(1);

      const availableQty = new Decimal(pos?.quantity || "0");
      if (qty.gt(availableQty)) {
        throw new Error(
          `Kuantitas penjualan (${qty.toString()}) melebihi saldo kepemilikan (${availableQty.toString()}). Short selling dilarang.`
        );
      }
    }

    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const grossAmount = qty.times(price);
    const status = dto.status || "posted";

    const newTx: NewInvestmentTransaction = {
      id: txId,
      userId,
      instrumentId: dto.instrumentId,
      accountId: dto.accountId,
      type: dto.type,
      status,
      tradeDate: new Date(dto.tradeDate),
      quantity: qty.toString(),
      unitPrice: price.toString(),
      grossAmount: grossAmount.toFixed(2),
      currency: dto.currency || "IDR",
      note: dto.note?.trim() || null,
      postedAt: status === "posted" ? new Date() : null,
    };

    await db.insert(investmentTransactions).values(newTx);

    // If posted, deterministically rebuild position for this instrument & account
    if (status === "posted") {
      await this.rebuildPosition(userId, dto.instrumentId, dto.accountId);
    }

    return newTx;
  }

  /**
   * Deterministically rebuild position from all posted transactions.
   */
  static async rebuildPosition(userId: string, instrumentId: string, accountId: string) {
    // 1. Fetch all transactions for this instrument and account
    const txs = await db
      .select()
      .from(investmentTransactions)
      .where(
        and(
          eq(investmentTransactions.userId, userId),
          eq(investmentTransactions.instrumentId, instrumentId),
          eq(investmentTransactions.accountId, accountId)
        )
      );

    // 2. Project position deterministically
    const projected = PositionProjector.projectPosition(
      instrumentId,
      accountId,
      txs.map((t) => ({
        id: t.id,
        type: t.type,
        status: t.status,
        tradeDate: t.tradeDate,
        quantity: t.quantity,
        unitPrice: t.unitPrice,
        createdAt: t.createdAt,
      }))
    );

    // 3. Upsert into positions table
    const [existingPos] = await db
      .select()
      .from(positions)
      .where(
        and(
          eq(positions.userId, userId),
          eq(positions.instrumentId, instrumentId),
          eq(positions.accountId, accountId)
        )
      )
      .limit(1);

    // Current price is latest unitPrice or existing currentPrice
    const latestTx = txs
      .filter((t) => t.status === "posted")
      .sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime())[0];

    const currentPrice = existingPos?.currentPrice && new Decimal(existingPos.currentPrice).gt(0)
      ? existingPos.currentPrice
      : latestTx?.unitPrice || "0";

    const marketValue = projected.quantity.times(new Decimal(currentPrice)).toFixed(2);
    const unrealizedPL = projected.quantity
      .times(new Decimal(currentPrice).minus(projected.averageCostPerUnit))
      .toFixed(2);

    if (existingPos) {
      await db
        .update(positions)
        .set({
          quantity: projected.quantity.toString(),
          averageCostPerUnit: projected.averageCostPerUnit.toFixed(4),
          totalCostBasis: projected.totalCostBasis.toFixed(2),
          currentPrice: currentPrice.toString(),
          marketValue,
          unrealizedPL,
          updatedAt: new Date(),
        })
        .where(eq(positions.id, existingPos.id));
    } else {
      const posId = `pos_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await db.insert(positions).values({
        id: posId,
        userId,
        instrumentId,
        accountId,
        quantity: projected.quantity.toString(),
        averageCostPerUnit: projected.averageCostPerUnit.toFixed(4),
        totalCostBasis: projected.totalCostBasis.toFixed(2),
        currentPrice: currentPrice.toString(),
        marketValue,
        unrealizedPL,
      });
    }

    return projected;
  }

  /**
   * Void a transaction and reproject position.
   */
  static async voidTransaction(userId: string, transactionId: string) {
    const [tx] = await db
      .select()
      .from(investmentTransactions)
      .where(
        and(
          eq(investmentTransactions.id, transactionId),
          eq(investmentTransactions.userId, userId)
        )
      )
      .limit(1);

    if (!tx) {
      throw new Error("Transaksi tidak ditemukan");
    }

    if (tx.status === "voided") {
      return;
    }

    await db
      .update(investmentTransactions)
      .set({ status: "voided", updatedAt: new Date() })
      .where(eq(investmentTransactions.id, transactionId));

    // Rebuild position after voiding
    await this.rebuildPosition(userId, tx.instrumentId, tx.accountId);
  }

  /**
   * List transactions with rich joined metadata.
   */
  static async listTransactions(userId: string) {
    return db
      .select({
        id: investmentTransactions.id,
        tradeDate: investmentTransactions.tradeDate,
        type: investmentTransactions.type,
        status: investmentTransactions.status,
        quantity: investmentTransactions.quantity,
        unitPrice: investmentTransactions.unitPrice,
        grossAmount: investmentTransactions.grossAmount,
        currency: investmentTransactions.currency,
        note: investmentTransactions.note,
        createdAt: investmentTransactions.createdAt,
        instrumentId: instruments.id,
        instrumentName: instruments.name,
        instrumentSymbol: instruments.symbol,
        assetType: instruments.assetType,
        unit: instruments.unit,
        accountId: financialAccounts.id,
        accountName: financialAccounts.name,
        institution: financialAccounts.institution,
      })
      .from(investmentTransactions)
      .innerJoin(instruments, eq(investmentTransactions.instrumentId, instruments.id))
      .innerJoin(financialAccounts, eq(investmentTransactions.accountId, financialAccounts.id))
      .where(eq(investmentTransactions.userId, userId))
      .orderBy(desc(investmentTransactions.tradeDate), desc(investmentTransactions.createdAt));
  }
}
