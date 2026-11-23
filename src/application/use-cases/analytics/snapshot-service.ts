import { db } from "@/infrastructure/db/client";
import { snapshots } from "@/infrastructure/db/schema/snapshots";
import { users } from "@/infrastructure/db/schema/users";
import { eq, and, asc, gte } from "drizzle-orm";
import { HoldingsService } from "@/application/use-cases/portfolio/holdings-service";
import { CashService } from "@/application/use-cases/cash/cash-service";
import { LiabilityService } from "@/application/use-cases/liabilities/liability-service";
import { IncomeService } from "@/application/use-cases/income/income-service";
import { Decimal } from "decimal.js";

export interface SnapshotBreakdown {
  assetAllocation: Array<{
    name: string;
    assetType: string;
    value: string;
    percentage: number;
    color?: string;
  }>;
  institutionAllocation: Array<{
    name: string;
    value: string;
    percentage: number;
  }>;
  topHoldings: Array<{
    symbol: string | null;
    name: string;
    marketValue: string;
    percentage: number;
  }>;
}

export interface AnalyticsSummary {
  netWorth: string;
  totalInvestments: string;
  totalCash: string;
  totalLiabilities: string;
  totalCostBasis: string;
  totalUnrealizedPL: string;
  totalUnrealizedPLPercentage: string;
  totalRealizedIncomeYTD: string;
  emergencyFundBalance: string;
  liquidityRatio: number; // Cash / Total Net Worth %
  debtToAssetRatio: number; // Liabilities / Total Assets %
  assetAllocation: Array<{
    name: string;
    assetType: string;
    value: string;
    percentage: number;
    color: string;
  }>;
  institutionAllocation: Array<{
    name: string;
    value: string;
    percentage: number;
  }>;
  contributionsVsGains: {
    totalCapitalInvested: string; // Net contributions
    totalMarketGain: string; // Total Unrealized P/L + Realized Income
    gainPercentage: number;
  };
}

export class SnapshotService {
  /**
   * Captures or updates a daily financial snapshot for the user.
   * Calculates net worth: Investments + Cash - Liabilities.
   * Watchlist items and forecast income are strictly excluded from net worth.
   */
  static async captureSnapshot(userId: string, targetDate = new Date()) {
    // Normalize date to start of UTC day for daily snapshot uniqueness
    const snapshotDate = new Date(
      Date.UTC(
        targetDate.getUTCFullYear(),
        targetDate.getUTCMonth(),
        targetDate.getUTCDate(),
        0,
        0,
        0,
        0
      )
    );

    // Fetch user and all financial domain data in a single parallel roundtrip
    const [
      [user],
      { holdings, summary: holdingSummary, assetBreakdown },
      cashSummary,
      cashAccounts,
      liabilitySummary,
      [existing],
    ] = await Promise.all([
      db.select({ reportingCurrency: users.reportingCurrency }).from(users).where(eq(users.id, userId)),
      HoldingsService.listActiveHoldings(userId),
      CashService.getCashSummary(userId),
      CashService.listCashAccounts(userId),
      LiabilityService.getSummary(userId),
      db
        .select({ id: snapshots.id })
        .from(snapshots)
        .where(
          and(
            eq(snapshots.userId, userId),
            eq(snapshots.snapshotDate, snapshotDate)
          )
        ),
    ]);

    const reportingCurrency = user?.reportingCurrency || "IDR";

    const totalInvestments = new Decimal(holdingSummary.totalMarketValue || 0);
    const totalCash = new Decimal(cashSummary.totalCashBalance || 0);
    const totalLiabilities = new Decimal(liabilitySummary.totalOutstanding || 0);

    // Strict Net Worth formula: Investments + Cash - Liabilities
    const netWorth = totalInvestments.plus(totalCash).minus(totalLiabilities);
    const totalAssets = totalInvestments.plus(totalCash);

    // 3. Construct unified asset allocation (Investments + Cash)
    const combinedAllocation: SnapshotBreakdown["assetAllocation"] = [];

    // Add investment asset classes
    for (const item of assetBreakdown) {
      const val = new Decimal(item.value);
      const pct = totalAssets.gt(0)
        ? val.dividedBy(totalAssets).times(100).toDecimalPlaces(2).toNumber()
        : 0;

      let label = item.assetType;
      let color = "#3B82F6"; // default blue
      if (item.assetType === "stock") {
        label = "Saham";
        color = "#2563EB";
      } else if (item.assetType === "mutual_fund") {
        label = "Reksa Dana";
        color = "#10B981";
      } else if (item.assetType === "gold") {
        label = "Emas Fisik";
        color = "#F59E0B";
      } else if (item.assetType === "crypto") {
        label = "Kripto";
        color = "#F97316";
      } else if (item.assetType === "bond") {
        label = "Obligasi / SBN";
        color = "#6366F1";
      }

      combinedAllocation.push({
        name: label,
        assetType: item.assetType,
        value: val.toFixed(2),
        percentage: pct,
        color,
      });
    }

    // Add Cash as an explicit asset class
    if (totalCash.gt(0)) {
      const cashPct = totalAssets.gt(0)
        ? totalCash.dividedBy(totalAssets).times(100).toDecimalPlaces(2).toNumber()
        : 0;
      combinedAllocation.push({
        name: "Kas & Likuid",
        assetType: "cash",
        value: totalCash.toFixed(2),
        percentage: cashPct,
        color: "#8B5CF6",
      });
    }

    // Sort descending by value
    combinedAllocation.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

    // 4. Construct institution allocation (Banks + Brokers)
    const institutionMap = new Map<string, Decimal>();

    // Add brokers from holdings
    for (const h of holdings) {
      const instName = h.institution || "Sekuritas";
      const current = institutionMap.get(instName) || new Decimal(0);
      institutionMap.set(instName, current.plus(h.marketValue));
    }

    // Add banks from cash accounts
    for (const c of cashAccounts) {
      const bankName = c.institution || "Bank";
      const current = institutionMap.get(bankName) || new Decimal(0);
      institutionMap.set(bankName, current.plus(c.currentBalance));
    }

    const institutionAllocation: SnapshotBreakdown["institutionAllocation"] = [];
    for (const [name, val] of institutionMap.entries()) {
      if (val.gt(0)) {
        const pct = totalAssets.gt(0)
          ? val.dividedBy(totalAssets).times(100).toDecimalPlaces(2).toNumber()
          : 0;
        institutionAllocation.push({
          name,
          value: val.toFixed(2),
          percentage: pct,
        });
      }
    }
    institutionAllocation.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

    // 5. Top 5 Holdings
    const topHoldings: SnapshotBreakdown["topHoldings"] = holdings
      .slice(0, 5)
      .map((h: (typeof holdings)[number]) => {
        const val = new Decimal(h.marketValue);
        const pct = totalInvestments.gt(0)
          ? val.dividedBy(totalInvestments).times(100).toDecimalPlaces(2).toNumber()
          : 0;
        return {
          symbol: h.instrumentSymbol,
          name: h.instrumentName,
          marketValue: val.toFixed(2),
          percentage: pct,
        };
      });

    const breakdown: SnapshotBreakdown = {
      assetAllocation: combinedAllocation,
      institutionAllocation,
      topHoldings,
    };

    const snapshotId = `snp_${userId.slice(-6)}_${snapshotDate.toISOString().slice(0, 10).replace(/-/g, "")}`;

    if (existing) {
      // Update today's snapshot in-place with latest valuations
      const [updated] = await db
        .update(snapshots)
        .set({
          totalInvestments: totalInvestments.toFixed(2),
          totalCash: totalCash.toFixed(2),
          totalLiabilities: totalLiabilities.toFixed(2),
          netWorth: netWorth.toFixed(2),
          breakdown,
        })
        .where(eq(snapshots.id, existing.id))
        .returning();

      return updated;
    }

    // Insert new immutable snapshot
    const [created] = await db
      .insert(snapshots)
      .values({
        id: snapshotId,
        userId,
        snapshotDate,
        reportingCurrency,
        totalInvestments: totalInvestments.toFixed(2),
        totalCash: totalCash.toFixed(2),
        totalLiabilities: totalLiabilities.toFixed(2),
        netWorth: netWorth.toFixed(2),
        breakdown,
      })
      .returning();

    return created;
  }

  /**
   * Retrieves historical snapshots for plotting charts with date range filtering.
   */
  static async listSnapshots(userId: string, range = "all") {
    let startDate: Date | undefined;
    const now = new Date();

    if (range === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "30d" || range === "1m") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === "90d" || range === "3m") {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (range === "1y") {
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    const conditions = [eq(snapshots.userId, userId)];
    if (startDate) {
      conditions.push(gte(snapshots.snapshotDate, startDate));
    }

    let records = await db
      .select()
      .from(snapshots)
      .where(and(...conditions))
      .orderBy(asc(snapshots.snapshotDate));

    // If no snapshots exist yet, automatically capture one for today
    if (records.length === 0) {
      const todaySnap = await this.captureSnapshot(userId, now);
      records = [todaySnap];
    }

    return records.map((s) => ({
      id: s.id,
      date: s.snapshotDate.toISOString().slice(0, 10),
      displayDate: s.snapshotDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
      totalInvestments: parseFloat(s.totalInvestments),
      totalCash: parseFloat(s.totalCash),
      totalLiabilities: parseFloat(s.totalLiabilities),
      netWorth: parseFloat(s.netWorth),
      breakdown: s.breakdown as SnapshotBreakdown,
    }));
  }

  /**
   * Computes comprehensive analytics separating net capital contributions from market returns.
   */
  static async getAnalytics(userId: string): Promise<AnalyticsSummary> {
    const [
      { summary: holdingSummary, assetBreakdown },
      cashSummary,
      cashAccounts,
      liabilitySummary,
      incomeSummary,
    ] = await Promise.all([
      HoldingsService.listActiveHoldings(userId),
      CashService.getCashSummary(userId),
      CashService.listCashAccounts(userId),
      LiabilityService.getSummary(userId),
      IncomeService.getSummary(userId),
    ]);

    const totalInvestments = new Decimal(holdingSummary.totalMarketValue || 0);
    const totalCash = new Decimal(cashSummary.totalCashBalance || 0);
    const totalLiabilities = new Decimal(liabilitySummary.totalOutstanding || 0);
    const netWorth = totalInvestments.plus(totalCash).minus(totalLiabilities);
    const totalAssets = totalInvestments.plus(totalCash);

    const totalCostBasis = new Decimal(holdingSummary.totalCostBasis || 0);
    const totalUnrealizedPL = new Decimal(holdingSummary.totalUnrealizedPL || 0);
    const totalRealizedIncomeYTD = new Decimal(incomeSummary.totalRealizedYTD || 0);

    // Total Capital Invested (Net Principal Contributed): Cost Basis of investments + Current Cash Balance
    const totalCapitalInvested = totalCostBasis.plus(totalCash);

    // Total Market Gain: Capital Appreciation (Unrealized P/L) + Realized Income
    const totalMarketGain = totalUnrealizedPL.plus(totalRealizedIncomeYTD);

    const gainPercentage = totalCapitalInvested.gt(0)
      ? totalMarketGain.dividedBy(totalCapitalInvested).times(100).toDecimalPlaces(2).toNumber()
      : 0;

    // Ratios
    const liquidityRatio = netWorth.gt(0)
      ? totalCash.dividedBy(netWorth).times(100).toDecimalPlaces(2).toNumber()
      : 0;

    const debtToAssetRatio = totalAssets.gt(0)
      ? totalLiabilities.dividedBy(totalAssets).times(100).toDecimalPlaces(2).toNumber()
      : 0;

    // Asset allocation
    const assetAllocation: AnalyticsSummary["assetAllocation"] = [];
    for (const item of assetBreakdown) {
      const val = new Decimal(item.value);
      const pct = totalAssets.gt(0)
        ? val.dividedBy(totalAssets).times(100).toDecimalPlaces(2).toNumber()
        : 0;

      let label = item.assetType;
      let color = "#3B82F6";
      if (item.assetType === "stock") {
        label = "Saham";
        color = "#2563EB";
      } else if (item.assetType === "mutual_fund") {
        label = "Reksa Dana";
        color = "#10B981";
      } else if (item.assetType === "gold") {
        label = "Emas Fisik";
        color = "#F59E0B";
      } else if (item.assetType === "crypto") {
        label = "Kripto";
        color = "#F97316";
      } else if (item.assetType === "bond") {
        label = "Obligasi";
        color = "#6366F1";
      }

      assetAllocation.push({
        name: label,
        assetType: item.assetType,
        value: val.toFixed(2),
        percentage: pct,
        color,
      });
    }

    if (totalCash.gt(0)) {
      const cashPct = totalAssets.gt(0)
        ? totalCash.dividedBy(totalAssets).times(100).toDecimalPlaces(2).toNumber()
        : 0;
      assetAllocation.push({
        name: "Kas & Likuid",
        assetType: "cash",
        value: totalCash.toFixed(2),
        percentage: cashPct,
        color: "#8B5CF6",
      });
    }
    assetAllocation.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

    // Institution allocation
    const instMap = new Map<string, Decimal>();
    for (const a of cashAccounts) {
      const name = a.institution || "Bank";
      const cur = instMap.get(name) || new Decimal(0);
      instMap.set(name, cur.plus(a.currentBalance));
    }

    const institutionAllocation: AnalyticsSummary["institutionAllocation"] = [];
    for (const [name, val] of instMap.entries()) {
      if (val.gt(0)) {
        const pct = totalAssets.gt(0)
          ? val.dividedBy(totalAssets).times(100).toDecimalPlaces(2).toNumber()
          : 0;
        institutionAllocation.push({
          name,
          value: val.toFixed(2),
          percentage: pct,
        });
      }
    }
    institutionAllocation.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

    return {
      netWorth: netWorth.toFixed(2),
      totalInvestments: totalInvestments.toFixed(2),
      totalCash: totalCash.toFixed(2),
      totalLiabilities: totalLiabilities.toFixed(2),
      totalCostBasis: totalCostBasis.toFixed(2),
      totalUnrealizedPL: totalUnrealizedPL.toFixed(2),
      totalUnrealizedPLPercentage: holdingSummary.totalUnrealizedPLPercentage || "0.00",
      totalRealizedIncomeYTD: totalRealizedIncomeYTD.toFixed(2),
      emergencyFundBalance: cashSummary.emergencyFundCurrent || "0",
      liquidityRatio,
      debtToAssetRatio,
      assetAllocation,
      institutionAllocation,
      contributionsVsGains: {
        totalCapitalInvested: totalCapitalInvested.toFixed(2),
        totalMarketGain: totalMarketGain.toFixed(2),
        gainPercentage,
      },
    };
  }
}
