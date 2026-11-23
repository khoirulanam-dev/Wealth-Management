"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { formatCurrency } from "@/lib/decimal";
import { searchMarketStocksAction } from "@/app/actions/portfolio-actions";
import { AssetLogo } from "@/presentation/components/ui/asset-logo";

export function MarketQuoteLookup() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Array<{
    symbol: string;
    cleanSymbol: string;
    name: string;
    exchange: string;
    currency: string;
    assetType: string;
    price?: number;
    changePercent?: number;
  }>>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    const res = await searchMarketStocksAction(query);
    if (res.success && res.data) {
      setResults(res.data);
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Cari instrumen (contoh: BBCA, Sucorinvest, Antam, ORI026, BTC, Apple)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-[#E4E8EF] bg-white pl-9 pr-4 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cari Instrumen"}
        </Button>
      </form>

      {results.length > 0 && (
        <div className="rounded-xl border border-[#E4E8EF] bg-white overflow-hidden shadow-sm">
          <div className="p-3 bg-[#F8FAFC] border-b border-[#E4E8EF] text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Hasil Pencarian Pasar Real-Time (Harga Riil Pihak Ke-3)
          </div>
          <div className="divide-y divide-[#E4E8EF] max-h-72 overflow-y-auto">
            {results.map((item) => (
              <div key={item.symbol} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <AssetLogo
                    symbol={item.cleanSymbol || item.symbol}
                    name={item.name}
                    assetType={item.assetType}
                    market={item.exchange}
                    size="sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-600">{item.cleanSymbol}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-600">
                        {item.exchange}
                      </span>
                    </div>
                    <span className="text-xs text-[#1E293B] block mt-0.5">{item.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  {typeof item.price === "number" ? (
                    <div>
                      <span className="font-mono font-bold text-xs text-[#1E293B] block">
                        {item.currency === "IDR" ? formatCurrency(item.price) : `${item.currency} ${item.price.toFixed(2)}`}
                      </span>
                      {typeof item.changePercent === "number" && (
                        <span
                          className={`text-xs font-mono font-semibold ${
                            item.changePercent >= 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {item.changePercent >= 0 ? "+" : ""}
                          {item.changePercent.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-mono font-medium text-[#64748B]">
                      {item.currency} · {item.assetType}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

