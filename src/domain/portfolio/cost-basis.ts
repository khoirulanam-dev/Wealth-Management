import { Decimal } from "decimal.js";

// Configure Decimal.js precision for financial accuracy
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export interface BuyCalculationResult {
  newQuantity: Decimal;
  newAverageCost: Decimal;
  totalCostBasis: Decimal;
}

export interface SellCalculationResult {
  remainingQuantity: Decimal;
  remainingAverageCost: Decimal;
  realizedPL: Decimal;
  totalCostBasis: Decimal;
}

export interface UnrealizedPLResult {
  marketValue: Decimal;
  unrealizedPL: Decimal;
  unrealizedPLPercentage: Decimal;
}

export class CostBasisEngine {
  /**
   * Calculate updated position after a BUY / Subscription.
   * Formula:
   * newAverageCost = ((Q * A) + (q * p)) / (Q + q)
   *
   * @param currentQty Existing quantity Q (>= 0)
   * @param currentAvgCost Existing average cost A (>= 0)
   * @param buyQty Purchase quantity q (> 0)
   * @param buyPrice Purchase price p (> 0)
   */
  static calculateBuy(
    currentQty: string | number | Decimal,
    currentAvgCost: string | number | Decimal,
    buyQty: string | number | Decimal,
    buyPrice: string | number | Decimal
  ): BuyCalculationResult {
    const Q = new Decimal(currentQty);
    const A = new Decimal(currentAvgCost);
    const q = new Decimal(buyQty);
    const p = new Decimal(buyPrice);

    if (q.lte(0)) {
      throw new Error("Purchase quantity must be strictly greater than 0");
    }
    if (p.lte(0)) {
      throw new Error("Purchase price must be strictly greater than 0");
    }
    if (Q.lt(0) || A.lt(0)) {
      throw new Error("Existing position quantity and cost cannot be negative");
    }

    const newQuantity = Q.plus(q);
    const totalCostBasis = Q.times(A).plus(q.times(p));
    const newAverageCost = totalCostBasis.dividedBy(newQuantity);

    return {
      newQuantity,
      newAverageCost,
      totalCostBasis,
    };
  }

  /**
   * Calculate updated position and realized P/L after a SELL / Redemption.
   * Formula:
   * realizedPL = s * (r - A)
   * remainingQuantity = Q - s
   * remainingAverageCost = A (remains unchanged after a partial sale)
   *
   * @param currentQty Existing quantity Q (> 0)
   * @param currentAvgCost Existing average cost A (>= 0)
   * @param sellQty Sale quantity s (> 0)
   * @param sellPrice Sale price r (>= 0)
   */
  static calculateSell(
    currentQty: string | number | Decimal,
    currentAvgCost: string | number | Decimal,
    sellQty: string | number | Decimal,
    sellPrice: string | number | Decimal
  ): SellCalculationResult {
    const Q = new Decimal(currentQty);
    const A = new Decimal(currentAvgCost);
    const s = new Decimal(sellQty);
    const r = new Decimal(sellPrice);

    if (s.lte(0)) {
      throw new Error("Sale quantity must be strictly greater than 0");
    }
    if (r.lt(0)) {
      throw new Error("Sale price cannot be negative");
    }
    if (s.gt(Q)) {
      throw new Error(
        `Insufficient holding quantity. Cannot sell ${s.toString()} when only ${Q.toString()} is available.`
      );
    }

    const remainingQuantity = Q.minus(s);
    const realizedPL = s.times(r.minus(A));
    const remainingAverageCost = remainingQuantity.isZero() ? new Decimal(0) : A;
    const totalCostBasis = remainingQuantity.times(remainingAverageCost);

    return {
      remainingQuantity,
      remainingAverageCost,
      realizedPL,
      totalCostBasis,
    };
  }

  /**
   * Calculate unrealized profit/loss and market value based on current valuation.
   * Formula:
   * marketValue = quantity * currentPrice
   * unrealizedPL = (currentPrice - averageCost) * quantity
   * unrealizedPLPercentage = averageCost > 0 ? ((currentPrice - averageCost) / averageCost) * 100 : 0
   */
  static calculateUnrealizedPL(
    quantity: string | number | Decimal,
    averageCost: string | number | Decimal,
    currentPrice: string | number | Decimal
  ): UnrealizedPLResult {
    const Q = new Decimal(quantity);
    const A = new Decimal(averageCost);
    const P = new Decimal(currentPrice);

    if (Q.isZero()) {
      return {
        marketValue: new Decimal(0),
        unrealizedPL: new Decimal(0),
        unrealizedPLPercentage: new Decimal(0),
      };
    }

    const marketValue = Q.times(P);
    const unrealizedPL = P.minus(A).times(Q);
    const unrealizedPLPercentage = A.gt(0)
      ? P.minus(A).dividedBy(A).times(100)
      : new Decimal(0);

    return {
      marketValue,
      unrealizedPL,
      unrealizedPLPercentage,
    };
  }

  /**
   * Convert IDX Stock lot to shares (1 lot = 100 shares).
   */
  static lotsToShares(lots: string | number | Decimal): Decimal {
    return new Decimal(lots).times(100);
  }

  /**
   * Convert shares to IDX Stock lots (100 shares = 1 lot).
   */
  static sharesToLots(shares: string | number | Decimal): Decimal {
    return new Decimal(shares).dividedBy(100);
  }
}
