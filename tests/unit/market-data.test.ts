import { describe, it, expect } from "vitest";
import { MarketDataService } from "@/infrastructure/services/market-data-service";
import { searchLocalRegistry } from "@/infrastructure/services/market-instruments-registry";

describe("MarketDataService Unit Tests", () => {
  it("resolves ticker symbols appropriately for IDX and global markets", () => {
    // IDX stocks should append .JK if not present (covers all small/mid/mega caps)
    expect(MarketDataService.resolveQuerySymbol("BBCA", "stock")).toBe("BBCA.JK");
    expect(MarketDataService.resolveQuerySymbol("BBRI", "stock")).toBe("BBRI.JK");
    expect(MarketDataService.resolveQuerySymbol("BREN", "stock")).toBe("BREN.JK");
    expect(MarketDataService.resolveQuerySymbol("CUAN", "stock")).toBe("CUAN.JK");
    expect(MarketDataService.resolveQuerySymbol("AALI", "stock")).toBe("AALI.JK");
    expect(MarketDataService.resolveQuerySymbol("ZYRX", "stock")).toBe("ZYRX.JK");
    expect(MarketDataService.resolveQuerySymbol("TLKM.JK", "stock")).toBe("TLKM.JK");

    // US stocks should remain as-is
    expect(MarketDataService.resolveQuerySymbol("AAPL", "stock")).toBe("AAPL");
    expect(MarketDataService.resolveQuerySymbol("TSLA", "stock")).toBe("TSLA");

    // Gold commodities
    expect(MarketDataService.resolveQuerySymbol("ANTAM", "gold")).toBe("GC=F");
    expect(MarketDataService.resolveQuerySymbol("GOLD", "gold")).toBe("GC=F");

    // Crypto assets
    expect(MarketDataService.resolveQuerySymbol("BTC", "crypto")).toBe("BTC-USD");
    expect(MarketDataService.resolveQuerySymbol("ETH", "crypto")).toBe("ETH-USD");
  });

  it("provides curated Indonesian stocks with valid structure", () => {
    const list = MarketDataService.getCuratedIndonesianStocks();
    expect(list.length).toBeGreaterThanOrEqual(10);

    const bbca = list.find((s) => s.cleanSymbol === "BBCA");
    expect(bbca).toBeDefined();
    expect(bbca?.exchange).toBe("IDX");
    expect(bbca?.currency).toBe("IDR");
    expect(bbca?.symbol).toBe("BBCA.JK");

    const bbri = list.find((s) => s.cleanSymbol === "BBRI");
    expect(bbri).toBeDefined();
    expect(bbri?.name).toContain("Bank Rakyat Indonesia");
  });

  it("provides Indonesian mutual funds registry with live NAB datafeed", async () => {
    const quote = await MarketDataService.fetchQuote("SMMF", "mutual_fund");
    expect(quote).toBeDefined();
    expect(quote?.name).toContain("Sucorinvest Money Market Fund");
    expect(quote?.price).toBeGreaterThan(1000);
    expect(quote?.currency).toBe("IDR");
  });

  it("provides Indonesian government bonds with par value", async () => {
    const bondQuote = await MarketDataService.fetchQuote("ORI026", "bond");
    expect(bondQuote).toBeDefined();
    expect(bondQuote?.price).toBe(1000000);
    expect(bondQuote?.name).toContain("ORI026");
  });

  it("ensures instant local search ranks exact ticker matches at position 0", () => {
    const bngaResults = searchLocalRegistry("bnga");
    expect(bngaResults.length).toBeGreaterThan(0);
    expect(bngaResults[0].cleanSymbol).toBe("BNGA");

    const bbriResults = searchLocalRegistry("bbri");
    expect(bbriResults.length).toBeGreaterThan(0);
    expect(bbriResults[0].cleanSymbol).toBe("BBRI");

    // Dynamic unlisted ticker synthesis
    const unlisted = searchLocalRegistry("SGRO");
    expect(unlisted.length).toBeGreaterThan(0);
    expect(unlisted[0].cleanSymbol).toBe("SGRO");
    expect(unlisted[0].exchange).toBe("IDX");
  });
});

