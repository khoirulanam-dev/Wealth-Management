/**
 * Free Market Data Service powered by public finance endpoints.
 * Supports:
 * - Indonesian Stocks (IDX) with automatic .JK symbol resolution (BBCA, BBRI, TLKM, etc.)
 * - US & Global Stocks (AAPL, TSLA, MSFT, etc.)
 * - Commodities: Gold (GC=F / Antam)
 * - Currencies: USD/IDR (USDIDR=X)
 */

export interface MarketQuote {
  symbol: string;
  cleanSymbol: string;
  name?: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  high52?: number;
  low52?: number;
  previousClose?: number;
  timestamp: Date;
  source: string;
}

export interface StockSearchItem {
  symbol: string;
  cleanSymbol: string;
  name: string;
  exchange: string;
  assetType: string;
  currency: string;
}

export class MarketDataService {
  private static quoteCache = new Map<string, { quote: MarketQuote; cachedAt: number }>();
  private static CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

  /**
   * Resolve appropriate ticker symbol for public query.
   * e.g. "BBCA" -> "BBCA.JK", "BBRI" -> "BBRI.JK", "GOLD"/"EMAS" -> "GC=F", "AAPL" -> "AAPL"
   */
  public static resolveQuerySymbol(rawSymbol: string, assetType?: string): string {
    const s = rawSymbol.trim().toUpperCase();

    if (s === "ANTAM" || s === "EMAS" || s === "GOLD" || assetType === "gold") {
      return "GC=F";
    }

    // If it already has an exchange suffix (e.g. BBCA.JK, AAPL)
    if (s.includes(".")) {
      return s;
    }

    // Default Indonesian stock tickers (3-5 uppercase letters) if assetType is stock or undefined
    if (assetType === "stock" || !assetType) {
      // Common US tickers without .JK
      const knownUSTickers = ["AAPL", "MSFT", "GOOGL", "GOOG", "AMZN", "META", "TSLA", "NVDA", "NFLX"];
      if (knownUSTickers.includes(s)) {
        return s;
      }
      return `${s}.JK`;
    }

    return s;
  }

  /**
   * Fetch current quote for a given symbol.
   */
  public static async fetchQuote(rawSymbol: string, assetType?: string): Promise<MarketQuote | null> {
    const querySymbol = this.resolveQuerySymbol(rawSymbol, assetType);
    const cleanSymbol = rawSymbol.trim().toUpperCase().replace(/\.JK$/i, "");

    // Check memory cache
    const cached = this.quoteCache.get(querySymbol);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
      return cached.quote;
    }

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(querySymbol)}?interval=1d&range=1d`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        // If failed with .JK and raw didn't have it, try without .JK (or vice versa)
        if (querySymbol.endsWith(".JK")) {
          const fallbackSym = querySymbol.replace(/\.JK$/i, "");
          return this.fetchDirectQuote(fallbackSym, cleanSymbol);
        }
        return null;
      }

      const data = await response.json();
      const meta = data?.chart?.result?.[0]?.meta;

      if (!meta || typeof meta.regularMarketPrice !== "number") {
        return null;
      }

      let price = meta.regularMarketPrice;
      let currency = meta.currency || "IDR";

      // If Gold futures (GC=F) in USD/troy oz, convert to IDR per gram
      if (querySymbol === "GC=F") {
        const usdRate = await this.getUsdIdrRate();
        // 1 troy oz = 31.1034768 grams
        const pricePerGramUsd = price / 31.1034768;
        price = Math.round(pricePerGramUsd * usdRate);
        currency = "IDR";
      }

      const quote: MarketQuote = {
        symbol: querySymbol,
        cleanSymbol,
        name: meta.shortName || meta.longName || cleanSymbol,
        price,
        currency,
        change: meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose || meta.regularMarketPrice),
        changePercent: meta.regularMarketChangePercent || 0,
        high52: meta.fiftyTwoWeekHigh,
        low52: meta.fiftyTwoWeekLow,
        previousClose: meta.previousClose || meta.chartPreviousClose,
        timestamp: new Date((meta.regularMarketTime || Math.floor(Date.now() / 1000)) * 1000),
        source: "Yahoo Finance Market API",
      };

      this.quoteCache.set(querySymbol, { quote, cachedAt: Date.now() });
      return quote;
    } catch (err) {
      console.error(`[MarketDataService] Failed to fetch quote for ${querySymbol}:`, err);
      return null;
    }
  }

  private static async fetchDirectQuote(sym: string, cleanSymbol: string): Promise<MarketQuote | null> {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1d`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (!response.ok) return null;
      const data = await response.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (!meta || typeof meta.regularMarketPrice !== "number") return null;

      return {
        symbol: sym,
        cleanSymbol,
        name: meta.shortName || meta.longName || cleanSymbol,
        price: meta.regularMarketPrice,
        currency: meta.currency || "USD",
        change: meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose || meta.regularMarketPrice),
        changePercent: meta.regularMarketChangePercent || 0,
        high52: meta.fiftyTwoWeekHigh,
        low52: meta.fiftyTwoWeekLow,
        previousClose: meta.previousClose || meta.chartPreviousClose,
        timestamp: new Date((meta.regularMarketTime || Math.floor(Date.now() / 1000)) * 1000),
        source: "Yahoo Finance Market API",
      };
    } catch {
      return null;
    }
  }

  /**
   * Get USD to IDR exchange rate.
   */
  public static async getUsdIdrRate(): Promise<number> {
    try {
      const url = "https://query1.finance.yahoo.com/v8/finance/chart/USDIDR=X?interval=1d&range=1d";
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (res.ok) {
        const data = await res.json();
        const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (typeof price === "number" && price > 10000) return price;
      }
    } catch (e) {
      console.warn("[MarketDataService] Failed to fetch USD/IDR, using default fallback 16000", e);
    }
    return 16200; // fallback standard rate
  }

  /**
   * Search symbols across Indonesian and global stock markets.
   */
  public static async searchSymbols(query: string): Promise<StockSearchItem[]> {
    const q = query.trim();
    if (!q) return [];

    try {
      const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!res.ok) return [];
      const data = await res.json();
      const quotes = data?.quotes || [];

      return quotes
        .filter((item: { quoteType?: string; symbol?: string }) =>
          item.quoteType === "EQUITY" || item.quoteType === "ETF" || item.quoteType === "MUTUALFUND"
        )
        .map((item: {
          symbol: string;
          shortname?: string;
          longname?: string;
          exchange?: string;
          quoteType?: string;
        }) => {
          const isIdx = item.symbol.endsWith(".JK") || item.exchange === "JKT";
          const cleanSymbol = item.symbol.replace(/\.JK$/i, "");
          return {
            symbol: item.symbol,
            cleanSymbol,
            name: item.longname || item.shortname || cleanSymbol,
            exchange: isIdx ? "IDX" : item.exchange || "GLOBAL",
            assetType: item.quoteType === "MUTUALFUND" ? "mutual_fund" : "stock",
            currency: isIdx ? "IDR" : "USD",
          };
        });
    } catch (err) {
      console.error("[MarketDataService] Search failed:", err);
      return [];
    }
  }

  /**
   * Curated list of top Indonesian blue-chip stocks (LQ45 & High Volume).
   */
  public static getCuratedIndonesianStocks(): StockSearchItem[] {
    return [
      { symbol: "BBCA.JK", cleanSymbol: "BBCA", name: "Bank Central Asia Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "BBRI.JK", cleanSymbol: "BBRI", name: "Bank Rakyat Indonesia (Persero) Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "BMRI.JK", cleanSymbol: "BMRI", name: "Bank Mandiri (Persero) Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "BBNI.JK", cleanSymbol: "BBNI", name: "Bank Negara Indonesia (Persero) Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "TLKM.JK", cleanSymbol: "TLKM", name: "Telkom Indonesia (Persero) Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "ASII.JK", cleanSymbol: "ASII", name: "Astra International Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "ICBP.JK", cleanSymbol: "ICBP", name: "Indofood CBP Sukses Makmur Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "INDF.JK", cleanSymbol: "INDF", name: "Indofood Sukses Makmur Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "UNVR.JK", cleanSymbol: "UNVR", name: "Unilever Indonesia Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "GOTO.JK", cleanSymbol: "GOTO", name: "GoTo Gojek Tokopedia Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "AMMN.JK", cleanSymbol: "AMMN", name: "Amman Mineral Internasional Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "BRPT.JK", cleanSymbol: "BRPT", name: "Barito Pacific Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "KLBF.JK", cleanSymbol: "KLBF", name: "Kalbe Farma Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "ADRO.JK", cleanSymbol: "ADRO", name: "Adaro Energy Indonesia Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "PGAS.JK", cleanSymbol: "PGAS", name: "Perusahaan Gas Negara Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "PTBA.JK", cleanSymbol: "PTBA", name: "Bukit Asam Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "ANTM.JK", cleanSymbol: "ANTM", name: "Aneka Tambang Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "MDKA.JK", cleanSymbol: "MDKA", name: "Merdeka Copper Gold Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "CPIN.JK", cleanSymbol: "CPIN", name: "Charoen Pokphand Indonesia Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
      { symbol: "INKP.JK", cleanSymbol: "INKP", name: "Indah Kiat Pulp & Paper Tbk", exchange: "IDX", assetType: "stock", currency: "IDR" },
    ];
  }
}

