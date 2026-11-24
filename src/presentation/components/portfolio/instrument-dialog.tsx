"use client";

import { useState, useEffect } from "react";
import { Plus, LineChart, AlertCircle, Loader2, X, Search, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
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
import {
  createInstrumentAction,
  searchMarketStocksAction,
  getCuratedStocksAction,
} from "@/app/actions/portfolio-actions";
import { searchLocalRegistry } from "@/infrastructure/services/market-instruments-registry";
import { AssetLogo } from "@/presentation/components/ui/asset-logo";
import { formatCurrency } from "@/lib/decimal";
import { cn } from "@/lib/utils";

interface StockSuggestion {
  symbol: string;
  cleanSymbol: string;
  name: string;
  exchange: string;
  assetType: string;
  currency: string;
  price?: number;
  changePercent?: number;
}

interface InstrumentDialogProps {
  onInstrumentCreated?: () => void;
  triggerButton?: React.ReactNode;
}

export function InstrumentDialog({ onInstrumentCreated, triggerButton }: InstrumentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [assetType, setAssetType] = useState("stock");
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [market, setMarket] = useState("IDX");
  const [unit, setUnit] = useState("share");
  const [currency, setCurrency] = useState("IDR");

  // Stock picker states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [curatedList, setCuratedList] = useState<StockSuggestion[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && curatedList.length === 0) {
      getCuratedStocksAction().then((res) => {
        if (res.success && res.data) {
          setCuratedList(res.data);
        }
      });
    }
  }, [isOpen, curatedList.length]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    // 1. INSTANT LOCAL FILTER (0ms): render immediately from offline registry
    const localMatches: StockSuggestion[] = searchLocalRegistry(trimmed).map((it) => ({
      symbol: it.symbol,
      cleanSymbol: it.cleanSymbol,
      name: it.name,
      exchange: it.exchange,
      assetType: it.assetType,
      currency: it.currency,
    }));

    if (localMatches.length > 0) {
      setSuggestions(localMatches.slice(0, 6));
    }

    // 2. Debounced background enrichment (150ms) to augment with live prices & remote search
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchMarketStocksAction(trimmed);
      if (res.success && res.data && res.data.length > 0) {
        setSuggestions(res.data.slice(0, 6));
      }
      setIsSearching(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectStockItem = (item: StockSuggestion) => {
    setSymbol(item.cleanSymbol);
    setName(item.name);
    setMarket(item.exchange);
    setAssetType(item.assetType);
    setCurrency(item.currency);
    setUnit(item.assetType === "stock" ? "share" : "unit");
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleAssetTypeChange = (val: string) => {
    setAssetType(val);
    if (val === "stock") {
      setUnit("share");
      setMarket("IDX");
    } else if (val === "gold") {
      setUnit("gram");
      setMarket("LOKAL");
    } else if (val === "mutual_fund") {
      setUnit("unit");
      setMarket("LOKAL");
    } else {
      setUnit("nominal");
      setMarket("LOKAL");
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("symbol", symbol);
    formData.set("name", name);
    formData.set("market", market);
    formData.set("assetType", assetType);
    formData.set("unit", unit);
    formData.set("currency", currency);

    const result = await createInstrumentAction(formData);

    if (result.success) {
      toast.success("Instrumen investasi berhasil ditambahkan!");
      setIsLoading(false);
      setIsOpen(false);
      setSymbol("");
      setName("");
      if (onInstrumentCreated) onInstrumentCreated();
    } else {
      const errMsg = result.error || "Gagal membuat instrumen";
      setError(errMsg);
      toast.error(errMsg);
      setIsLoading(false);
    }
  }

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
          {triggerButton}
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto gap-1.5 sm:gap-2 h-10 sm:h-9.5 px-3 border border-black/[0.08] bg-white text-xs font-semibold sm:font-medium text-[#1C1C1E] hover:bg-black/[0.03] active:scale-[0.98] rounded-xl shadow-2xs transition-all justify-center whitespace-nowrap shrink-0"
        >
          <LineChart className="h-3.5 w-3.5 text-[#AF52DE] shrink-0" />
          <span className="truncate">+ Instrumen</span>
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[#E4E8EF] bg-white p-6 sm:p-7 shadow-xl animate-in fade-in zoom-in-95 duration-150 my-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <LineChart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Tambah Instrumen Investasi</h3>
                  <p className="text-xs text-[#64748B]">Saham IDX/US, Reksadana, Emas Fisik, Obligasi</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-[#94A3B8] hover:bg-slate-100 hover:text-[#1E293B]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Picker / Online API Search */}
            <div className="mt-4 p-3 bg-[#F8FAFC] border border-[#E4E8EF] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1E293B] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Pilih Cepat Saham IDX (API Terintegrasi)
                </span>
                <span className="text-xs text-[#94A3B8]">Auto-fill info pasar</span>
              </div>

              {/* Search box for live API */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Ketik nama atau kode saham (misal: BCA, BRI, Telkom, Apple)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[#E4E8EF] bg-white pl-8 pr-8 py-1.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                {isSearching && (
                  <Loader2 className="absolute right-2.5 top-2.5 h-3.5 w-3.5 animate-spin text-blue-600" />
                )}
              </div>

              {/* Suggestions Dropdown with Logo, Real-time Price, and PnL */}
              {suggestions.length > 0 && (
                <div className="max-h-64 overflow-y-auto divide-y divide-[#EEF1F5] rounded-2xl border border-[#CBD5E1] bg-white shadow-xl animate-in fade-in duration-150">
                  {suggestions.map((item) => {
                    const isProfit = (item.changePercent ?? 0) >= 0;
                    return (
                      <button
                        key={item.symbol}
                        type="button"
                        onClick={() => selectStockItem(item)}
                        className="w-full text-left p-3 hover:bg-blue-50/70 flex items-center justify-between gap-3 transition-colors group cursor-pointer"
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
                                {item.cleanSymbol}
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
                            <span className="text-xs text-[#64748B] truncate block mt-0.5 max-w-sm">
                              {item.name}
                            </span>
                          </div>
                        </div>

                        {/* Right: Real-time Price & Daily PnL */}
                        <div className="text-right shrink-0">
                          {typeof item.price === "number" ? (
                            <div className="space-y-0.5">
                              <span className="font-mono font-bold text-xs text-[#1E293B] block">
                                {item.currency === "IDR"
                                  ? formatCurrency(item.price, "IDR")
                                  : `${item.currency || "USD"} ${item.price.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                              </span>
                              {typeof item.changePercent === "number" && (
                                <div className="flex items-center justify-end gap-1">
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold",
                                      isProfit
                                        ? "text-emerald-700 bg-emerald-50 border border-emerald-200/60"
                                        : "text-rose-700 bg-rose-50 border border-rose-200/60"
                                    )}
                                  >
                                    {isProfit ? (
                                      <TrendingUp className="h-2.5 w-2.5" />
                                    ) : (
                                      <TrendingDown className="h-2.5 w-2.5" />
                                    )}
                                    <span>
                                      {isProfit ? "+" : ""}
                                      {item.changePercent.toFixed(2)}%
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] font-mono text-[#94A3B8]">
                              Pasar Real-Time
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Popular Curated Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {curatedList.slice(0, 8).map((stock) => (
                  <button
                    key={stock.cleanSymbol}
                    type="button"
                    onClick={() => selectStockItem(stock)}
                    className="rounded-md border border-[#E2E8F0] bg-white px-2 py-0.5 text-xs font-mono font-medium text-[#475569] hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
                  >
                    +{stock.cleanSymbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Kelas Aset
                </label>
                <Select value={assetType} onValueChange={handleAssetTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kelas aset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Saham (Stocks)</SelectItem>
                    <SelectItem value="mutual_fund">Reksa Dana (Mutual Fund)</SelectItem>
                    <SelectItem value="gold">Emas Batangan / Fisik (Gold)</SelectItem>
                    <SelectItem value="bond">Obligasi / SBN</SelectItem>
                    <SelectItem value="deposit">Deposito Berjangka</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Ticker / Kode
                  </label>
                  <Input
                    name="symbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder={
                      assetType === "stock"
                        ? "BBCA, BBRI, TLKM"
                        : assetType === "gold"
                        ? "ANTAM"
                        : "KODE"
                    }
                    className="h-10 text-sm font-mono uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Bursa / Pasar
                  </label>
                  <Input
                    name="market"
                    value={market}
                    onChange={(e) => setMarket(e.target.value.toUpperCase())}
                    className="h-10 text-sm uppercase"
                  />
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
                  required
                  placeholder={
                    assetType === "stock"
                      ? "Bank Central Asia Tbk"
                      : assetType === "mutual_fund"
                      ? "Sucorinvest Equity Fund"
                      : assetType === "gold"
                      ? "Emas Batangan Logam Mulia"
                      : "Nama aset investasi"
                  }
                  className="h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Satuan Unit
                  </label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="share">Lembar Saham (Shares)</SelectItem>
                      <SelectItem value="unit">Unit Penyertaan</SelectItem>
                      <SelectItem value="gram">Gram (Emas)</SelectItem>
                      <SelectItem value="nominal">Nominal Rupiah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Mata Uang
                  </label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih mata uang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E8EF]">
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
                  disabled={isLoading}
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
                      Simpan Instrumen
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
