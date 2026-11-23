"use client";

import { useState } from "react";
import { Plus, Eye, AlertCircle, Loader2, X, Search } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useToast } from "@/presentation/components/ui/toast";
import { addToWatchlistAction } from "@/app/actions/watchlist-actions";
import { searchMarketStocksAction } from "@/app/actions/portfolio-actions";

const POPULAR_WATCHLIST_PRESETS = [
  { symbol: "BBCA", name: "Bank Central Asia Tbk", assetType: "stock", market: "IDX" },
  { symbol: "BBRI", name: "Bank Rakyat Indonesia Tbk", assetType: "stock", market: "IDX" },
  { symbol: "BMRI", name: "Bank Mandiri (Persero) Tbk", assetType: "stock", market: "IDX" },
  { symbol: "TLKM", name: "Telkom Indonesia Tbk", assetType: "stock", market: "IDX" },
  { symbol: "ASII", name: "Astra International Tbk", assetType: "stock", market: "IDX" },
  { symbol: "ANTAM", name: "Emas Batangan Logam Mulia ANTAM", assetType: "gold", market: "Fisik" },
  { symbol: "BTC-USD", name: "Bitcoin Real-Time (IDR)", assetType: "crypto", market: "Crypto" },
  { symbol: "ETH-USD", name: "Ethereum Real-Time (IDR)", assetType: "crypto", market: "Crypto" },
];

export function AddWatchlistDialog({ onWatchlistAdded }: { onWatchlistAdded?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState("stock");
  const [market, setMarket] = useState("IDX");
  const [currency, setCurrency] = useState("IDR");
  const [note, setNote] = useState("");

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ symbol: string; name: string; cleanSymbol: string }>>([]);

  const { toast } = useToast();

  function selectPreset(preset: typeof POPULAR_WATCHLIST_PRESETS[0]) {
    setSymbol(preset.symbol);
    setName(preset.name);
    setAssetType(preset.assetType);
    setMarket(preset.market);
    setSuggestions([]);
  }

  async function handleSearch(q: string) {
    setSearchQuery(q);
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    const res = await searchMarketStocksAction(q);
    if (res.success && res.data) {
      setSuggestions(res.data.slice(0, 5));
    }
    setIsSearching(false);
  }

  function handleSelectSuggestion(item: { symbol: string; name: string; cleanSymbol: string }) {
    setSymbol(item.cleanSymbol || item.symbol);
    setName(item.name);
    setSuggestions([]);
    setSearchQuery("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("symbol", symbol);
    formData.set("name", name || symbol);
    formData.set("assetType", assetType);
    formData.set("market", market);
    formData.set("currency", currency);
    if (note) formData.set("note", note);

    const result = await addToWatchlistAction(formData);

    if (result.success) {
      toast.success(`${symbol || name} berhasil ditambahkan ke daftar pantauan!`);
      setIsLoading(false);
      setIsOpen(false);
      setSymbol("");
      setName("");
      setNote("");
      if (onWatchlistAdded) onWatchlistAdded();
    } else {
      const errMsg = result.error || "Gagal menambahkan pantauan";
      setError(errMsg);
      toast.error(errMsg);
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Tambah Pantauan
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl sm:max-w-3xl rounded-2xl border border-[#E4E8EF] bg-white p-6 sm:p-7 shadow-xl animate-in fade-in zoom-in-95 duration-150 my-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Tambah ke Daftar Pantauan (Watchlist)</h3>
                  <p className="text-xs text-[#64748B]">
                    Pantau harga pasar tanpa mempengaruhi kepemilikan aset riil atau Net Worth
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-slate-100 hover:text-[#1E293B] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                Pilihan Populer Pantauan (Indonesia)
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_WATCHLIST_PRESETS.map((p) => (
                  <button
                    key={p.symbol}
                    type="button"
                    onClick={() => selectPreset(p)}
                    className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
                  >
                    +{p.symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Search */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                Cari Simbol / Emiten Pasar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#94A3B8]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Ketik kode saham, crypto, atau komoditas (misal: BBRI, BTC, ANTM)..."
                  className="pl-9 h-10 text-sm"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-blue-600" />
                )}
              </div>

              {suggestions.length > 0 && (
                <div className="divide-y divide-[#E4E8EF] rounded-xl border border-[#E4E8EF] bg-white shadow-md overflow-hidden max-h-40 overflow-y-auto">
                  {suggestions.map((item) => (
                    <div
                      key={item.symbol}
                      onClick={() => handleSelectSuggestion(item)}
                      className="p-3 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-bold text-blue-600 font-mono">
                        {item.cleanSymbol || item.symbol}
                      </span>
                      <span className="text-[#64748B] truncate max-w-xs">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Kode / Ticker Simbol
                  </label>
                  <Input
                    name="symbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    required
                    placeholder="Contoh: BBCA, BTC-USD, ANTM"
                    className="h-10 text-sm font-mono uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Kelas Aset
                  </label>
                  <Select value={assetType} onValueChange={setAssetType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih kelas aset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock">Saham (Stocks)</SelectItem>
                      <SelectItem value="mutual_fund">Reksa Dana</SelectItem>
                      <SelectItem value="gold">Emas Fisik (Gold)</SelectItem>
                      <SelectItem value="crypto">Aset Kripto (Crypto)</SelectItem>
                      <SelectItem value="bond">Obligasi / SBN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Nama Lengkap Instrumen
                </label>
                <Input
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Bank Central Asia Tbk"
                  className="h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Bursa / Pasar
                  </label>
                  <Input
                    name="market"
                    value={market}
                    onChange={(e) => setMarket(e.target.value)}
                    placeholder="IDX, Crypto, Fisik"
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Mata Uang Kuotasi
                  </label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih mata uang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">IDR (Rupiah Indonesia)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Catatan Pantauan (Opsional)
                </label>
                <Input
                  name="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Target beli jika menyentuh support 9.500"
                  className="h-10 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E8EF]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || (!symbol && !name)}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Simpan Pantauan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

