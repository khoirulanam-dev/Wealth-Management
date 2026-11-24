import { Decimal } from "@/lib/decimal";
import { MarketDataService } from "@/infrastructure/services/market-data-service";

export interface FxRateResult {
  rate: number;
  pair: string;
  source: string;
  updatedAt: Date;
}

export class CurrencyService {
  private static ratesCache = new Map<string, { rate: number; updatedAt: number }>();
  private static CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

  // Static fallback rates if network/live quote is temporarily unavailable
  private static FALLBACK_RATES: Record<string, number> = {
    USD: 16250, // 1 USD = Rp 16.250
    SGD: 12150, // 1 SGD = Rp 12.150
    EUR: 17650, // 1 EUR = Rp 17.650
    IDR: 1,
  };

  /**
   * Fetches real-time exchange rate for target currency against IDR (base: IDR).
   * Returns how many IDR is 1 unit of foreign currency. (e.g. for USD: 18,158)
   */
  public static async getRateAgainstIdr(targetCurrency: string): Promise<number> {
    const cur = targetCurrency.toUpperCase().trim();
    if (cur === "IDR") return 1;

    const cacheKey = `${cur}IDR`;
    const cached = this.ratesCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.updatedAt < this.CACHE_TTL_MS) {
      return cached.rate;
    }

    try {
      const pair = `${cur}IDR=X`;
      const quote = await MarketDataService.fetchQuote(pair, "currency");

      if (quote && quote.price > 0) {
        this.ratesCache.set(cacheKey, {
          rate: quote.price,
          updatedAt: now,
        });
        return quote.price;
      }
    } catch (err) {
      console.warn(`[CurrencyService] Gagal mengambil kurs live untuk ${cur}IDR, menggunakan fallback:`, err);
    }

    const fallback = this.FALLBACK_RATES[cur] || 1;
    this.ratesCache.set(cacheKey, { rate: fallback, updatedAt: now });
    return fallback;
  }

  /**
   * Converts an amount from a source currency to the target currency.
   * By default, fromCurrency is IDR.
   */
  public static async convert(
    amount: Decimal.Value,
    toCurrency: string = "IDR",
    fromCurrency: string = "IDR"
  ): Promise<Decimal> {
    const from = fromCurrency.toUpperCase().trim();
    const to = toCurrency.toUpperCase().trim();
    const decAmount = new Decimal(amount || 0);

    if (from === to) {
      return decAmount;
    }

    // Step 1: Convert from source currency to IDR
    let amountInIdr = decAmount;
    if (from !== "IDR") {
      const fromRate = await this.getRateAgainstIdr(from);
      amountInIdr = decAmount.times(fromRate);
    }

    // Step 2: Convert from IDR to target currency
    if (to === "IDR") {
      return amountInIdr;
    }

    const toRate = await this.getRateAgainstIdr(to);
    if (toRate <= 0) return amountInIdr;

    return amountInIdr.dividedBy(toRate);
  }

  /**
   * Synchronous conversion using latest cached rate or fallback.
   */
  public static convertSync(
    amount: Decimal.Value,
    toCurrency: string = "IDR",
    fromCurrency: string = "IDR"
  ): Decimal {
    const from = fromCurrency.toUpperCase().trim();
    const to = toCurrency.toUpperCase().trim();
    const decAmount = new Decimal(amount || 0);

    if (from === to) return decAmount;

    let amountInIdr = decAmount;
    if (from !== "IDR") {
      const cachedFrom = this.ratesCache.get(`${from}IDR`)?.rate || this.FALLBACK_RATES[from] || 1;
      amountInIdr = decAmount.times(cachedFrom);
    }

    if (to === "IDR") return amountInIdr;

    const cachedTo = this.ratesCache.get(`${to}IDR`)?.rate || this.FALLBACK_RATES[to] || 1;
    return amountInIdr.dividedBy(cachedTo);
  }

  /**
   * Returns a summary description of the exchange rate (e.g. "1 USD = Rp 18.158").
   */
  public static async getExchangeRateBadge(targetCurrency: string): Promise<string | null> {
    const cur = targetCurrency.toUpperCase().trim();
    if (cur === "IDR") return null;

    const rate = await this.getRateAgainstIdr(cur);
    return `1 ${cur} = Rp ${Math.round(rate).toLocaleString("id-ID")}`;
  }
}
