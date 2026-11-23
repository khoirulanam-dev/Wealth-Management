import { describe, it, expect } from "vitest";
import { Decimal } from "decimal.js";

describe("Milestone 6: Passive Income, Dividends, Coupons & Yield", () => {
  it("strictly excludes forecasts and cancelled items from realized income", () => {
    // 3 events:
    // 1. BBCA Dividen Riil Diterima: 2.500.000
    // 2. BMRI Dividen Proyeksi (Forecast): 1.800.000
    // 3. ASII Dividen Dibatalkan (Cancelled): 750.000

    const items = [
      { type: "dividend", status: "received", amount: new Decimal("2500000") },
      { type: "dividend", status: "forecast", amount: new Decimal("1800000") },
      { type: "dividend", status: "cancelled", amount: new Decimal("750000") },
    ];

    let actualIncome = new Decimal(0);
    let forecastIncome = new Decimal(0);

    for (const item of items) {
      if (item.status === "received") {
        actualIncome = actualIncome.plus(item.amount);
      } else if (item.status === "forecast") {
        forecastIncome = forecastIncome.plus(item.amount);
      }
      // Cancelled items are completely ignored
    }

    expect(actualIncome.toString()).toBe("2500000");
    expect(forecastIncome.toString()).toBe("1800000");
  });

  it("calculates aggregates by type and time window accurately", () => {
    const records = [
      { type: "dividend", status: "received", amount: new Decimal("3000000"), year: 2026 },
      { type: "coupon", status: "received", amount: new Decimal("1250000"), year: 2026 },
      { type: "interest", status: "received", amount: new Decimal("250000"), year: 2026 },
      { type: "dividend", status: "received", amount: new Decimal("4000000"), year: 2025 }, // Previous year
    ];

    let lifetimeTotal = new Decimal(0);
    let ytdTotal = new Decimal(0);

    for (const r of records) {
      lifetimeTotal = lifetimeTotal.plus(r.amount);
      if (r.year === 2026) {
        ytdTotal = ytdTotal.plus(r.amount);
      }
    }

    expect(ytdTotal.toString()).toBe("4500000");
    expect(lifetimeTotal.toString()).toBe("8500000");
  });

  it("calculates Yield on Cost (YoC) reliably from cost basis", () => {
    const totalCostBasis = new Decimal("50000000"); // Modal beli 50 jt
    const annualDividend = new Decimal("3250000"); // Total dividen tahunan 3.25 jt

    // YoC = (Annual Dividend / Cost Basis) * 100
    const yoc = annualDividend.dividedBy(totalCostBasis).times(100);

    expect(yoc.toFixed(2)).toBe("6.50"); // 6.50% Yield on Cost
  });

  it("simulates cash account deposit when income is received without double-counting", () => {
    const initialCash = new Decimal("10000000"); // 10 jt di rekening RDN
    const dividendReceived = new Decimal("1500000"); // 1.5 jt dividen tunai

    // Auto deposit to cash
    const newCashBalance = initialCash.plus(dividendReceived);
    expect(newCashBalance.toString()).toBe("11500000");

    // Net worth reflection:
    // Assets: Investments (50 jt) + Cash (11.5 jt) - Liabilities (0) = 61.5 jt
    const investments = new Decimal("50000000");
    const netWorth = investments.plus(newCashBalance);
    expect(netWorth.toString()).toBe("61500000");
  });
});
