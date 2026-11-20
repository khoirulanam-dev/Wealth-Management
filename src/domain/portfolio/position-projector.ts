import { Decimal } from "decimal.js";
import { CostBasisEngine } from "./cost-basis";

export interface LedgerTransaction {
  id: string;
  type: string; // buy, sell, subscription, redemption, etc.
  status: string; // posted, draft, voided
  tradeDate: Date | string;
  quantity: string | number | Decimal;
  unitPrice: string | number | Decimal;
  grossAmount?: string | number | Decimal;
  reversalOfId?: string | null;
  createdAt?: Date | string;
}

export interface ProjectedPosition {
  instrumentId: string;
  accountId: string;
  quantity: Decimal;
  averageCostPerUnit: Decimal;
  totalCostBasis: Decimal;
  totalRealizedPL: Decimal;
  transactionCount: number;
  closed: boolean;
}

export class PositionProjector {
  /**
   * Replays an array of transactions deterministically to project the position.
   * Transactions are sorted by tradeDate ASC, then createdAt ASC.
   * Voided and draft transactions are excluded.
   */
  static projectPosition(
    instrumentId: string,
    accountId: string,
    transactions: LedgerTransaction[]
  ): ProjectedPosition {
    // 1. Filter only posted transactions
    const validTransactions = transactions.filter((tx) => tx.status === "posted");

    // 2. Sort chronologically
    validTransactions.sort((a, b) => {
      const dateA = new Date(a.tradeDate).getTime();
      const dateB = new Date(b.tradeDate).getTime();
      if (dateA !== dateB) return dateA - dateB;
      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return createdA - createdB;
    });

    let currentQty = new Decimal(0);
    let currentAvgCost = new Decimal(0);
    let totalRealizedPL = new Decimal(0);

    for (const tx of validTransactions) {
      const txType = tx.type.toLowerCase();
      const qty = new Decimal(tx.quantity);
      const price = new Decimal(tx.unitPrice);

      switch (txType) {
        case "buy":
        case "subscription":
        case "deposit_open":
        case "bond_buy": {
          const buyResult = CostBasisEngine.calculateBuy(
            currentQty,
            currentAvgCost,
            qty,
            price
          );
          currentQty = buyResult.newQuantity;
          currentAvgCost = buyResult.newAverageCost;
          break;
        }

        case "sell":
        case "redemption":
        case "bond_sell": {
          const sellResult = CostBasisEngine.calculateSell(
            currentQty,
            currentAvgCost,
            qty,
            price
          );
          currentQty = sellResult.remainingQuantity;
          currentAvgCost = sellResult.remainingAverageCost;
          totalRealizedPL = totalRealizedPL.plus(sellResult.realizedPL);
          break;
        }

        default:
          // Other custom adjustments or unsupported types are handled safely
          break;
      }
    }

    const totalCostBasis = currentQty.times(currentAvgCost);

    return {
      instrumentId,
      accountId,
      quantity: currentQty,
      averageCostPerUnit: currentAvgCost,
      totalCostBasis,
      totalRealizedPL,
      transactionCount: validTransactions.length,
      closed: currentQty.isZero(),
    };
  }
}
