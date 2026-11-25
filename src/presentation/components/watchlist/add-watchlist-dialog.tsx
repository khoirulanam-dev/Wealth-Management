"use client";

import { useState, useRef } from "react";
import {
  Plus,
  Eye,
  AlertCircle,
  Loader2,
  X,
  Search,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
import { addToWatchlistAction, addBatchToWatchlistAction } from "@/app/actions/watchlist-actions";
import { searchMarketStocksAction } from "@/app/actions/portfolio-actions";
import { searchLocalRegistry } from "@/infrastructure/services/market-instruments-registry";
import { AssetLogo } from "@/presentation/components/ui/asset-logo";
import { formatCurrency } from "@/lib/decimal";
import { cn } from "@/lib/utils";

export interface WatchlistSearchItem {
  symbol: string;
  cleanSymbol: string;
  name: string;
  exchange: string;
  assetType: string;
  currency: string;
  price?: number;
  changePercent?: number;
}

const POPULAR_WATCHLIST_PRESETS: WatchlistSearchItem[] = [
  { symbol: "BBCA.JK", cleanSymbol: "BBCA", name: "Bank Central Asia Tbk", assetType: "stock", exchange: "IDX", currency: "IDR" },
  { symbol: "BBRI.JK", cleanSymbol: "BBRI", name: "Bank Rakyat Indonesia (Persero) Tbk", assetType: "stock", exchange: "IDX", currency: "IDR" },
  { symbol: "BMRI.JK", cleanSymbol: "BMRI", name: "Bank Mandiri (Persero) Tbk", assetType: "stock", exchange: "IDX", currency: "IDR" },
  { symbol: "BNGA.JK", cleanSymbol: "BNGA", name: "Bank CIMB Niaga Tbk", assetType: "stock", exchange: "IDX", currency: "IDR" },
  { symbol: "TLKM.JK", cleanSymbol: "TLKM", name: "Telkom Indonesia (Persero) Tbk", assetType: "stock", exchange: "IDX", currency: "IDR" },
  { symbol: "ASII.JK", cleanSymbol: "ASII", name: "Astra International Tbk", assetType: "stock", exchange: "IDX", currency: "IDR" },
  { symbol: "ANTAM", cleanSymbol: "ANTAM", name: "Emas Batangan Logam Mulia ANTAM", assetType: "gold", exchange: "Fisik", currency: "IDR" },
  { symbol: "BTC-USD", cleanSymbol: "BTC", name: "Bitcoin Real-Time (IDR)", assetType: "crypto", exchange: "Crypto", currency: "IDR" },
  { symbol: "ETH-USD", cleanSymbol: "ETH", name: "Ethereum Real-Time (IDR)", assetType: "crypto", exchange: "Crypto", currency: "IDR" },
];

export function AddWatchlistDialog({ onWatchlistAdded }: { onWatchlistAdded?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Staged multi-select items
  const [selectedItems, setSelectedItems] = useState<WatchlistSearchItem[]>([]);

  // Expandable manual single form state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualSymbol, setManualSymbol] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualAssetType, setManualAssetType] = useState("stock");
  const [manualMarket, setManualMarket] = useState("IDX");
  const [manualCurrency, setManualCurrency] = useState("IDR");
  const [manualNote, setManualNote] = useState("");

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<WatchlistSearchItem[]>([]);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const queryIdRef = useRef<number>(0);

  const { toast } = useToast();

  function isItemSelected(item: WatchlistSearchItem) {
    const key = (item.cleanSymbol || item.symbol).toUpperCase();
    return selectedItems.some((s) => (s.cleanSymbol || s.symbol).toUpperCase() === key);
  }

  function toggleItemSelection(item: WatchlistSearchItem) {
    const key = (item.cleanSymbol || item.symbol).toUpperCase();
    setSelectedItems((prev) => {
      const exists = prev.some((s) => (s.cleanSymbol || s.symbol).toUpperCase() === key);
      if (exists) {
        return prev.filter((s) => (s.cleanSymbol || s.symbol).toUpperCase() !== key);
      } else {
        return [...prev, item];
      }
    });
  }

  function handleSearch(q: string) {
    setSearchQuery(q);
    const trimmed = q.trim();
    const queryId = ++queryIdRef.current;

    if (!trimmed) {
      setSuggestions([]);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      setIsSearching(false);
      return;
    }

    // 1. INSTANT LOCAL FILTER (0ms): display local matches immediately without waiting
    const localMatches: WatchlistSearchItem[] = searchLocalRegistry(trimmed).map((it) => ({
      symbol: it.symbol,
      cleanSymbol: it.cleanSymbol,
      name: it.name,
      exchange: it.exchange,
      assetType: it.assetType,
      currency: it.currency,
    }));

    // Update suggestions immediately. If no local matches, reset to empty (not stale old items)
    setSuggestions(localMatches);

    // 2. Debounced background enrichment (180ms) with queryId check to prevent out-of-order race conditions
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchMarketStocksAction(trimmed);
        // Only apply if this is still the active search query!
        if (queryId === queryIdRef.current && res.success && res.data && res.data.length > 0) {
          setSuggestions(res.data.slice(0, 8));
        }
      } catch {
        // Fallback gracefully to local matches
      } finally {
        if (queryId === queryIdRef.current) {
          setIsSearching(false);
        }
      }
    }, 180);
  }

  function resetDialog() {
    setSelectedItems([]);
    setSearchQuery("");
    setSuggestions([]);
    setManualSymbol("");
    setManualName("");
    setManualNote("");
    setShowManualForm(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Case 1: Multi-Select Staged Items (Batch mode)
    if (selectedItems.length > 0) {
      const itemsToSave = selectedItems.map((it) => ({
        symbol: it.cleanSymbol || it.symbol,
        name: it.name || it.cleanSymbol || it.symbol,
        assetType: it.assetType || "stock",
        market: it.exchange || "IDX",
        currency: it.currency || "IDR",
        price: it.price,
        changePercent: it.changePercent,
      }));

      const res = await addBatchToWatchlistAction(itemsToSave);

      if (res.success) {
        toast.success(`${res.addedCount} instrumen berhasil ditambahkan ke daftar pantauan!`);
        if (res.skippedCount && res.skippedCount > 0) {
          toast.info(`${res.skippedCount} instrumen dilewati karena sudah ada di pantauan.`);
        }
        setIsLoading(false);
        setIsOpen(false);
        resetDialog();
        if (onWatchlistAdded) onWatchlistAdded();
      } else {
        const errMsg = res.error || "Gagal menambahkan pantauan";
        setError(errMsg);
        toast.error(errMsg);
        setIsLoading(false);
      }
      return;
    }

    // Case 2: Single Manual Form
    if (manualSymbol || manualName) {
      const formData = new FormData();
      formData.set("symbol", manualSymbol);
      formData.set("name", manualName || manualSymbol);
      formData.set("assetType", manualAssetType);
      formData.set("market", manualMarket);
      formData.set("currency", manualCurrency);
      if (manualNote) formData.set("note", manualNote);

      const result = await addToWatchlistAction(formData);

      if (result.success) {
        toast.success(`${manualSymbol || manualName} berhasil ditambahkan ke daftar pantauan!`);
        setIsLoading(false);
        setIsOpen(false);
        resetDialog();
        if (onWatchlistAdded) onWatchlistAdded();
      } else {
        const errMsg = result.error || "Gagal menambahkan pantauan";
        setError(errMsg);
        toast.error(errMsg);
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(false);
    setError("Pilih minimal satu instrumen atau isi kode emiten");
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto gap-2 bg-[#007AFF] hover:bg-[#0066D6] active:scale-[0.98] text-white font-semibold text-xs h-10 sm:h-9.5 px-3.5 rounded-xl shadow-xs shadow-[#007AFF]/25 transition-all justify-center whitespace-nowrap shrink-0"
      >
        <Plus className="h-4 w-4 stroke-[2.5]" />
        <span>Tambah Pantauan</span>
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
                    Bisa pilih beberapa emiten sekaligus. Pantau harga pasar tanpa mempengaruhi Net Worth.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  resetDialog();
                }}
                className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-slate-100 hover:text-[#1E293B] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Presets (Click to toggle into staged list) */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Pilihan Populer (Klik untuk tambah/hapus langsung)
                </label>
                {selectedItems.length > 0 && (
                  <span className="text-[11px] font-semibold text-blue-600">
                    {selectedItems.length} dipilih
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_WATCHLIST_PRESETS.map((p) => {
                  const isSelected = isItemSelected(p);
                  return (
                    <button
                      key={p.symbol}
                      type="button"
                      onClick={() => toggleItemSelection(p)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all active:scale-[0.98] flex items-center gap-1.5",
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-xs"
                          : "border-[#E2E8F0] bg-white text-[#475569] hover:border-blue-400 hover:text-blue-600 hover:bg-slate-50"
                      )}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                      ) : (
                        <Plus className="h-3.5 w-3.5 text-[#94A3B8]" />
                      )}
                      <span>{p.cleanSymbol || p.symbol}</span>
                    </button>
                  );
                })}
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
                  placeholder="Ketik kode saham, kripto, atau komoditas (misal: BNGA, BBRI, ANTM)..."
                  className="pl-9 pr-9 h-10 text-sm"
                  autoFocus
                />
                {isSearching ? (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-blue-600" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                    }}
                    className="absolute right-3 top-3 text-[#94A3B8] hover:text-[#1E293B]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="divide-y divide-[#EEF1F5] rounded-2xl border border-[#CBD5E1] bg-white shadow-xl overflow-hidden max-h-72 overflow-y-auto animate-in fade-in duration-150">
                  {suggestions.map((item) => {
                    const isProfit = (item.changePercent ?? 0) >= 0;
                    const isSelected = isItemSelected(item);
                    return (
                      <div
                        key={item.symbol}
                        onClick={() => toggleItemSelection(item)}
                        className={cn(
                          "p-3 cursor-pointer flex items-center justify-between gap-3 text-xs transition-colors group",
                          isSelected ? "bg-blue-50/60" : "hover:bg-slate-50"
                        )}
                      >
                        {/* Left: Asset Logo + Identity */}
                        <div className="flex items-center gap-3 min-w-0">
                          <AssetLogo
                            symbol={item.cleanSymbol || item.symbol}
                            name={item.name}
                            assetType={item.assetType}
                            market={item.exchange}
                            size="md"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-[#1E293B] group-hover:text-blue-600 transition-colors">
                                {item.cleanSymbol || item.symbol}
                              </span>
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-600">
                                {item.exchange}
                              </span>
                              <span className="rounded bg-blue-50 text-blue-700 px-1.5 py-0.5 text-[10px] font-medium capitalize">
                                {item.assetType === "stock"
                                  ? "Saham"
                                  : item.assetType === "mutual_fund"
                                  ? "Reksa Dana"
                                  : item.assetType === "gold"
                                  ? "Emas"
                                  : item.assetType === "crypto"
                                  ? "Kripto"
                                  : item.assetType === "bond"
                                  ? "SBN"
                                  : item.assetType}
                              </span>
                            </div>
                            <span className="text-xs text-[#64748B] truncate block mt-0.5 max-w-sm sm:max-w-md">
                              {item.name}
                            </span>
                          </div>
                        </div>

                        {/* Right: Real-Time Price & Multi-Select Toggle Button */}
                        <div className="flex items-center gap-3 shrink-0">
                          {typeof item.price === "number" && (
                            <div className="text-right hidden sm:block">
                              <span className="font-mono font-bold text-xs text-[#1E293B] block">
                                {item.currency === "IDR"
                                  ? formatCurrency(item.price, "IDR")
                                  : `${item.currency || "USD"} ${item.price.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                              </span>
                              {typeof item.changePercent === "number" && (
                                <div className="flex items-center justify-end gap-1">
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-0.5 text-[11px] font-mono font-semibold",
                                      isProfit
                                        ? "text-emerald-600"
                                        : "text-rose-600"
                                    )}
                                  >
                                    {isProfit ? (
                                      <TrendingUp className="h-2.5 w-2.5 stroke-[2.5]" />
                                    ) : (
                                      <TrendingDown className="h-2.5 w-2.5 stroke-[2.5]" />
                                    )}
                                    <span>
                                      {isProfit ? "+" : ""}
                                      {item.changePercent.toFixed(2)}%
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleItemSelection(item);
                            }}
                            className={cn(
                              "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all flex items-center gap-1 active:scale-[0.97]",
                              isSelected
                                ? "bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            )}
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Terpilih</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5" />
                                <span>Pilih</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Staged Selected Items Tray (Multi-Select) */}
            {selectedItems.length > 0 && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    Daftar Emiten Terpilih ({selectedItems.length} instrumen)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedItems([])}
                    className="text-[11px] text-[#94A3B8] hover:text-rose-600 font-medium transition-colors"
                  >
                    Kosongkan Semua
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                  {selectedItems.map((it) => (
                    <span
                      key={it.symbol}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1E293B] shadow-xs"
                    >
                      <span className="font-mono text-blue-600">{it.cleanSymbol || it.symbol}</span>
                      <span className="text-[#64748B] text-[11px] max-w-[140px] truncate">{it.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleItemSelection(it)}
                        className="text-[#94A3B8] hover:text-rose-600 p-0.5 rounded transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Collapsible Manual Single Input */}
            <div className="mt-4 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setShowManualForm(!showManualForm)}
                className="flex items-center justify-between w-full text-xs font-semibold text-[#64748B] hover:text-[#1E293B] py-1 transition-colors"
              >
                <span>Atau Input Manual 1 Instrumen Kustom</span>
                {showManualForm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showManualForm && (
                <div className="mt-3 space-y-3 p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                        Kode / Ticker Simbol
                      </label>
                      <Input
                        value={manualSymbol}
                        onChange={(e) => setManualSymbol(e.target.value)}
                        placeholder="Contoh: BBCA, BTC-USD, ANTM"
                        className="h-9.5 text-sm font-mono uppercase bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                        Kelas Aset
                      </label>
                      <Select value={manualAssetType} onValueChange={setManualAssetType}>
                        <SelectTrigger className="w-full bg-white h-9.5">
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
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="Contoh: Bank Central Asia Tbk"
                      className="h-9.5 text-sm bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                        Bursa / Pasar
                      </label>
                      <Input
                        value={manualMarket}
                        onChange={(e) => setManualMarket(e.target.value)}
                        placeholder="IDX, Crypto, Fisik"
                        className="h-9.5 text-sm bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                        Mata Uang Kuotasi
                      </label>
                      <Select value={manualCurrency} onValueChange={setManualCurrency}>
                        <SelectTrigger className="w-full bg-white h-9.5">
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
                      value={manualNote}
                      onChange={(e) => setManualNote(e.target.value)}
                      placeholder="Contoh: Target beli jika menyentuh support"
                      className="h-9.5 text-sm bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Footer Actions */}
            <form onSubmit={handleSubmit} className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-[#E4E8EF]">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  resetDialog();
                }}
                disabled={isLoading}
                className="rounded-xl h-10 px-4 text-xs font-semibold border-[#E2E8F0] text-[#475569] hover:bg-slate-50"
              >
                Batal
              </Button>

              <Button
                type="submit"
                disabled={isLoading || (selectedItems.length === 0 && !manualSymbol && !manualName)}
                className="rounded-xl h-10 px-5 text-xs font-semibold bg-[#007AFF] hover:bg-[#0066D6] text-white gap-2 shadow-xs shadow-[#007AFF]/25 transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      {selectedItems.length > 0
                        ? `Menyimpan ${selectedItems.length} Pantauan...`
                        : "Menyimpan..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>
                      {selectedItems.length > 0
                        ? `Simpan ${selectedItems.length} Pantauan Sekaligus`
                        : "Simpan Pantauan"}
                    </span>
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
