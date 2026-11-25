import { db } from "@/infrastructure/db/client";
import { instruments, watchlistItems, valuations } from "@/infrastructure/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { MarketDataService, MarketQuote } from "@/infrastructure/services/market-data-service";

export interface AddWatchlistDTO {
  symbol: string;
  name: string;
  assetType: string;
  market?: string;
  currency?: string;
  note?: string;
  price?: number;
  changePercent?: number;
  change?: number;
}

export interface WatchlistItemDetail {
  id: string;
  instrumentId: string;
  symbol: string | null;
  name: string;
  assetType: string;
  market: string | null;
  currency: string;
  unit: string;
  note: string | null;
  addedAt: Date;
  latestPrice: string | null;
  latestEffectiveAt: Date | null;
  sourceName: string | null;
  isManualOverride: boolean;
  changePercent?: number | null;
  change?: number | null;
}

export class WatchlistService {
  /**
   * Add an instrument to the user's watchlist.
   * Isolates watchlist items so they do not impact portfolio positions or Net Worth.
   */
  public static async addToWatchlist(userId: string, dto: AddWatchlistDTO) {
    const sym = dto.symbol.trim().toUpperCase();
    const name = dto.name.trim();

    if (!sym && !name) {
      throw new Error("Simbol atau nama instrumen pantauan wajib diisi");
    }

    // 1. Check if instrument exists for this user
    let instrumentId: string;
    const existingInst = await db
      .select()
      .from(instruments)
      .where(
        and(
          eq(instruments.userId, userId),
          sym ? eq(instruments.symbol, sym) : eq(instruments.name, name)
        )
      );

    if (existingInst.length > 0) {
      instrumentId = existingInst[0].id;
    } else {
      // Create new instrument record
      instrumentId = `inst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      let unit = "share";
      if (dto.assetType === "mutual_fund") unit = "unit";
      if (dto.assetType === "gold") unit = "gram";
      if (dto.assetType === "crypto") unit = "coin";

      await db.insert(instruments).values({
        id: instrumentId,
        userId,
        name,
        symbol: sym || null,
        assetType: dto.assetType,
        market: dto.market || (dto.assetType === "crypto" ? "Crypto" : "IDX"),
        currency: dto.currency || "IDR",
        unit,
        isActive: true,
      });
    }

    // 2. Check if already on watchlist
    const existingWatch = await db
      .select()
      .from(watchlistItems)
      .where(
        and(
          eq(watchlistItems.userId, userId),
          eq(watchlistItems.instrumentId, instrumentId)
        )
      );

    if (existingWatch.length > 0) {
      throw new Error(`Instrumen ${sym || name} sudah ada di dalam daftar pantauan`);
    }

    // 3. Fast valuation quote assignment (zero network latency if price known)
    if (typeof dto.price === "number" && dto.price > 0) {
      const valId = `val_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const noteMeta = typeof dto.changePercent === "number"
        ? JSON.stringify({ changePercent: dto.changePercent, change: dto.change ?? null })
        : null;
      await db.insert(valuations).values({
        id: valId,
        userId,
        instrumentId,
        price: dto.price.toString(),
        currency: dto.currency || "IDR",
        unit: dto.assetType === "gold" ? "gram" : dto.assetType === "mutual_fund" ? "unit" : "share",
        effectiveAt: new Date(),
        fetchedAt: new Date(),
        sourceType: "provider",
        sourceName: "Live Market Feed",
        status: "success",
        isManualOverride: false,
        note: noteMeta,
      });
    } else {
      // Fast bounded quote fetch (max 800ms) so saving to watchlist is NEVER stalled
      try {
        const quotePromise = MarketDataService.fetchQuote(sym || name, dto.assetType);
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 800));
        const quote = await Promise.race([quotePromise, timeoutPromise]);
        if (quote) {
          const valId = `val_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const noteMeta = typeof quote.changePercent === "number"
            ? JSON.stringify({ changePercent: quote.changePercent, change: quote.change ?? null, previousClose: quote.previousClose ?? null })
            : null;
          await db.insert(valuations).values({
            id: valId,
            userId,
            instrumentId,
            price: quote.price.toString(),
            currency: quote.currency || dto.currency || "IDR",
            unit: dto.assetType === "gold" ? "gram" : dto.assetType === "mutual_fund" ? "unit" : "share",
            effectiveAt: quote.timestamp,
            fetchedAt: new Date(),
            sourceType: "provider",
            sourceName: quote.source,
            status: "success",
            isManualOverride: false,
            note: noteMeta,
          });
        }
      } catch {
        // Quote fetch failure does not block adding to watchlist
      }
    }

    // 4. Insert into watchlist_items
    const watchId = `watch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(watchlistItems).values({
      id: watchId,
      userId,
      instrumentId,
      note: dto.note?.trim() || null,
      addedAt: new Date(),
    });

    return { watchlistId: watchId, instrumentId };
  }

  /**
   * Add multiple instruments to watchlist in a fast batch.
   */
  public static async addBatchToWatchlist(userId: string, items: AddWatchlistDTO[]) {
    if (!items || items.length === 0) {
      throw new Error("Pilih setidaknya satu instrumen untuk ditambahkan");
    }

    const added: string[] = [];
    const skipped: string[] = [];

    for (const item of items) {
      try {
        await this.addToWatchlist(userId, item);
        added.push(item.symbol || item.name);
      } catch {
        // Already exists or invalid item is skipped gracefully
        skipped.push(item.symbol || item.name);
      }
    }

    return {
      addedCount: added.length,
      skippedCount: skipped.length,
      added,
      skipped,
    };
  }

  /**
   * Remove an item from the user's watchlist.
   */
  public static async removeFromWatchlist(userId: string, watchlistItemId: string) {
    const existing = await db
      .select()
      .from(watchlistItems)
      .where(and(eq(watchlistItems.id, watchlistItemId), eq(watchlistItems.userId, userId)));

    if (existing.length === 0) {
      throw new Error("Item pantauan tidak ditemukan");
    }

    await db.delete(watchlistItems).where(eq(watchlistItems.id, watchlistItemId));
    return { success: true };
  }

  /**
   * List all watchlist items for user with latest quote metadata.
   */
  public static async listWatchlist(userId: string): Promise<WatchlistItemDetail[]> {
    const items = await db
      .select({
        id: watchlistItems.id,
        instrumentId: watchlistItems.instrumentId,
        note: watchlistItems.note,
        addedAt: watchlistItems.addedAt,
        name: instruments.name,
        symbol: instruments.symbol,
        assetType: instruments.assetType,
        market: instruments.market,
        currency: instruments.currency,
        unit: instruments.unit,
      })
      .from(watchlistItems)
      .innerJoin(instruments, eq(watchlistItems.instrumentId, instruments.id))
      .where(eq(watchlistItems.userId, userId))
      .orderBy(desc(watchlistItems.addedAt));

    const result: WatchlistItemDetail[] = [];

    for (const item of items) {
      // Get latest valuations for this instrument (get 2 to calculate historical delta if available)
      const recentVals = await db
        .select()
        .from(valuations)
        .where(and(eq(valuations.userId, userId), eq(valuations.instrumentId, item.instrumentId)))
        .orderBy(desc(valuations.effectiveAt), desc(valuations.createdAt))
        .limit(2);

      let changePercent: number | null = null;
      let change: number | null = null;

      // 1. Check if latest valuation note has saved change percent metadata
      if (recentVals.length > 0 && recentVals[0].note) {
        try {
          const parsed = JSON.parse(recentVals[0].note);
          if (typeof parsed.changePercent === "number") {
            changePercent = parsed.changePercent;
            change = parsed.change ?? null;
          }
        } catch {
          // not JSON note
        }
      }

      // 2. If no note metadata, check historical valuations
      if (changePercent === null && recentVals.length >= 2) {
        const curr = parseFloat(recentVals[0].price);
        const prev = parseFloat(recentVals[1].price);
        if (prev > 0) {
          change = curr - prev;
          changePercent = ((curr - prev) / prev) * 100;
        }
      }

      // 3. If still null, check in-memory MarketDataService quoteCache
      if (changePercent === null && (item.symbol || item.name)) {
        const cached = MarketDataService.getCachedQuote(item.symbol || item.name, item.assetType);
        if (cached && typeof cached.changePercent === "number") {
          changePercent = cached.changePercent;
          change = cached.change ?? null;
        }
      }

      result.push({
        id: item.id,
        instrumentId: item.instrumentId,
        symbol: item.symbol,
        name: item.name,
        assetType: item.assetType,
        market: item.market,
        currency: item.currency,
        unit: item.unit,
        note: item.note,
        addedAt: item.addedAt,
        latestPrice: recentVals.length > 0 ? recentVals[0].price : null,
        latestEffectiveAt: recentVals.length > 0 ? recentVals[0].effectiveAt : null,
        sourceName: recentVals.length > 0 ? recentVals[0].sourceName : null,
        isManualOverride: recentVals.length > 0 ? recentVals[0].isManualOverride : false,
        changePercent,
        change,
      });
    }

    return result;
  }

  /**
   * Refresh quotes for all watchlisted items in parallel.
   */
  public static async refreshWatchlistQuotes(userId: string) {
    const list = await this.listWatchlist(userId);

    const outcomes = await Promise.allSettled(
      list.map(async (item) => {
        const sym = item.symbol || item.name;
        if (!sym) return false;

        try {
          const quote: MarketQuote | null = await MarketDataService.fetchQuote(sym, item.assetType);
          if (quote) {
            const valId = `val_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const noteMeta = typeof quote.changePercent === "number"
              ? JSON.stringify({ changePercent: quote.changePercent, change: quote.change ?? null, previousClose: quote.previousClose ?? null })
              : null;
            await db.insert(valuations).values({
              id: valId,
              userId,
              instrumentId: item.instrumentId,
              price: quote.price.toString(),
              currency: quote.currency || item.currency,
              unit: item.unit,
              effectiveAt: quote.timestamp,
              fetchedAt: new Date(),
              sourceType: "provider",
              sourceName: quote.source,
              status: "success",
              isManualOverride: false,
              note: noteMeta,
            });
            return true;
          }
        } catch (err) {
          console.warn(`[WatchlistService] Gagal memperbarui kuotasi ${sym}:`, err);
        }
        return false;
      })
    );

    const updatedCount = outcomes.filter((o) => o.status === "fulfilled" && o.value === true).length;
    return { updatedCount, total: list.length };
  }
}

