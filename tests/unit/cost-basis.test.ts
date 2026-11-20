import { describe, it, expect } from "vitest";
import { CostBasisEngine } from "@/domain/portfolio/cost-basis";
import { PositionProjector, LedgerTransaction } from "@/domain/portfolio/position-projector";
import { Decimal } from "decimal.js";

describe("CostBasisEngine - PRD & DATA_MODEL specifications", () => {
  it("executes the exact stock average cost scenario from DATA_MODEL.md", () => {
    // 1. Buy 10 shares at Rp1,000
    const step1 = CostBasisEngine.calculateBuy(0, 0, 10, 1000);
    expect(step1.newQuantity.toNumber()).toBe(10);
    expect(step1.newAverageCost.toNumber()).toBe(1000);
    expect(step1.totalCostBasis.toNumber()).toBe(10000);

    // 2. Buy 10 shares at Rp1,200
    // newAverageCost = ((10 * 1000) + (10 * 1200)) / 20 = 22,000 / 20 = 1,100
    const step2 = CostBasisEngine.calculateBuy(
      step1.newQuantity,
      step1.newAverageCost,
      10,
      1200
    );
    expect(step2.newQuantity.toNumber()).toBe(20);
    expect(step2.newAverageCost.toNumber()).toBe(1100);
    expect(step2.totalCostBasis.toNumber()).toBe(22000);

    // 3. Sell 5 shares at Rp1,300
    // realizedPL = 5 * (1300 - 1100) = 5 * 200 = 1,000
    // remaining = 15 shares at average cost Rp1,100
    const step3 = CostBasisEngine.calculateSell(
      step2.newQuantity,
      step2.newAverageCost,
      5,
      1300
    );
    expect(step3.remainingQuantity.toNumber()).toBe(15);
    expect(step3.remainingAverageCost.toNumber()).toBe(1100);
    expect(step3.realizedPL.toNumber()).toBe(1000);
    expect(step3.totalCostBasis.toNumber()).toBe(16500);
  });

  it("retains average cost after a partial sale", () => {
    const buy = CostBasisEngine.calculateBuy(0, 0, 100, 5000);
    expect(buy.newAverageCost.toNumber()).toBe(5000);

    const partialSell = CostBasisEngine.calculateSell(buy.newQuantity, buy.newAverageCost, 30, 6000);
    expect(partialSell.remainingQuantity.toNumber()).toBe(70);
    expect(partialSell.remainingAverageCost.toNumber()).toBe(5000);
    expect(partialSell.realizedPL.toNumber()).toBe(30000); // 30 * (6000 - 5000)
    expect(partialSell.totalCostBasis.toNumber()).toBe(350000); // 70 * 5000
  });

  it("closes position on full sale while computing final realized P/L", () => {
    const buy = CostBasisEngine.calculateBuy(0, 0, 50, 2000);
    const fullSell = CostBasisEngine.calculateSell(buy.newQuantity, buy.newAverageCost, 50, 2500);

    expect(fullSell.remainingQuantity.toNumber()).toBe(0);
    expect(fullSell.remainingAverageCost.toNumber()).toBe(0);
    expect(fullSell.realizedPL.toNumber()).toBe(25000); // 50 * (2500 - 2000)
    expect(fullSell.totalCostBasis.toNumber()).toBe(0);
  });

  it("strictly rejects sale greater than owned quantity (no short selling)", () => {
    const buy = CostBasisEngine.calculateBuy(0, 0, 25, 1000);
    expect(() => {
      CostBasisEngine.calculateSell(buy.newQuantity, buy.newAverageCost, 30, 1200);
    }).toThrow(/Insufficient holding quantity/);
  });

  it("strictly rejects non-positive buy quantity or price", () => {
    expect(() => CostBasisEngine.calculateBuy(0, 0, 0, 1000)).toThrow();
    expect(() => CostBasisEngine.calculateBuy(0, 0, -5, 1000)).toThrow();
    expect(() => CostBasisEngine.calculateBuy(0, 0, 10, 0)).toThrow();
    expect(() => CostBasisEngine.calculateBuy(0, 0, 10, -500)).toThrow();
  });

  it("correctly converts Indonesian IDX stock lots and shares", () => {
    expect(CostBasisEngine.lotsToShares(5).toNumber()).toBe(500);
    expect(CostBasisEngine.lotsToShares(12.5).toNumber()).toBe(1250);
    expect(CostBasisEngine.sharesToLots(500).toNumber()).toBe(5);
    expect(CostBasisEngine.sharesToLots(1250).toNumber()).toBe(12.5);
  });

  it("correctly computes unrealized P/L and market value", () => {
    const qty = 100;
    const avgCost = 1000;
    const currentPrice = 1250;

    const result = CostBasisEngine.calculateUnrealizedPL(qty, avgCost, currentPrice);
    expect(result.marketValue.toNumber()).toBe(125000);
    expect(result.unrealizedPL.toNumber()).toBe(25000);
    expect(result.unrealizedPLPercentage.toNumber()).toBe(25); // +25%
  });

  it("handles mutual fund fractional units and NAV accurately", () => {
    // Buy 1,234.5678 units @ NAV 1,500.25
    const buy = CostBasisEngine.calculateBuy("0", "0", "1234.5678", "1500.25");
    expect(buy.newQuantity.toString()).toBe("1234.5678");
    expect(buy.newAverageCost.toFixed(4)).toBe("1500.2500");

    // Redeem 500.1234 units @ NAV 1,650.50
    const sell = CostBasisEngine.calculateSell(buy.newQuantity, buy.newAverageCost, "500.1234", "1650.50");
    expect(sell.remainingQuantity.toString()).toBe("734.4444");
    expect(sell.remainingAverageCost.toFixed(4)).toBe("1500.2500");
    // Realized PL = 500.1234 * (1650.50 - 1500.25) = 500.1234 * 150.25 = 75143.54085
    expect(sell.realizedPL.toFixed(4)).toBe("75143.5409");
  });

  it("handles gold purchase and sale in grams", () => {
    // Buy 10 grams @ Rp1,000,000/g
    const buy1 = CostBasisEngine.calculateBuy(0, 0, 10, 1000000);
    // Buy 5 grams @ Rp1,150,000/g
    // Total cost = 10m + 5.75m = 15.75m / 15g = 1,050,000/g
    const buy2 = CostBasisEngine.calculateBuy(buy1.newQuantity, buy1.newAverageCost, 5, 1150000);
    expect(buy2.newQuantity.toNumber()).toBe(15);
    expect(buy2.newAverageCost.toNumber()).toBe(1050000);

    // Sell 3 grams @ Rp1,200,000/g
    const sell = CostBasisEngine.calculateSell(buy2.newQuantity, buy2.newAverageCost, 3, 1200000);
    expect(sell.remainingQuantity.toNumber()).toBe(12);
    expect(sell.remainingAverageCost.toNumber()).toBe(1050000);
    expect(sell.realizedPL.toNumber()).toBe(450000); // 3 * (1,200,000 - 1,050,000)
  });

  describe("PositionProjector deterministic replay", () => {
    it("replays mixed buy and sell transactions correctly regardless of initial array ordering", () => {
      const txs: LedgerTransaction[] = [
        {
          id: "tx-3",
          type: "sell",
          status: "posted",
          tradeDate: new Date("2026-03-01"),
          quantity: "5",
          unitPrice: "1300",
        },
        {
          id: "tx-1",
          type: "buy",
          status: "posted",
          tradeDate: new Date("2026-01-01"),
          quantity: "10",
          unitPrice: "1000",
        },
        {
          id: "tx-2",
          type: "buy",
          status: "posted",
          tradeDate: new Date("2026-02-01"),
          quantity: "10",
          unitPrice: "1200",
        },
      ];

      const projected = PositionProjector.projectPosition("inst-1", "acc-1", txs);
      expect(projected.quantity.toNumber()).toBe(15);
      expect(projected.averageCostPerUnit.toNumber()).toBe(1100);
      expect(projected.totalCostBasis.toNumber()).toBe(16500);
      expect(projected.totalRealizedPL.toNumber()).toBe(1000);
      expect(projected.closed).toBe(false);
    });

    it("completely excludes voided or draft transactions from position projection", () => {
      const txs: LedgerTransaction[] = [
        {
          id: "tx-1",
          type: "buy",
          status: "posted",
          tradeDate: new Date("2026-01-01"),
          quantity: "100",
          unitPrice: "5000",
        },
        {
          id: "tx-voided",
          type: "buy",
          status: "voided",
          tradeDate: new Date("2026-01-15"),
          quantity: "500",
          unitPrice: "10000",
        },
        {
          id: "tx-draft",
          type: "buy",
          status: "draft",
          tradeDate: new Date("2026-01-20"),
          quantity: "200",
          unitPrice: "8000",
        },
      ];

      const projected = PositionProjector.projectPosition("inst-1", "acc-1", txs);
      expect(projected.quantity.toNumber()).toBe(100);
      expect(projected.averageCostPerUnit.toNumber()).toBe(5000);
      expect(projected.transactionCount).toBe(1);
    });

    it("resets average cost to new purchase price when re-buying after a full position closure", () => {
      const txs: LedgerTransaction[] = [
        {
          id: "tx-1",
          type: "buy",
          status: "posted",
          tradeDate: new Date("2026-01-01"),
          quantity: "10",
          unitPrice: "1000",
        },
        {
          id: "tx-2",
          type: "sell",
          status: "posted",
          tradeDate: new Date("2026-01-15"),
          quantity: "10",
          unitPrice: "1500",
        },
        {
          id: "tx-3",
          type: "buy",
          status: "posted",
          tradeDate: new Date("2026-02-01"),
          quantity: "20",
          unitPrice: "2000",
        },
      ];

      const projected = PositionProjector.projectPosition("inst-1", "acc-1", txs);
      expect(projected.quantity.toNumber()).toBe(20);
      expect(projected.averageCostPerUnit.toNumber()).toBe(2000);
      expect(projected.totalRealizedPL.toNumber()).toBe(5000); // 10 * (1500 - 1000)
    });
  });
});
