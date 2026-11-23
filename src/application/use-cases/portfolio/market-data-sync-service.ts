import { db } from "@/infrastructure/db/client";
import { positions, instruments, valuations } from "@/infrastructure/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Decimal } from "decimal.js";
import { MarketDataService, MarketQuote } from "@/infrastructure/services/market-data-service";

export interface SyncResultItem {
  instrumentId: string;
  symbol: string;
  name: string;
  previousPrice: string;
  newPrice: number;
  changePercent: number;
  currency: string;
}

export interface ManualValuationDTO {
  instrumentId: string;
  price: string | number;
  effectiveAt?: string | Date;
  reason: string;
}

export class MarketDataSyncService {
  /**
   * Sync real-time quotes for all user instruments from free market API.
   * Updates `valuations` table and recalculates `positions` market value & unrealized P/L.
   */
  public static async syncPortfolioQuotes(userId: string): Promise<{
    success: boolean;
    updatedCount: number;
    syncedItems: SyncResultItem[];
  }> {
    // 1. Get all user instruments
    const userInstruments = await db
      .select()
      .from(instruments)
      .where(and(eq(instruments.userId, userId), eq(instruments.isActive, true)));

    if (userInstruments.length === 0) {
      return { success: true, updatedCount: 0, syncedItems: [] };
    }

    const syncedItems: SyncResultItem[] = [];

    // 2. Query quote for each instrument
    for (const inst of userInstruments) {
      const sym = inst.symbol || inst.name;
      if (!sym) continue;

      const quote: MarketQuote | null = await MarketDataService.fetchQuote(sym, inst.assetType);
      if (!quote) continue;

      const valId = `val_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const priceStr = quote.price.toString();

      // 3. Insert valuation record into immutable valuations ledger
      await db.insert(valuations).values({
        id: valId,
        userId,
        instrumentId: inst.id,
        price: priceStr,
        currency: quote.currency || inst.currency || "IDR",
        unit: inst.unit,
        effectiveAt: quote.timestamp,
        fetchedAt: new Date(),
        sourceType: "provider",
        sourceName: quote.source,
        status: "success",
        isManualOverride: false,
      });

      // 4. Update all active positions for this instrument
      const userPositions = await db
        .select()
        .from(positions)
        .where(and(eq(positions.userId, userId), eq(positions.instrumentId, inst.id)));

      if (userPositions.length > 0) {
        for (const pos of userPositions) {
          const qty = new Decimal(pos.quantity || "0");
          const newPrice = new Decimal(quote.price);
          const marketValue = qty.times(newPrice).toFixed(2);
          const totalCostBasis = new Decimal(pos.totalCostBasis || "0");
          const unrealizedPL = new Decimal(marketValue).minus(totalCostBasis).toFixed(2);

          await db
            .update(positions)
            .set({
              currentPrice: priceStr,
              marketValue,
              unrealizedPL,
              lastValuationId: valId,
              updatedAt: new Date(),
            })
            .where(eq(positions.id, pos.id));

          syncedItems.push({
            instrumentId: inst.id,
            symbol: inst.symbol || inst.name,
            name: inst.name,
            previousPrice: pos.currentPrice,
            newPrice: quote.price,
            changePercent: quote.changePercent,
            currency: quote.currency,
          });
        }
      } else {
        syncedItems.push({
          instrumentId: inst.id,
          symbol: inst.symbol || inst.name,
          name: inst.name,
          previousPrice: "0",
          newPrice: quote.price,
          changePercent: quote.changePercent,
          currency: quote.currency,
        });
      }
    }

    return {
      success: true,
      updatedCount: syncedItems.length,
      syncedItems,
    };
  }

  /**
   * Check if any user position has stale quotes (> 24 hours old).
   * If stale, automatically trigger quote sync in background.
   */
  public static async autoSyncIfStale(userId: string): Promise<boolean> {
    try {
      const userPositions = await db
        .select()
        .from(positions)
        .where(eq(positions.userId, userId))
        .limit(10);

      if (userPositions.length === 0) return false;

      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const hasStale = userPositions.some((p) => {
        if (!p.updatedAt) return true;
        return new Date(p.updatedAt).getTime() < oneDayAgo;
      });

      if (hasStale) {
        await this.syncPortfolioQuotes(userId);
        return true;
      }
    } catch (err) {
      console.warn("[MarketDataSyncService] Auto sync check encountered an error:", err);
    }
    return false;
  }

  /**
   * Record a manual valuation override with mandatory audit reason.
   * Updates immutable valuations table and recalculates current positions.
   */
  public static async recordManualValuation(userId: string, dto: ManualValuationDTO) {
    if (!dto.reason?.trim()) {
      throw new Error("Alasan penyesuaian harga (override) wajib diisi untuk catatan audit");
    }

    const priceDec = new Decimal(dto.price || "0");
    if (priceDec.lte(0)) {
      throw new Error("Harga valuasi harus lebih besar dari 0");
    }

    // Verify instrument ownership
    const instList = await db
      .select()
      .from(instruments)
      .where(and(eq(instruments.id, dto.instrumentId), eq(instruments.userId, userId)));

    if (instList.length === 0) {
      throw new Error("Instrumen tidak ditemukan");
    }
    const inst = instList[0];

    const valId = `val_man_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const effectiveAt = dto.effectiveAt ? new Date(dto.effectiveAt) : new Date();
    const priceStr = priceDec.toFixed(4);

    // 1. Insert into immutable valuations ledger
    await db.insert(valuations).values({
      id: valId,
      userId,
      instrumentId: inst.id,
      price: priceStr,
      currency: inst.currency || "IDR",
      unit: inst.unit,
      effectiveAt,
      fetchedAt: new Date(),
      sourceType: "manual",
      sourceName: "User Manual Override",
      status: "overridden",
      isManualOverride: true,
      note: dto.reason.trim(),
    });

    // 2. Update user positions for this instrument
    const userPositions = await db
      .select()
      .from(positions)
      .where(and(eq(positions.userId, userId), eq(positions.instrumentId, inst.id)));

    for (const pos of userPositions) {
      const qty = new Decimal(pos.quantity || "0");
      const marketValue = qty.times(priceDec).toFixed(2);
      const totalCostBasis = new Decimal(pos.totalCostBasis || "0");
      const unrealizedPL = new Decimal(marketValue).minus(totalCostBasis).toFixed(2);

      await db
        .update(positions)
        .set({
          currentPrice: priceStr,
          marketValue,
          unrealizedPL,
          lastValuationId: valId,
          updatedAt: new Date(),
        })
        .where(eq(positions.id, pos.id));
    }

    return {
      valuationId: valId,
      newPrice: priceStr,
      instrumentName: inst.name,
    };
  }

  /**
   * Get immutable valuation history for an instrument.
   */
  public static async getValuationHistory(userId: string, instrumentId: string, limit: number = 30) {
    return await db
      .select()
      .from(valuations)
      .where(and(eq(valuations.userId, userId), eq(valuations.instrumentId, instrumentId)))
      .orderBy(desc(valuations.effectiveAt), desc(valuations.createdAt))
      .limit(limit);
  }

  /**
   * Sync market quote for a single selected instrument.
   */
  public static async syncSingleInstrumentQuote(userId: string, instrumentId: string) {
    const instList = await db
      .select()
      .from(instruments)
      .where(and(eq(instruments.id, instrumentId), eq(instruments.userId, userId)));

    if (instList.length === 0) throw new Error("Instrumen tidak ditemukan");
    const inst = instList[0];
    const sym = inst.symbol || inst.name;
    if (!sym) throw new Error("Instrumen tidak memiliki kode simbol untuk kuotasi");

    const quote: MarketQuote | null = await MarketDataService.fetchQuote(sym, inst.assetType);
    if (!quote) throw new Error(`Gagal mengambil data pasar untuk ${sym}`);

    const valId = `val_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const priceStr = quote.price.toString();

    await db.insert(valuations).values({
      id: valId,
      userId,
      instrumentId: inst.id,
      price: priceStr,
      currency: quote.currency || inst.currency || "IDR",
      unit: inst.unit,
      effectiveAt: quote.timestamp,
      fetchedAt: new Date(),
      sourceType: "provider",
      sourceName: quote.source,
      status: "success",
      isManualOverride: false,
    });

    const userPositions = await db
      .select()
      .from(positions)
      .where(and(eq(positions.userId, userId), eq(positions.instrumentId, inst.id)));

    for (const pos of userPositions) {
      const qty = new Decimal(pos.quantity || "0");
      const newPrice = new Decimal(quote.price);
      const marketValue = qty.times(newPrice).toFixed(2);
      const totalCostBasis = new Decimal(pos.totalCostBasis || "0");
      const unrealizedPL = new Decimal(marketValue).minus(totalCostBasis).toFixed(2);

      await db
        .update(positions)
        .set({
          currentPrice: priceStr,
          marketValue,
          unrealizedPL,
          lastValuationId: valId,
          updatedAt: new Date(),
        })
        .where(eq(positions.id, pos.id));
    }

    return {
      success: true,
      newPrice: quote.price,
      changePercent: quote.changePercent,
      source: quote.source,
    };
  }
}

