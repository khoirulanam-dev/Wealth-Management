import { describe, it, expect } from "vitest";
import { Decimal } from "decimal.js";

describe("Cash & Liquidity Domain Calculations", () => {
  it("calculates balance after deposits correctly", () => {
    const openingBalance = new Decimal("10000000"); // 10 jt
    const deposit1 = new Decimal("2500000"); // 2.5 jt
    const deposit2 = new Decimal("500000"); // 500 rb

    const finalBalance = openingBalance.plus(deposit1).plus(deposit2);
    expect(finalBalance.toString()).toBe("13000000");
  });

  it("calculates balance after withdrawals and rejects insufficient balance", () => {
    const currentBalance = new Decimal("5000000"); // 5 jt
    const withdrawal = new Decimal("2000000"); // 2 jt

    const newBalance = currentBalance.minus(withdrawal);
    expect(newBalance.toString()).toBe("3000000");

    // Overdraft test
    const excessiveWithdrawal = new Decimal("4000000");
    const isSufficient = newBalance.gte(excessiveWithdrawal);
    expect(isSufficient).toBe(false);
  });

  it("verifies paired internal transfer is net-to-zero across accounts", () => {
    const accountABalance = new Decimal("10000000"); // 10 jt (BCA)
    const accountBBalance = new Decimal("3000000"); // 3 jt (Mandiri)
    const transferAmount = new Decimal("2000000"); // 2 jt transfer BCA -> Mandiri

    const totalBefore = accountABalance.plus(accountBBalance);

    // Transfer execution: Account A debited, Account B credited
    const newAccountABalance = accountABalance.minus(transferAmount);
    const newAccountBBalance = accountBBalance.plus(transferAmount);

    const totalAfter = newAccountABalance.plus(newAccountBBalance);

    // Guaranteed net-to-zero
    expect(newAccountABalance.toString()).toBe("8000000");
    expect(newAccountBBalance.toString()).toBe("5000000");
    expect(totalBefore.equals(totalAfter)).toBe(true);
    expect(totalAfter.toString()).toBe("13000000");
  });

  it("calculates reconciliation adjustment difference and audit notes", () => {
    const systemBalance = new Decimal("10000000"); // 10 jt di sistem
    const observedPassbookBalance = new Decimal("9950000"); // 9.95 jt di buku tabungan bank (selisih admin bank)

    const adjustmentDiff = observedPassbookBalance.minus(systemBalance);
    expect(adjustmentDiff.toString()).toBe("-50000");
    expect(adjustmentDiff.isNegative()).toBe(true);

    const newSystemBalance = systemBalance.plus(adjustmentDiff);
    expect(newSystemBalance.equals(observedPassbookBalance)).toBe(true);
  });

  it("computes emergency fund coverage percentage accurately", () => {
    const emergencyFundCurrent = new Decimal("30000000"); // 30 jt
    const emergencyFundTarget = new Decimal("60000000"); // 60 jt (target 6 bulan pengeluaran)

    const coverage = emergencyFundTarget.gt(0)
      ? emergencyFundCurrent.dividedBy(emergencyFundTarget).times(100).toFixed(1)
      : "0.0";

    expect(coverage).toBe("50.0");

    // When fully funded
    const fullyFundedCurrent = new Decimal("60000000");
    const fullCoverage = fullyFundedCurrent.dividedBy(emergencyFundTarget).times(100).toFixed(1);
    expect(fullCoverage).toBe("100.0");

    // When target is 0 / not set
    const zeroTarget = new Decimal(0);
    const zeroCoverage = zeroTarget.gt(0)
      ? emergencyFundCurrent.dividedBy(zeroTarget).times(100).toFixed(1)
      : "0.0";
    expect(zeroCoverage).toBe("0.0");
  });
});

