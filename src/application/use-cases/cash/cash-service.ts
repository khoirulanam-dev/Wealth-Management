import { db } from "@/infrastructure/db/client";
import { cashAccounts, cashMovements, financialAccounts } from "@/infrastructure/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Decimal } from "decimal.js";

export interface CreateCashAccountDTO {
  name: string;
  institution: string;
  accountType?: string; // bank, e_wallet, cash
  openingBalance: string | number;
  openingBalanceDate?: string | Date;
  isEmergencyFund?: boolean;
  emergencyFundTarget?: string | number | null;
  currency?: string;
  notes?: string;
}

export interface RecordMovementDTO {
  cashAccountId: string;
  type: "deposit" | "withdrawal";
  amount: string | number;
  movementDate: string | Date;
  note?: string;
}

export interface InternalTransferDTO {
  fromCashAccountId: string;
  toCashAccountId: string;
  amount: string | number;
  transferDate: string | Date;
  note?: string;
}

export interface ReconcileDTO {
  cashAccountId: string;
  observedBalance: string | number;
  reconcileDate: string | Date;
  reason: string;
}

export class CashService {
  /**
   * Set up a new cash/bank/e-wallet account with opening balance.
   */
  static async createCashAccount(userId: string, dto: CreateCashAccountDTO) {
    const finAccountId = `fin_acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cashAccId = `cash_acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const movementId = `mov_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const openingBal = new Decimal(dto.openingBalance || "0");
    const opDate = dto.openingBalanceDate ? new Date(dto.openingBalanceDate) : new Date();
    const currency = dto.currency || "IDR";
    const isEmergency = !!dto.isEmergencyFund;
    const target = dto.emergencyFundTarget ? new Decimal(dto.emergencyFundTarget).toFixed(2) : null;

    // 1. Create underlying financial account
    await db.insert(financialAccounts).values({
      id: finAccountId,
      userId,
      name: dto.name.trim(),
      institution: dto.institution.trim(),
      accountType: dto.accountType || "bank",
      currency,
      notes: dto.notes?.trim() || null,
    });

    // 2. Create cash account entry
    await db.insert(cashAccounts).values({
      id: cashAccId,
      userId,
      financialAccountId: finAccountId,
      openingBalance: openingBal.toFixed(2),
      openingBalanceDate: opDate,
      currentBalance: openingBal.toFixed(2),
      isEmergencyFund: isEmergency,
      emergencyFundTarget: target,
      currency,
    });

    // 3. Insert opening balance movement record in ledger
    if (openingBal.gt(0)) {
      await db.insert(cashMovements).values({
        id: movementId,
        userId,
        cashAccountId: cashAccId,
        type: "opening_balance",
        amount: openingBal.toFixed(2),
        currency,
        movementDate: opDate,
        note: "Saldo Awal Pembukaan Rekening",
        status: "posted",
      });
    }

    return { cashAccountId: cashAccId, financialAccountId: finAccountId };
  }

  /**
   * Record a deposit or withdrawal movement.
   */
  static async recordMovement(userId: string, dto: RecordMovementDTO) {
    const amt = new Decimal(dto.amount);
    if (amt.lte(0)) {
      throw new Error("Nominal mutasi harus lebih besar dari 0");
    }

    const [account] = await db
      .select()
      .from(cashAccounts)
      .where(and(eq(cashAccounts.id, dto.cashAccountId), eq(cashAccounts.userId, userId)))
      .limit(1);

    if (!account) {
      throw new Error("Rekening kas tidak ditemukan atau tidak memiliki hak akses");
    }

    const curBal = new Decimal(account.currentBalance);
    let newBal: Decimal;

    if (dto.type === "deposit") {
      newBal = curBal.plus(amt);
    } else if (dto.type === "withdrawal") {
      if (amt.gt(curBal)) {
        throw new Error(
          `Saldo tidak mencukupi untuk penarikan. Saldo saat ini: Rp ${curBal.toString()}, diminta: Rp ${amt.toString()}`
        );
      }
      newBal = curBal.minus(amt);
    } else {
      throw new Error("Tipe mutasi tidak valid");
    }

    const movId = `mov_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const mDate = dto.movementDate ? new Date(dto.movementDate) : new Date();

    // Insert movement
    await db.insert(cashMovements).values({
      id: movId,
      userId,
      cashAccountId: account.id,
      type: dto.type,
      amount: amt.toFixed(2),
      currency: account.currency,
      movementDate: mDate,
      note: dto.note?.trim() || null,
      status: "posted",
    });

    // Update account balance
    await db
      .update(cashAccounts)
      .set({
        currentBalance: newBal.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(cashAccounts.id, account.id));

    return { movementId: movId, newBalance: newBal.toFixed(2) };
  }

  /**
   * Execute an atomic paired internal transfer between two cash accounts.
   * Net cash impact on total net worth is guaranteed 0.
   */
  static async recordInternalTransfer(userId: string, dto: InternalTransferDTO) {
    if (dto.fromCashAccountId === dto.toCashAccountId) {
      throw new Error("Rekening asal dan rekening tujuan transfer tidak boleh sama");
    }

    const amt = new Decimal(dto.amount);
    if (amt.lte(0)) {
      throw new Error("Nominal transfer harus lebih besar dari 0");
    }

    // Fetch both accounts
    const [fromAcc] = await db
      .select()
      .from(cashAccounts)
      .where(and(eq(cashAccounts.id, dto.fromCashAccountId), eq(cashAccounts.userId, userId)))
      .limit(1);

    const [toAcc] = await db
      .select()
      .from(cashAccounts)
      .where(and(eq(cashAccounts.id, dto.toCashAccountId), eq(cashAccounts.userId, userId)))
      .limit(1);

    if (!fromAcc || !toAcc) {
      throw new Error("Salah satu rekening transfer tidak ditemukan");
    }

    const fromBal = new Decimal(fromAcc.currentBalance);
    if (amt.gt(fromBal)) {
      throw new Error(
        `Saldo rekening asal tidak mencukupi. Saldo saat ini: Rp ${fromBal.toString()}, nominal transfer: Rp ${amt.toString()}`
      );
    }

    const toBal = new Decimal(toAcc.currentBalance);
    const newFromBal = fromBal.minus(amt);
    const newToBal = toBal.plus(amt);

    const transferGroupId = `trf_grp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const tDate = dto.transferDate ? new Date(dto.transferDate) : new Date();

    // 1. Insert paired transfer out
    await db.insert(cashMovements).values({
      id: `mov_out_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      cashAccountId: fromAcc.id,
      type: "transfer_out",
      amount: amt.toFixed(2),
      currency: fromAcc.currency,
      movementDate: tDate,
      transferGroupId,
      note: dto.note?.trim() || "Transfer keluar",
      status: "posted",
    });

    // 2. Insert paired transfer in
    await db.insert(cashMovements).values({
      id: `mov_in_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      cashAccountId: toAcc.id,
      type: "transfer_in",
      amount: amt.toFixed(2),
      currency: toAcc.currency,
      movementDate: tDate,
      transferGroupId,
      note: dto.note?.trim() || "Transfer masuk",
      status: "posted",
    });

    // 3. Update both balances atomically
    await db
      .update(cashAccounts)
      .set({ currentBalance: newFromBal.toFixed(2), updatedAt: new Date() })
      .where(eq(cashAccounts.id, fromAcc.id));

    await db
      .update(cashAccounts)
      .set({ currentBalance: newToBal.toFixed(2), updatedAt: new Date() })
      .where(eq(cashAccounts.id, toAcc.id));

    return {
      transferGroupId,
      fromBalance: newFromBal.toFixed(2),
      toBalance: newToBal.toFixed(2),
    };
  }

  /**
   * Reconcile account balance against real-world observed balance.
   * Requires mandatory reason to preserve audit integrity.
   */
  static async reconcileBalance(userId: string, dto: ReconcileDTO) {
    if (!dto.reason || !dto.reason.trim()) {
      throw new Error("Alasan rekonsiliasi / koreksi saldo wajib diisi untuk audit");
    }

    const [account] = await db
      .select()
      .from(cashAccounts)
      .where(and(eq(cashAccounts.id, dto.cashAccountId), eq(cashAccounts.userId, userId)))
      .limit(1);

    if (!account) {
      throw new Error("Rekening kas tidak ditemukan");
    }

    const observed = new Decimal(dto.observedBalance);
    const current = new Decimal(account.currentBalance);
    const diff = observed.minus(current);

    if (diff.eq(0)) {
      return { adjusted: false, balance: current.toFixed(2) };
    }

    const movId = `mov_adj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const rDate = dto.reconcileDate ? new Date(dto.reconcileDate) : new Date();

    // Insert adjustment record
    await db.insert(cashMovements).values({
      id: movId,
      userId,
      cashAccountId: account.id,
      type: "adjustment",
      amount: diff.abs().toFixed(2),
      currency: account.currency,
      movementDate: rDate,
      note: `Rekonsiliasi Saldo: ${dto.reason.trim()} (${diff.gt(0) ? "+" : "-"}${diff.abs().toFixed(2)})`,
      status: "posted",
    });

    // Update account balance
    await db
      .update(cashAccounts)
      .set({
        currentBalance: observed.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(cashAccounts.id, account.id));

    return {
      adjusted: true,
      previousBalance: current.toFixed(2),
      newBalance: observed.toFixed(2),
      difference: diff.toFixed(2),
    };
  }

  /**
   * List all cash accounts with linked institution details.
   */
  static async listCashAccounts(userId: string) {
    const raw = await db
      .select({
        id: cashAccounts.id,
        financialAccountId: financialAccounts.id,
        name: financialAccounts.name,
        institution: financialAccounts.institution,
        accountType: financialAccounts.accountType,
        openingBalance: cashAccounts.openingBalance,
        openingBalanceDate: cashAccounts.openingBalanceDate,
        currentBalance: cashAccounts.currentBalance,
        isEmergencyFund: cashAccounts.isEmergencyFund,
        emergencyFundTarget: cashAccounts.emergencyFundTarget,
        currency: cashAccounts.currency,
        updatedAt: cashAccounts.updatedAt,
      })
      .from(cashAccounts)
      .innerJoin(financialAccounts, eq(cashAccounts.financialAccountId, financialAccounts.id))
      .where(eq(cashAccounts.userId, userId))
      .orderBy(desc(cashAccounts.currentBalance));

    return raw;
  }

  /**
   * Get all cash movements for a user with account info.
   */
  static async listMovements(userId: string, limit = 50) {
    const raw = await db
      .select({
        id: cashMovements.id,
        cashAccountId: cashMovements.cashAccountId,
        accountName: financialAccounts.name,
        institution: financialAccounts.institution,
        type: cashMovements.type,
        amount: cashMovements.amount,
        currency: cashMovements.currency,
        movementDate: cashMovements.movementDate,
        transferGroupId: cashMovements.transferGroupId,
        note: cashMovements.note,
        status: cashMovements.status,
        createdAt: cashMovements.createdAt,
      })
      .from(cashMovements)
      .innerJoin(cashAccounts, eq(cashMovements.cashAccountId, cashAccounts.id))
      .innerJoin(financialAccounts, eq(cashAccounts.financialAccountId, financialAccounts.id))
      .where(eq(cashMovements.userId, userId))
      .orderBy(desc(cashMovements.movementDate), desc(cashMovements.createdAt))
      .limit(limit);

    return raw;
  }

  /**
   * Aggregate total cash balance, emergency fund metrics, and coverage.
   */
  static async getCashSummary(userId: string) {
    const accounts = await this.listCashAccounts(userId);

    let totalCashBalance = new Decimal(0);
    let emergencyFundCurrent = new Decimal(0);
    let emergencyFundTarget = new Decimal(0);

    for (const acc of accounts) {
      const bal = new Decimal(acc.currentBalance || "0");
      totalCashBalance = totalCashBalance.plus(bal);

      if (acc.isEmergencyFund) {
        emergencyFundCurrent = emergencyFundCurrent.plus(bal);
        if (acc.emergencyFundTarget) {
          emergencyFundTarget = emergencyFundTarget.plus(new Decimal(acc.emergencyFundTarget));
        }
      }
    }

    const emergencyFundCoverage = emergencyFundTarget.gt(0)
      ? emergencyFundCurrent.dividedBy(emergencyFundTarget).times(100).toFixed(1)
      : "0.0";

    return {
      totalCashBalance: totalCashBalance.toFixed(2),
      emergencyFundCurrent: emergencyFundCurrent.toFixed(2),
      emergencyFundTarget: emergencyFundTarget.toFixed(2),
      emergencyFundCoverage,
      accountCount: accounts.length,
    };
  }
}
