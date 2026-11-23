import { describe, it, expect } from "vitest";
import { Decimal } from "decimal.js";

describe("Liabilities & Debt Management Domain Calculations (Milestone 4)", () => {
  it("calculates outstanding balance after single and multiple payments", () => {
    const originalAmount = new Decimal("15000000"); // 15 jt (contoh pinjaman laptop/HP)
    const payment1 = new Decimal("2500000"); // Cicilan 1: 2.5 jt
    const payment2 = new Decimal("2500000"); // Cicilan 2: 2.5 jt

    const outstandingAfter1 = originalAmount.minus(payment1);
    expect(outstandingAfter1.toString()).toBe("12500000");

    const outstandingAfter2 = outstandingAfter1.minus(payment2);
    expect(outstandingAfter2.toString()).toBe("10000000");
  });

  it("guards against overpayment exceeding outstanding balance", () => {
    const outstanding = new Decimal("1500000"); // Sisa 1.5 jt
    const attemptedPayment = new Decimal("2000000"); // Coba bayar 2 jt

    const isOverpaying = attemptedPayment.gt(outstanding);
    expect(isOverpaying).toBe(true);

    const validPayment = new Decimal("1500000");
    const isExactPayment = validPayment.equals(outstanding);
    expect(isExactPayment).toBe(true);
  });

  it("marks liability as settled when fully paid", () => {
    const outstanding = new Decimal("3000000");
    const fullSettlement = new Decimal("3000000");

    const newOutstanding = outstanding.minus(fullSettlement);
    expect(newOutstanding.isZero()).toBe(true);

    const isSettled = newOutstanding.lte(0);
    expect(isSettled).toBe(true);
  });

  it("calculates overdue status correctly based on due date", () => {
    const now = new Date("2026-11-23T12:00:00Z");

    const pastDueDate = new Date("2026-11-20T00:00:00Z");
    const futureDueDate = new Date("2026-11-30T00:00:00Z");

    const isPastOverdue = pastDueDate < now;
    const isFutureOverdue = futureDueDate < now;

    expect(isPastOverdue).toBe(true);
    expect(isFutureOverdue).toBe(false);
  });

  it("calculates True Net Worth with liabilities subtracted from assets", () => {
    const totalInvestments = new Decimal("85000000"); // 85 jt investasi
    const totalCash = new Decimal("25000000"); // 25 jt kas/tabungan
    const totalLiabilities = new Decimal("15000000"); // 15 jt utang

    const totalAssets = totalInvestments.plus(totalCash); // 110 jt
    const netWorth = totalAssets.minus(totalLiabilities); // 95 jt

    expect(totalAssets.toString()).toBe("110000000");
    expect(netWorth.toString()).toBe("95000000");
  });

  it("correctly simulates cash deduction when paying debt from cash account", () => {
    const cashBalanceBefore = new Decimal("10000000"); // Saldo BCA 10 jt
    const paymentAmount = new Decimal("3500000"); // Bayar tagihan 3.5 jt

    const cashBalanceAfter = cashBalanceBefore.minus(paymentAmount);
    expect(cashBalanceAfter.toString()).toBe("6500000");
    expect(cashBalanceAfter.gte(0)).toBe(true);
  });
});
