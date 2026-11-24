import { db } from "@/infrastructure/db/client";
import {
  liabilities,
  liabilityPayments,
  installmentSchedules,
  cashAccounts,
  cashMovements,
} from "@/infrastructure/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { Decimal } from "decimal.js";

export interface CreateLiabilityDTO {
  name: string;
  type: string; // paylater, credit_card, personal_loan, installment, bank_loan, informal, other
  creditor: string;
  originalAmount: string | number;
  outstandingBalance?: string | number;
  currency?: string;
  startDate: string | Date;
  dueDate?: string | Date;
  installmentAmount?: string | number;
  installmentFrequency?: string; // monthly, biweekly, weekly
  installmentCount?: number;
  note?: string;
}

export interface RecordLiabilityPaymentDTO {
  liabilityId: string;
  paymentDate: string | Date;
  amount: string | number;
  installmentNumber?: number;
  note?: string;
  fromCashAccountId?: string;
}

export interface LiabilitySummary {
  totalOutstanding: string;
  totalOriginalAmount: string;
  totalMonthlyCommitment: string;
  activeCount: number;
  settledCount: number;
  overdueCount: number;
  nextDuePayment?: {
    liabilityId: string;
    liabilityName: string;
    creditor: string;
    amount: string;
    dueDate: Date;
    isOverdue: boolean;
  };
}

export class LiabilityService {
  /**
   * Create a new liability record (PayLater, Credit Card, Loan, Installment, etc.)
   */
  static async createLiability(userId: string, dto: CreateLiabilityDTO) {
    if (!dto.name.trim()) throw new Error("Nama liabilitas/kewajiban wajib diisi");
    if (!dto.creditor.trim()) throw new Error("Nama kreditor/pemberi pinjaman wajib diisi");

    const original = new Decimal(dto.originalAmount || "0");
    if (original.lte(0)) throw new Error("Jumlah pokok pinjaman harus lebih besar dari 0");

    const outstanding = dto.outstandingBalance !== undefined
      ? new Decimal(dto.outstandingBalance)
      : original;

    if (outstanding.lt(0)) throw new Error("Sisa pokok utang tidak boleh negatif");

    const id = `liab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    const currency = dto.currency || "IDR";
    const status = outstanding.isZero() ? "settled" : "active";

    const installmentAmt = dto.installmentAmount ? new Decimal(dto.installmentAmount) : null;
    const installmentCount = dto.installmentCount ? Number(dto.installmentCount) : null;

    // 1. Insert liability
    await db.insert(liabilities).values({
      id,
      userId,
      name: dto.name.trim(),
      type: dto.type,
      creditor: dto.creditor.trim(),
      originalAmount: original.toFixed(2),
      outstandingBalance: outstanding.toFixed(2),
      currency,
      startDate,
      dueDate,
      installmentAmount: installmentAmt ? installmentAmt.toFixed(2) : null,
      installmentFrequency: dto.installmentFrequency || "monthly",
      installmentCount,
      status,
      note: dto.note?.trim() || null,
    });

    // 2. Generate installment schedules if requested
    if (installmentCount && installmentCount > 0 && installmentAmt && installmentAmt.gt(0) && dueDate) {
      const schedulesToInsert = [];
      const baseDueDate = new Date(dueDate);

      for (let i = 1; i <= installmentCount; i++) {
        const scheduleId = `sched_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`;
        const scheduleDueDate = new Date(baseDueDate);
        // Default monthly increment
        scheduleDueDate.setMonth(scheduleDueDate.getMonth() + (i - 1));

        schedulesToInsert.push({
          id: scheduleId,
          liabilityId: id,
          dueDate: scheduleDueDate,
          plannedAmount: installmentAmt.toFixed(2),
          installmentNumber: i,
          status: "upcoming",
        });
      }

      if (schedulesToInsert.length > 0) {
        await db.insert(installmentSchedules).values(schedulesToInsert);
      }
    }

    return { liabilityId: id };
  }

  /**
   * Record a debt repayment or installment payment with optional deduction from a cash account.
   */
  static async recordPayment(userId: string, dto: RecordLiabilityPaymentDTO) {
    const paymentAmt = new Decimal(dto.amount || "0");
    if (paymentAmt.lte(0)) throw new Error("Nominal pembayaran harus lebih besar dari 0");

    // 1. Get liability
    const liabList = await db
      .select()
      .from(liabilities)
      .where(and(eq(liabilities.id, dto.liabilityId), eq(liabilities.userId, userId)));

    if (liabList.length === 0) throw new Error("Liabilitas tidak ditemukan");
    const liability = liabList[0];

    const currentOutstanding = new Decimal(liability.outstandingBalance);
    if (paymentAmt.gt(currentOutstanding)) {
      throw new Error(
        `Nominal pembayaran (Rp ${paymentAmt.toNumber().toLocaleString("id-ID")}) melebihi sisa pokok kewajiban (Rp ${currentOutstanding.toNumber().toLocaleString("id-ID")})`
      );
    }

    // 2. If paid via cash account, deduct and insert cash movement
    if (dto.fromCashAccountId) {
      const cashAccList = await db
        .select()
        .from(cashAccounts)
        .where(and(eq(cashAccounts.id, dto.fromCashAccountId), eq(cashAccounts.userId, userId)));

      if (cashAccList.length === 0) throw new Error("Akun kas untuk pembayaran tidak ditemukan");
      const cashAcc = cashAccList[0];
      const cashBal = new Decimal(cashAcc.currentBalance);

      if (paymentAmt.gt(cashBal)) {
        throw new Error(
          `Saldo kas tidak mencukupi (Tersedia: Rp ${cashBal.toNumber().toLocaleString("id-ID")}, Dibutuhkan: Rp ${paymentAmt.toNumber().toLocaleString("id-ID")})`
        );
      }

      const newCashBal = cashBal.minus(paymentAmt);
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
        type: "withdrawal",
        amount: paymentAmt.toFixed(2),
        currency: cashAcc.currency,
        movementDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
        note: `Pembayaran Liabilitas: ${liability.name} (${liability.creditor})`,
        status: "posted",
      });
    }

    // 3. Record liability payment
    const paymentId = `liab_pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payDate = dto.paymentDate ? new Date(dto.paymentDate) : new Date();

    await db.insert(liabilityPayments).values({
      id: paymentId,
      userId,
      liabilityId: liability.id,
      paymentDate: payDate,
      amount: paymentAmt.toFixed(2),
      installmentNumber: dto.installmentNumber || null,
      note: dto.note?.trim() || null,
    });

    // 4. Update outstanding balance & status
    const newOutstanding = currentOutstanding.minus(paymentAmt);
    const isSettled = newOutstanding.isZero() || newOutstanding.isNegative();

    await db
      .update(liabilities)
      .set({
        outstandingBalance: newOutstanding.isNegative() ? "0.00" : newOutstanding.toFixed(2),
        status: isSettled ? "settled" : "active",
        updatedAt: new Date(),
      })
      .where(eq(liabilities.id, liability.id));

    // 5. Update schedule if installmentNumber matches
    if (dto.installmentNumber) {
      await db
        .update(installmentSchedules)
        .set({
          status: "paid",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(installmentSchedules.liabilityId, liability.id),
            eq(installmentSchedules.installmentNumber, dto.installmentNumber)
          )
        );
    }

    return { paymentId, newOutstanding: newOutstanding.toFixed(2), isSettled };
  }

  /**
   * Update an existing liability record.
   */
  static async updateLiability(
    userId: string,
    liabilityId: string,
    dto: {
      name?: string;
      type?: string;
      creditor?: string;
      originalAmount?: string | number;
      outstandingBalance?: string | number;
      installmentAmount?: string | number | null;
      dueDate?: string | Date | null;
      note?: string | null;
      status?: string;
    }
  ) {
    const [existing] = await db
      .select()
      .from(liabilities)
      .where(and(eq(liabilities.id, liabilityId), eq(liabilities.userId, userId)))
      .limit(1);

    if (!existing) throw new Error("Liabilitas tidak ditemukan");

    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (dto.name) updatePayload.name = dto.name.trim();
    if (dto.type) updatePayload.type = dto.type;
    if (dto.creditor) updatePayload.creditor = dto.creditor.trim();
    if (dto.originalAmount !== undefined) {
      updatePayload.originalAmount = new Decimal(dto.originalAmount).toFixed(2);
    }
    if (dto.outstandingBalance !== undefined) {
      const outDec = new Decimal(dto.outstandingBalance);
      updatePayload.outstandingBalance = outDec.toFixed(2);
      updatePayload.status = outDec.isZero() ? "settled" : "active";
    }
    if (dto.installmentAmount !== undefined) {
      updatePayload.installmentAmount = dto.installmentAmount
        ? new Decimal(dto.installmentAmount).toFixed(2)
        : null;
    }
    if (dto.dueDate !== undefined) {
      updatePayload.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }
    if (dto.note !== undefined) {
      updatePayload.note = dto.note?.trim() || null;
    }
    if (dto.status) {
      updatePayload.status = dto.status;
    }

    await db.update(liabilities).set(updatePayload).where(eq(liabilities.id, liabilityId));
    return { success: true };
  }

  /**
   * Delete a liability record and cascaded relations.
   */
  static async deleteLiability(userId: string, liabilityId: string) {
    const existing = await db
      .select()
      .from(liabilities)
      .where(and(eq(liabilities.id, liabilityId), eq(liabilities.userId, userId)));

    if (existing.length === 0) throw new Error("Liabilitas tidak ditemukan");

    // Cascades delete payments & schedules
    await db.delete(liabilities).where(eq(liabilities.id, liabilityId));
    return { success: true };
  }

  /**
   * Get all liabilities for user with derived overdue statuses.
   */
  static async getLiabilities(userId: string) {
    const records = await db
      .select()
      .from(liabilities)
      .where(eq(liabilities.userId, userId))
      .orderBy(desc(liabilities.createdAt));

    const now = new Date();

    return records.map((item) => {
      const outstanding = new Decimal(item.outstandingBalance);
      let calculatedStatus = item.status;

      if (outstanding.isZero()) {
        calculatedStatus = "settled";
      } else if (item.dueDate && new Date(item.dueDate) < now) {
        calculatedStatus = "overdue";
      }

      return {
        ...item,
        status: calculatedStatus,
        isSettled: outstanding.isZero(),
        isOverdue: calculatedStatus === "overdue",
      };
    });
  }

  /**
   * Get liability detail with its payment history and schedule.
   */
  static async getLiabilityDetail(userId: string, liabilityId: string) {
    const liabList = await db
      .select()
      .from(liabilities)
      .where(and(eq(liabilities.id, liabilityId), eq(liabilities.userId, userId)));

    if (liabList.length === 0) throw new Error("Liabilitas tidak ditemukan");
    const liability = liabList[0];

    const payments = await db
      .select()
      .from(liabilityPayments)
      .where(eq(liabilityPayments.liabilityId, liabilityId))
      .orderBy(desc(liabilityPayments.paymentDate));

    const schedules = await db
      .select()
      .from(installmentSchedules)
      .where(eq(installmentSchedules.liabilityId, liabilityId))
      .orderBy(asc(installmentSchedules.installmentNumber));

    return { liability, payments, schedules };
  }

  /**
   * Calculate summary metrics for all liabilities.
   */
  static async getSummary(userId: string): Promise<LiabilitySummary> {
    const all = await this.getLiabilities(userId);

    let totalOutstanding = new Decimal(0);
    let totalOriginal = new Decimal(0);
    let totalMonthly = new Decimal(0);
    let activeCount = 0;
    let settledCount = 0;
    let overdueCount = 0;

    let nearestDue: {
      liabilityId: string;
      liabilityName: string;
      creditor: string;
      amount: string;
      dueDate: Date;
      isOverdue: boolean;
    } | undefined = undefined;

    const now = new Date();

    for (const item of all) {
      const original = new Decimal(item.originalAmount);
      const outstanding = new Decimal(item.outstandingBalance);

      totalOriginal = totalOriginal.plus(original);

      if (item.isSettled) {
        settledCount++;
      } else {
        totalOutstanding = totalOutstanding.plus(outstanding);
        if (item.isOverdue) {
          overdueCount++;
        } else {
          activeCount++;
        }

        if (item.installmentAmount) {
          totalMonthly = totalMonthly.plus(new Decimal(item.installmentAmount));
        }

        if (item.dueDate) {
          const dDate = new Date(item.dueDate);
          const isOverdue = dDate < now;
          const plannedAmt = item.installmentAmount || item.outstandingBalance;

          if (!nearestDue || dDate < nearestDue.dueDate) {
            nearestDue = {
              liabilityId: item.id,
              liabilityName: item.name,
              creditor: item.creditor,
              amount: plannedAmt,
              dueDate: dDate,
              isOverdue,
            };
          }
        }
      }
    }

    return {
      totalOutstanding: totalOutstanding.toFixed(2),
      totalOriginalAmount: totalOriginal.toFixed(2),
      totalMonthlyCommitment: totalMonthly.toFixed(2),
      activeCount,
      settledCount,
      overdueCount,
      nextDuePayment: nearestDue,
    };
  }
}

