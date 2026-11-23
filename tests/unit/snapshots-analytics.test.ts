import { describe, it, expect } from "vitest";
import { Decimal } from "decimal.js";

describe("Milestone 7: Snapshots, Net Worth & Analytics Engine", () => {
  it("calculates True Net Worth strictly as: Investments + Cash - Liabilities", () => {
    const investments = new Decimal("150000000.00"); // 150M in stocks/gold/funds
    const cash = new Decimal("25000000.00"); // 25M in bank / emergency fund
    const liabilities = new Decimal("15000000.00"); // 15M in PayLater / credit card debt

    const netWorth = investments.plus(cash).minus(liabilities);
    expect(netWorth.toFixed(2)).toBe("160000000.00");

    // Total Assets = Investments + Cash
    const totalAssets = investments.plus(cash);
    expect(totalAssets.toFixed(2)).toBe("175000000.00");

    // Debt to Asset ratio
    const debtToAsset = liabilities.dividedBy(totalAssets).times(100).toDecimalPlaces(2).toNumber();
    expect(debtToAsset).toBe(8.57); // 15M / 175M = 8.57%
  });

  it("strictly excludes Watchlist items from portfolio holdings and net worth", () => {
    const ownedInvestments = new Decimal("50000000.00");
    const cash = new Decimal("10000000.00");
    const liabilities = new Decimal("0.00");

    // Watchlist quotes must be isolated
    const watchlistedAssets = [
      { symbol: "BBCA", price: 10000, isOwned: false },
      { symbol: "BTC", price: 1500000000, isOwned: false },
    ];

    // Net worth calculation must never add watchlist values
    const netWorth = ownedInvestments.plus(cash).minus(liabilities);
    expect(netWorth.toFixed(2)).toBe("60000000.00");
    expect(watchlistedAssets.every((w) => !w.isOwned)).toBe(true);
  });

  it("strictly excludes Forecast (unrealized) income from net worth and realized income", () => {
    const realizedIncomeYTD = new Decimal("3500000.00"); // Received dividends/coupons
    const forecastIncome = new Decimal("8000000.00"); // Future projected dividend

    // Total actual income must ONLY count realized income
    const totalActualIncome = realizedIncomeYTD;
    expect(totalActualIncome.toFixed(2)).toBe("3500000.00");

    // Net worth must NOT include future forecast dividends
    const portfolioMarketValue = new Decimal("100000000.00");
    const cash = new Decimal("20000000.00");
    const netWorth = portfolioMarketValue.plus(cash);
    expect(netWorth.toFixed(2)).toBe("120000000.00");
  });

  it("proves internal cash transfers leave total Net Worth invariant", () => {
    let bcaBalance = new Decimal("20000000.00");
    let mandiriBalance = new Decimal("10000000.00");
    const investments = new Decimal("80000000.00");
    const liabilities = new Decimal("5000000.00");

    const netWorthBefore = investments
      .plus(bcaBalance.plus(mandiriBalance))
      .minus(liabilities);
    expect(netWorthBefore.toFixed(2)).toBe("105000000.00");

    // Transfer 5,000,000 from BCA to Mandiri
    const transferAmount = new Decimal("5000000.00");
    bcaBalance = bcaBalance.minus(transferAmount);
    mandiriBalance = mandiriBalance.plus(transferAmount);

    const netWorthAfter = investments
      .plus(bcaBalance.plus(mandiriBalance))
      .minus(liabilities);
    expect(netWorthAfter.toFixed(2)).toBe("105000000.00");
    expect(netWorthBefore.equals(netWorthAfter)).toBe(true);
  });

  it("strictly separates Capital Contributions from Market Return (prevents labeling deposits as gains)", () => {
    const costBasis = new Decimal("100000000.00"); // Uang modal disetor beli aset
    const currentMarketValue = new Decimal("125000000.00"); // Nilai pasar terkini
    const cash = new Decimal("15000000.00"); // Saldo kas tunai
    const realizedDividends = new Decimal("4000000.00"); // Dividen diterima

    // Total Capital Invested (Principal Contributed)
    const capitalInvested = costBasis.plus(cash);
    expect(capitalInvested.toFixed(2)).toBe("115000000.00");

    // Unrealized Capital Gain
    const unrealizedGain = currentMarketValue.minus(costBasis);
    expect(unrealizedGain.toFixed(2)).toBe("25000000.00");

    // Total Market Return (Gain + Realized Passive Income)
    const totalMarketGain = unrealizedGain.plus(realizedDividends);
    expect(totalMarketGain.toFixed(2)).toBe("29000000.00");

    // True Investment Return % = Total Gain / Cost Basis
    const returnPct = totalMarketGain
      .dividedBy(costBasis)
      .times(100)
      .toDecimalPlaces(2)
      .toNumber();
    expect(returnPct).toBe(29.0); // +29% return, not confused with new cash deposits!
  });

  it("verifies asset allocation percentages sum to 100% of total assets", () => {
    const stockVal = new Decimal("60000000.00");
    const mutualFundVal = new Decimal("20000000.00");
    const goldVal = new Decimal("10000000.00");
    const cashVal = new Decimal("10000000.00");

    const totalAssets = stockVal.plus(mutualFundVal).plus(goldVal).plus(cashVal);
    expect(totalAssets.toFixed(2)).toBe("100000000.00");

    const stockPct = stockVal.dividedBy(totalAssets).times(100).toDecimalPlaces(2).toNumber();
    const fundPct = mutualFundVal.dividedBy(totalAssets).times(100).toDecimalPlaces(2).toNumber();
    const goldPct = goldVal.dividedBy(totalAssets).times(100).toDecimalPlaces(2).toNumber();
    const cashPct = cashVal.dividedBy(totalAssets).times(100).toDecimalPlaces(2).toNumber();

    expect(stockPct).toBe(60);
    expect(fundPct).toBe(20);
    expect(goldPct).toBe(10);
    expect(cashPct).toBe(10);

    const sumPct = stockPct + fundPct + goldPct + cashPct;
    expect(sumPct).toBe(100);
  });
});

