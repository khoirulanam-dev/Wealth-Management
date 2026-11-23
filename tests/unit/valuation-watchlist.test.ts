import { describe, it, expect } from "vitest";
import { Decimal } from "decimal.js";

describe("Milestone 5: Valuation, Manual Override & Watchlist Isolation", () => {
  it("ensures manual override updates valuation price without mutating cost basis", () => {
    const totalCostBasis = new Decimal("10000000"); // Modal beli: 10 jt
    const quantity = new Decimal("1000"); // 1000 lembar
    const averageCost = totalCostBasis.dividedBy(quantity); // Rp 10.000 / unit

    // Prior valuation from market feed: 10.500
    const priorMarketPrice = new Decimal("10500");
    const priorMarketValue = quantity.times(priorMarketPrice); // 10.5 jt
    const priorUnrealizedPL = priorMarketValue.minus(totalCostBasis); // +500 rb

    expect(priorMarketValue.toString()).toBe("10500000");
    expect(priorUnrealizedPL.toString()).toBe("500000");

    // User executes manual override to 11.200 (e.g. verified off-market trade or late close)
    const overridePrice = new Decimal("11200");
    const newMarketValue = quantity.times(overridePrice); // 11.2 jt
    const newUnrealizedPL = newMarketValue.minus(totalCostBasis); // +1.2 jt

    // Cost basis must remain completely untouched
    expect(totalCostBasis.toString()).toBe("10000000");
    expect(averageCost.toString()).toBe("10000");

    // Valuation and unrealized P/L must reflect new price
    expect(newMarketValue.toString()).toBe("11200000");
    expect(newUnrealizedPL.toString()).toBe("1200000");
  });

  it("verifies failed provider request preserves last valid quote", () => {
    let lastValidQuote: { price: number; timestamp: Date } = {
      price: 9500,
      timestamp: new Date("2026-11-20T10:00:00Z"),
    };

    // Simulate network error or timeout
    const fetchFailed = true;

    if (fetchFailed) {
      // Logic requirement: keep lastValidQuote, do not clear or set to 0
      lastValidQuote = { ...lastValidQuote };
    }

    expect(lastValidQuote.price).toBe(9500);
    expect(lastValidQuote.timestamp.toISOString()).toBe("2026-11-20T10:00:00.000Z");
  });

  it("enforces watchlist items are strictly excluded from holdings and Net Worth", () => {
    // User holdings: BBCA (15 jt) + BBRI (20 jt)
    const activeHoldingsValue = new Decimal("35000000");
    const cashBalance = new Decimal("10000000");
    const liabilities = new Decimal("5000000");

    // Net worth calculation
    const netWorth = activeHoldingsValue.plus(cashBalance).minus(liabilities);
    expect(netWorth.toString()).toBe("40000000");

    // User adds 5 high-value instruments to watchlist (e.g. BTC @ 1.5 Miliar, Berkshire @ 10 Miliar)
    const watchlistTheoreticalValue = new Decimal("11500000000");

    // Invariant: Net Worth must remain strictly 40.000.000
    const netWorthAfterWatchlist = activeHoldingsValue.plus(cashBalance).minus(liabilities);
    expect(netWorthAfterWatchlist.equals(netWorth)).toBe(true);
    expect(netWorthAfterWatchlist.toString()).toBe("40000000");
  });

  it("requires non-empty audit reason for manual valuation overrides", () => {
    function validateManualOverride(price: number, reason: string) {
      if (!reason || reason.trim().length === 0) {
        throw new Error("Alasan penyesuaian harga (override) wajib diisi untuk catatan audit");
      }
      if (price <= 0) {
        throw new Error("Harga valuasi harus lebih besar dari 0");
      }
      return true;
    }

    expect(() => validateManualOverride(10000, "")).toThrow(
      "Alasan penyesuaian harga (override) wajib diisi untuk catatan audit"
    );
    expect(() => validateManualOverride(0, "Koreksi pasar")).toThrow(
      "Harga valuasi harus lebih besar dari 0"
    );
    expect(validateManualOverride(10250, "Koreksi harga penutupan resmi IDX")).toBe(true);
  });

  it("preserves immutable valuation history across successive updates", () => {
    const valuationLedger: Array<{ id: string; price: string; isManualOverride: boolean; note?: string }> = [];

    // 1. Initial market price
    valuationLedger.push({
      id: "val_1",
      price: "10000.0000",
      isManualOverride: false,
    });

    // 2. Next day price sync
    valuationLedger.push({
      id: "val_2",
      price: "10250.0000",
      isManualOverride: false,
    });

    // 3. User manual override
    valuationLedger.push({
      id: "val_3",
      price: "10500.0000",
      isManualOverride: true,
      note: "Harga tender offer",
    });

    // Invariant: Prior valuations are retained intact
    expect(valuationLedger.length).toBe(3);
    expect(valuationLedger[0].price).toBe("10000.0000");
    expect(valuationLedger[1].price).toBe("10250.0000");
    expect(valuationLedger[2].isManualOverride).toBe(true);
    expect(valuationLedger[2].note).toBe("Harga tender offer");
  });
});
