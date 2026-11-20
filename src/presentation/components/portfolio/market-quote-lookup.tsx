"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { searchMarketStocksAction } from "@/app/actions/portfolio-actions";

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
            placeholder="Cari simbol atau emiten saham (contoh: BBCA, ASII, BMRI, Apple, Tesla)..."
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
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cari Saham"}
        </Button>
      </form>

      {results.length > 0 && (
        <div className="rounded-xl border border-[#E4E8EF] bg-white overflow-hidden shadow-sm">
          <div className="p-3 bg-[#F8FAFC] border-b border-[#E4E8EF] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            Hasil Pencarian Pasar Bebas (API Gratis)
          </div>
          <div className="divide-y divide-[#E4E8EF] max-h-64 overflow-y-auto">
            {results.map((item) => (
              <div key={item.symbol} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-600">{item.cleanSymbol}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                      {item.exchange}
                    </span>
                  </div>
                  <span className="text-xs text-[#1E293B] block mt-0.5">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono font-medium text-[#64748B]">
                    {item.currency} · {item.assetType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

