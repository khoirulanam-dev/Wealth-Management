import { db } from "@/infrastructure/db/client";
import { positions, instruments, financialAccounts } from "@/infrastructure/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { Decimal } from "decimal.js";

export class HoldingsService {
  /**
   * Get all active positions (quantity > 0) with instrument and account details.
   */
  static async listActiveHoldings(userId: string) {
    const rawPositions = await db
      .select({
        positionId: positions.id,
        instrumentId: instruments.id,
        instrumentName: instruments.name,
        instrumentSymbol: instruments.symbol,
        assetType: instruments.assetType,
        unit: instruments.unit,
        market: instruments.market,
        accountId: financialAccounts.id,
        accountName: financialAccounts.name,
        institution: financialAccounts.institution,
        quantity: positions.quantity,
        averageCostPerUnit: positions.averageCostPerUnit,
        totalCostBasis: positions.totalCostBasis,
        currentPrice: positions.currentPrice,
        marketValue: positions.marketValue,
        unrealizedPL: positions.unrealizedPL,
        updatedAt: positions.updatedAt,
      })
      .from(positions)
      .innerJoin(instruments, eq(positions.instrumentId, instruments.id))
      .innerJoin(financialAccounts, eq(positions.accountId, financialAccounts.id))
      .where(and(eq(positions.userId, userId), gt(positions.quantity, "0")));

    // Compute portfolio totals
    let totalMarketValue = new Decimal(0);
    let totalCostBasis = new Decimal(0);

    const assetBreakdownMap = new Map<string, Decimal>();

    const holdings = rawPositions.map((p) => {
      const mv = new Decimal(p.marketValue || "0");
      const cb = new Decimal(p.totalCostBasis || "0");
      const unpl = new Decimal(p.unrealizedPL || "0");
      const unplPct = cb.gt(0) ? unpl.dividedBy(cb).times(100) : new Decimal(0);

      totalMarketValue = totalMarketValue.plus(mv);
      totalCostBasis = totalCostBasis.plus(cb);

      const existingClass = assetBreakdownMap.get(p.assetType) || new Decimal(0);
      assetBreakdownMap.set(p.assetType, existingClass.plus(mv));

      return {
        ...p,
        unrealizedPLPercentage: unplPct.toFixed(2),
      };
    });

    const totalUnrealizedPL = totalMarketValue.minus(totalCostBasis);
    const totalUnrealizedPLPercentage = totalCostBasis.gt(0)
      ? totalUnrealizedPL.dividedBy(totalCostBasis).times(100)
      : new Decimal(0);

    const assetBreakdown = Array.from(assetBreakdownMap.entries()).map(([assetType, value]) => ({
      assetType,
      value: value.toNumber(),
      percentage: totalMarketValue.gt(0)
        ? value.dividedBy(totalMarketValue).times(100).toFixed(1)
        : "0.0",
    }));

    return {
      holdings,
      summary: {
        totalMarketValue: totalMarketValue.toFixed(2),
        totalCostBasis: totalCostBasis.toFixed(2),
        totalUnrealizedPL: totalUnrealizedPL.toFixed(2),
        totalUnrealizedPLPercentage: totalUnrealizedPLPercentage.toFixed(2),
        positionCount: holdings.length,
      },
      assetBreakdown,
    };
  }
}
