import { db } from "@/infrastructure/db/client";
import {
  investmentIncome,
  instruments,
  financialAccounts,
  cashAccounts,
  cashMovements,
} from "@/infrastructure/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Decimal } from "decimal.js";

export interface CreateIncomeDTO {
  instrumentId?: string | null;
  accountId?: string | null;
  type: string; // dividend, coupon, interest, distribution, other
  status: string; // received, forecast, cancelled
  announcementDate?: string | Date | null;
  exDate?: string | Date | null;
  paymentDate: string | Date;
  expectedAmount?: string | number | null;
  actualAmount?: string | number | null;
  currency?: string;
  note?: string | null;
  depositToCashAccountId?: string | null;
}

export interface IncomeItemDetail {
  id: string;
  userId: string;
  instrumentId: string | null;
  instrumentName: string | null;
  instrumentSymbol: string | null;
  assetType: string | null;
  accountId: string | null;
  accountName: string | null;
  type: string;
  status: string;
  announcementDate: Date | null;
  exDate: Date | null;
  paymentDate: Date | null;
  expectedAmount: string | null;
  actualAmount: string | null;
  currency: string;
  note: string | null;
  createdAt: Date;
}

export interface IncomeSummary {
  totalRealizedLifetime: string;
  totalRealizedYTD: string;
  totalForecastUpcoming: string;
  monthlyAverageYTD: string;
  incomeByType: {
    type: string;
    total: string;
    count: number;
  }[];
  recentEvents: IncomeItemDetail[];
}

export class IncomeService {
  /**
   * Create an income event (dividend, coupon, interest, distribution).
   * Strictly separates actual received income from projected forecast income.
   */
  public static async createIncome(userId: string, dto: CreateIncomeDTO) {
    const isReceived = dto.status === "received";
    const actualDec = dto.actualAmount ? new Decimal(dto.actualAmount) : null;
    const expectedDec = dto.expectedAmount ? new Decimal(dto.expectedAmount) : null;

    if (isReceived) {
      if (!actualDec || actualDec.lte(0)) {
        throw new Error("Nominal pendapatan riil diterima harus lebih besar dari 0");
      }
    } else if (dto.status === "forecast") {
      if (!expectedDec || expectedDec.lte(0)) {
        throw new Error("Estimasi nominal pendapatan (forecast) harus lebih besar dari 0");
      }
    }

    const id = `inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : new Date();
    const currency = dto.currency || "IDR";

    // 1. If received and user chooses to deposit to cash account, credit cash and record movement
    if (isReceived && actualDec && dto.depositToCashAccountId) {
      const cashAccList = await db
        .select()
        .from(cashAccounts)
        .where(
          and(
            eq(cashAccounts.id, dto.depositToCashAccountId),
            eq(cashAccounts.userId, userId)
          )
        );

      if (cashAccList.length === 0) {
        throw new Error("Akun kas untuk penyetoran dividen tidak ditemukan");
      }

      const cashAcc = cashAccList[0];
      const newCashBal = new Decimal(cashAcc.currentBalance).plus(actualDec);

      await db
        .update(cashAccounts)
        .set({
          currentBalance: newCashBal.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(cashAccounts.id, cashAcc.id));

      const movId = `mov_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await db.insert(cashMovements).values({
        id: movId,
        userId,
        cashAccountId: cashAcc.id,
        type: "deposit",
        amount: actualDec.toFixed(2),
        currency: cashAcc.currency,
        movementDate: paymentDate,
        note: `Penerimaan ${dto.type.toUpperCase()}${dto.note ? `: ${dto.note}` : ""}`,
        status: "posted",
      });
    }

    // 2. Insert into investment_income
    await db.insert(investmentIncome).values({
      id,
      userId,
      instrumentId: dto.instrumentId || null,
      accountId: dto.accountId || null,
      type: dto.type,
      status: dto.status,
      announcementDate: dto.announcementDate ? new Date(dto.announcementDate) : null,
      exDate: dto.exDate ? new Date(dto.exDate) : null,
      paymentDate,
      expectedAmount: expectedDec ? expectedDec.toFixed(2) : null,
      actualAmount: actualDec ? actualDec.toFixed(2) : null,
      currency,
      note: dto.note?.trim() || null,
    });

    return { incomeId: id };
  }

  /**
   * Mark a forecasted income as received and optionally credit a cash account.
   */
  public static async markAsReceived(
    userId: string,
    incomeId: string,
    actualAmount: string | number,
    depositToCashAccountId?: string | null
  ) {
    const actualDec = new Decimal(actualAmount);
    if (actualDec.lte(0)) {
      throw new Error("Nominal riil diterima harus lebih besar dari 0");
    }

    const existing = await db
      .select()
      .from(investmentIncome)
      .where(and(eq(investmentIncome.id, incomeId), eq(investmentIncome.userId, userId)));

    if (existing.length === 0) throw new Error("Catatan pendapatan tidak ditemukan");
    const item = existing[0];

    // Optional cash account credit
    if (depositToCashAccountId) {
      const cashAccList = await db
        .select()
        .from(cashAccounts)
        .where(
          and(
            eq(cashAccounts.id, depositToCashAccountId),
            eq(cashAccounts.userId, userId)
          )
        );

      if (cashAccList.length > 0) {
        const cashAcc = cashAccList[0];
        const newBal = new Decimal(cashAcc.currentBalance).plus(actualDec);

        await db
          .update(cashAccounts)
          .set({
            currentBalance: newBal.toFixed(2),
            updatedAt: new Date(),
          })
          .where(eq(cashAccounts.id, cashAcc.id));

        const movId = `mov_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await db.insert(cashMovements).values({
          id: movId,
          userId,
          cashAccountId: cashAcc.id,
          type: "deposit",
          amount: actualDec.toFixed(2),
          currency: cashAcc.currency,
          movementDate: new Date(),
          note: `Realisasi ${item.type.toUpperCase()} (Tercatat)`,
          status: "posted",
        });
      }
    }

    await db
      .update(investmentIncome)
      .set({
        status: "received",
        actualAmount: actualDec.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(investmentIncome.id, incomeId));

    return { success: true };
  }

  /**
   * Update an income record.
   */
  public static async updateIncome(
    userId: string,
    incomeId: string,
    dto: {
      instrumentId?: string | null;
      accountId?: string | null;
      cashAccountId?: string | null;
      type?: string;
      expectedAmount?: string | number;
      actualAmount?: string | number | null;
      status?: string;
      eventDate?: string | Date | null;
      receivedDate?: string | Date | null;
      notes?: string | null;
    }
  ) {
    const [existing] = await db
      .select()
      .from(investmentIncome)
      .where(and(eq(investmentIncome.id, incomeId), eq(investmentIncome.userId, userId)))
      .limit(1);

    if (!existing) throw new Error("Catatan pendapatan tidak ditemukan");

    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (dto.instrumentId !== undefined) updatePayload.instrumentId = dto.instrumentId;
    if (dto.accountId !== undefined) updatePayload.accountId = dto.accountId;
    if (dto.cashAccountId !== undefined) updatePayload.cashAccountId = dto.cashAccountId;
    if (dto.type) updatePayload.type = dto.type;
    if (dto.expectedAmount !== undefined) {
      updatePayload.expectedAmount = new Decimal(dto.expectedAmount).toFixed(2);
    }
    if (dto.actualAmount !== undefined) {
      updatePayload.actualAmount = dto.actualAmount ? new Decimal(dto.actualAmount).toFixed(2) : null;
    }
    if (dto.status) updatePayload.status = dto.status;
    if (dto.eventDate !== undefined) {
      updatePayload.eventDate = dto.eventDate ? new Date(dto.eventDate) : null;
    }
    if (dto.receivedDate !== undefined) {
      updatePayload.receivedDate = dto.receivedDate ? new Date(dto.receivedDate) : null;
    }
    if (dto.notes !== undefined) {
      updatePayload.notes = dto.notes?.trim() || null;
    }

    await db.update(investmentIncome).set(updatePayload).where(eq(investmentIncome.id, incomeId));
    return { success: true };
  }

  /**
   * Delete an income record.
   */
  public static async deleteIncome(userId: string, incomeId: string) {
    const existing = await db
      .select()
      .from(investmentIncome)
      .where(and(eq(investmentIncome.id, incomeId), eq(investmentIncome.userId, userId)));

    if (existing.length === 0) throw new Error("Catatan pendapatan tidak ditemukan");

    await db.delete(investmentIncome).where(eq(investmentIncome.id, incomeId));
    return { success: true };
  }

  /**
   * List all income events with joined instrument and account metadata.
   */
  public static async listIncome(userId: string): Promise<IncomeItemDetail[]> {
    const rows = await db
      .select({
        id: investmentIncome.id,
        userId: investmentIncome.userId,
        instrumentId: investmentIncome.instrumentId,
        accountId: investmentIncome.accountId,
        type: investmentIncome.type,
        status: investmentIncome.status,
        announcementDate: investmentIncome.announcementDate,
        exDate: investmentIncome.exDate,
        paymentDate: investmentIncome.paymentDate,
        expectedAmount: investmentIncome.expectedAmount,
        actualAmount: investmentIncome.actualAmount,
        currency: investmentIncome.currency,
        note: investmentIncome.note,
        createdAt: investmentIncome.createdAt,
        instrumentName: instruments.name,
        instrumentSymbol: instruments.symbol,
        assetType: instruments.assetType,
        accountName: financialAccounts.name,
      })
      .from(investmentIncome)
      .leftJoin(instruments, eq(investmentIncome.instrumentId, instruments.id))
      .leftJoin(financialAccounts, eq(investmentIncome.accountId, financialAccounts.id))
      .where(eq(investmentIncome.userId, userId))
      .orderBy(desc(investmentIncome.paymentDate));

    return rows.map((r) => ({
      ...r,
      instrumentName: r.instrumentName || null,
      instrumentSymbol: r.instrumentSymbol || null,
      assetType: r.assetType || null,
      accountName: r.accountName || null,
    }));
  }

  /**
   * Calculate summary metrics: Realized Lifetime, Realized YTD, Forecast Upcoming, and Breakdown by Type.
   * Guarantees that forecasts and cancelled items are excluded from realized income.
   */
  public static async getSummary(userId: string): Promise<IncomeSummary> {
    const all = await this.listIncome(userId);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    let totalRealizedLifetime = new Decimal(0);
    let totalRealizedYTD = new Decimal(0);
    let totalForecastUpcoming = new Decimal(0);

    const typeMap = new Map<string, { total: Decimal; count: number }>();

    for (const item of all) {
      if (item.status === "received" && item.actualAmount) {
        const amt = new Decimal(item.actualAmount);
        totalRealizedLifetime = totalRealizedLifetime.plus(amt);

        if (item.paymentDate && new Date(item.paymentDate).getFullYear() === currentYear) {
          totalRealizedYTD = totalRealizedYTD.plus(amt);
        }

        // Breakdown by type
        const existing = typeMap.get(item.type) || { total: new Decimal(0), count: 0 };
        existing.total = existing.total.plus(amt);
        existing.count += 1;
        typeMap.set(item.type, existing);
      } else if (item.status === "forecast" && item.expectedAmount) {
        if (!item.paymentDate || new Date(item.paymentDate) >= now) {
          totalForecastUpcoming = totalForecastUpcoming.plus(new Decimal(item.expectedAmount));
        }
      }
      // Cancelled items are strictly ignored
    }

    const monthlyAverageYTD = currentMonth > 0
      ? totalRealizedYTD.dividedBy(currentMonth).toFixed(2)
      : "0.00";

    const incomeByType = Array.from(typeMap.entries()).map(([type, val]) => ({
      type,
      total: val.total.toFixed(2),
      count: val.count,
    }));

    return {
      totalRealizedLifetime: totalRealizedLifetime.toFixed(2),
      totalRealizedYTD: totalRealizedYTD.toFixed(2),
      totalForecastUpcoming: totalForecastUpcoming.toFixed(2),
      monthlyAverageYTD,
      incomeByType,
      recentEvents: all.slice(0, 10),
    };
  }
}
