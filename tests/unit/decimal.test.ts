import { describe, it, expect } from "vitest";
import { Decimal, toDecimal, formatCurrency, formatPercent } from "@/lib/decimal";

describe("Financial Precision & Formatting (Decimal.js)", () => {
  it("prevents binary floating-point precision corruption (0.1 + 0.2 === 0.3)", () => {
    // In raw JavaScript: 0.1 + 0.2 === 0.30000000000000004 (FAIL)
    // With Decimal.js: exactly 0.3 (PASS)
    const a = new Decimal("0.1");
    const b = new Decimal("0.2");
    const sum = a.plus(b);

    expect(sum.toString()).toBe("0.3");
  });

  it("calculates accurate weighted average cost without rounding drift", () => {
    // Buy 10 shares @ 1,000 = 10,000
    // Buy 10 shares @ 1,200 = 12,000
    // Total = 20 shares, average = 1,100
    const q1 = new Decimal(10);
    const p1 = new Decimal(1000);
    const q2 = new Decimal(10);
    const p2 = new Decimal(1200);

    const totalCost = q1.mul(p1).plus(q2.mul(p2));
    const totalQty = q1.plus(q2);
    const avgCost = totalCost.div(totalQty);

    expect(avgCost.toString()).toBe("1100");
  });

  it("formats Indonesian Rupiah (IDR) cleanly", () => {
    const formatted = formatCurrency(new Decimal("15000000"), "IDR");
    expect(formatted).toContain("15.000.000");
  });

  it("formats positive and negative percentages with explicit signs", () => {
    expect(formatPercent(new Decimal("12.5"))).toBe("+12.50%");
    expect(formatPercent(new Decimal("-4.25"))).toBe("-4.25%");
    expect(formatPercent(new Decimal("0"))).toBe("0.00%");
  });
});

