"use client";

import { useState, useMemo } from "react";
import {
  Eye,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Sliders,
  Loader2,
  TrendingUp,
  TrendingDown,
  Search,
  X,
  ArrowUpDown,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ArrowDownAZ,
  ArrowUpZA,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/decimal";
import { removeFromWatchlistAction } from "@/app/actions/watchlist-actions";
import { syncSingleInstrumentAction } from "@/app/actions/portfolio-actions";
import { useToast } from "@/presentation/components/ui/toast";
import { ManualValuationDialog } from "@/presentation/components/portfolio/manual-valuation-dialog";
import { ValuationHistoryDialog } from "@/presentation/components/portfolio/valuation-history-dialog";
import { ConfirmDialog } from "@/presentation/components/ui/confirm-dialog";
import { WatchlistItemDetail } from "@/application/use-cases/portfolio/watchlist-service";
import { AssetLogo } from "@/presentation/components/ui/asset-logo";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { cn } from "@/lib/utils";

type SortOption =
  | "price_desc"
  | "price_asc"
  | "change_desc"
  | "change_asc"
  | "name_asc"
  | "name_desc"
  | "date_desc"
  | "date_asc";

interface WatchlistTableProps {
  items: WatchlistItemDetail[];
  onDataChanged?: () => void;
}

export function WatchlistTable({ items, onDataChanged }: WatchlistTableProps) {
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter & Sort states
  const [searchFilter, setSearchFilter] = useState("");
  const [assetFilter, setAssetFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date_desc");

  const { toast } = useToast();

  async function handleRefreshSingle(instrumentId: string, symbol: string | null) {
    setSyncingId(instrumentId);
    const result = await syncSingleInstrumentAction(instrumentId);
    if (result.success) {
      toast.success(`Kuotasi pasar untuk ${symbol || "instrumen"} berhasil diperbarui!`);
      if (onDataChanged) onDataChanged();
    } else {
      toast.error("error" in result ? result.error : "Gagal memperbarui kuotasi");
    }
    setSyncingId(null);
  }

  async function confirmDeleteWatchlist() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const formData = new FormData();
    formData.set("watchlistItemId", deleteTarget.id);

    const result = await removeFromWatchlistAction(formData);
    if (result.success) {
      toast.success(`"${deleteTarget.name}" dihapus dari daftar pantauan`);
      setDeleteTarget(null);
      if (onDataChanged) onDataChanged();
    } else {
      toast.error(result.error || "Gagal menghapus");
    }
    setIsDeleting(false);
  }

  function getAssetLabel(type: string) {
    switch (type) {
      case "stock":
        return "Saham";
      case "mutual_fund":
        return "Reksa Dana";
      case "gold":
        return "Emas Fisik";
      case "crypto":
        return "Kripto";
      case "bond":
        return "Obligasi / SBN";
      default:
        return type;
    }
  }

  // Filter & Sort items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // 1. Text filter (symbol, name, market)
    if (searchFilter.trim()) {
      const q = searchFilter.trim().toLowerCase();
      result = result.filter(
        (it) =>
          (it.symbol && it.symbol.toLowerCase().includes(q)) ||
          it.name.toLowerCase().includes(q) ||
          (it.market && it.market.toLowerCase().includes(q))
      );
    }

    // 2. Asset Type filter
    if (assetFilter !== "all") {
      result = result.filter((it) => it.assetType === assetFilter);
    }

    // 3. Sorting
    result.sort((a, b) => {
      const priceA = a.latestPrice ? parseFloat(a.latestPrice) : -1;
      const priceB = b.latestPrice ? parseFloat(b.latestPrice) : -1;
      const changeA = typeof a.changePercent === "number" ? a.changePercent : -999999;
      const changeB = typeof b.changePercent === "number" ? b.changePercent : -999999;
      const nameA = (a.symbol || a.name).toLowerCase();
      const nameB = (b.symbol || b.name).toLowerCase();
      const dateA = new Date(a.addedAt).getTime();
      const dateB = new Date(b.addedAt).getTime();

      switch (sortBy) {
        case "price_desc":
          return priceB - priceA;
        case "price_asc":
          return priceA - priceB;
        case "change_desc":
          return changeB - changeA;
        case "change_asc":
          return changeA - changeB;
        case "name_asc":
          return nameA.localeCompare(nameB);
        case "name_desc":
          return nameB.localeCompare(nameA);
        case "date_asc":
          return dateA - dateB;
        case "date_desc":
        default:
          return dateB - dateA;
      }
    });

    return result;
  }, [items, searchFilter, assetFilter, sortBy]);

  if (items.length === 0) {
    return (
      <div className="min-h-[260px] flex flex-col items-center justify-center text-center p-8 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E4E8EF]">
        <Eye className="h-8 w-8 text-[#94A3B8] mb-3" strokeWidth={1.5} />
        <h3 className="text-sm font-bold text-[#1E293B]">Watchlist Masih Kosong</h3>
        <p className="text-xs text-[#64748B] max-w-sm mt-1 leading-relaxed">
          Tambahkan saham, reksa dana, atau kripto yang ingin Anda pantau harganya tanpa mencatat transaksi kepemilikan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter & Sorting Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF]">
        {/* Left: Search Input & Asset Class Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
            <Input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Cari simbol / nama emiten..."
              className="pl-9 pr-8 h-9 text-xs bg-white border-[#E2E8F0]"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter("")}
                className="absolute right-2.5 top-2.5 text-[#94A3B8] hover:text-[#1E293B]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Asset Type Filter */}
          <div className="w-full sm:w-44">
            <Select value={assetFilter} onValueChange={setAssetFilter}>
              <SelectTrigger className="h-9 text-xs bg-white border-[#E2E8F0] w-full">
                <SelectValue placeholder="Semua Kelas Aset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas Aset</SelectItem>
                <SelectItem value="stock">Saham (Stocks)</SelectItem>
                <SelectItem value="mutual_fund">Reksa Dana</SelectItem>
                <SelectItem value="gold">Emas Fisik</SelectItem>
                <SelectItem value="crypto">Aset Kripto</SelectItem>
                <SelectItem value="bond">Obligasi / SBN</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right: Sort By Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[#64748B] font-medium whitespace-nowrap hidden sm:inline">
            Urutkan:
          </span>
          <div className="w-full sm:w-56">
            <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
              <SelectTrigger className="h-9 text-xs font-semibold bg-white border-[#E2E8F0] w-full">
                <SelectValue placeholder="Pilih Urutan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_desc" className="text-xs font-semibold">
                  Harga Tertinggi (Rp Besar → Kecil)
                </SelectItem>
                <SelectItem value="price_asc" className="text-xs font-semibold">
                  Harga Terendah (Rp Kecil → Besar)
                </SelectItem>
                <SelectItem value="change_desc" className="text-xs font-semibold text-emerald-700">
                  Kenaikan Tertinggi (+%)
                </SelectItem>
                <SelectItem value="change_asc" className="text-xs font-semibold text-rose-700">
                  Penurunan Terdalam (-%)
                </SelectItem>
                <SelectItem value="name_asc" className="text-xs font-semibold">
                  Nama Simbol (A → Z)
                </SelectItem>
                <SelectItem value="name_desc" className="text-xs font-semibold">
                  Nama Simbol (Z → A)
                </SelectItem>
                <SelectItem value="date_desc" className="text-xs font-semibold">
                  Terbaru Ditambahkan
                </SelectItem>
                <SelectItem value="date_asc" className="text-xs font-semibold">
                  Terlama Ditambahkan
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Filter Stats info bar if filtered */}
      {(searchFilter || assetFilter !== "all") && (
        <div className="flex items-center justify-between text-xs px-1 text-[#64748B]">
          <span>
            Menampilkan <strong className="text-[#1E293B]">{filteredItems.length}</strong> dari {items.length} instrumen pantauan
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchFilter("");
              setAssetFilter("all");
            }}
            className="text-blue-600 hover:underline font-semibold"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Table Container */}
      {filteredItems.length === 0 ? (
        <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#E4E8EF]">
          <Search className="h-6 w-6 text-[#94A3B8] mx-auto mb-2" />
          <h4 className="text-xs font-bold text-[#1E293B]">Tidak ada instrumen yang cocok</h4>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Coba ganti kata kunci pencarian atau ubah filter kelas aset.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E4E8EF]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E4E8EF] bg-[#F8FAFC] text-[#64748B] font-semibold uppercase tracking-wider text-xs select-none">
                {/* Instrumen Header (Clickable for A-Z sort) */}
                <th
                  onClick={() => setSortBy(sortBy === "name_asc" ? "name_desc" : "name_asc")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Instrumen Pantauan</span>
                    {sortBy === "name_asc" ? (
                      <ArrowDownAZ className="h-3.5 w-3.5 text-blue-600" />
                    ) : sortBy === "name_desc" ? (
                      <ArrowUpZA className="h-3.5 w-3.5 text-blue-600" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </th>

                <th className="py-3 px-4">Kelas Aset</th>
                <th className="py-3 px-4">Bursa / Pasar</th>

                {/* Price Header (Clickable for Price Highest/Lowest sort) */}
                <th
                  onClick={() => setSortBy(sortBy === "price_desc" ? "price_asc" : "price_desc")}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Harga Kuotasi Terkini</span>
                    {sortBy === "price_desc" ? (
                      <ArrowDownWideNarrow className="h-4 w-4 text-blue-600" />
                    ) : sortBy === "price_asc" ? (
                      <ArrowUpNarrowWide className="h-4 w-4 text-blue-600" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </th>

                {/* Date Header (Clickable for Date sort) */}
                <th
                  onClick={() => setSortBy(sortBy === "date_desc" ? "date_asc" : "date_desc")}
                  className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100/80 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Waktu Kuotasi</span>
                    {sortBy === "date_desc" || sortBy === "date_asc" ? (
                      <ArrowUpDown className="h-3 w-3 text-blue-600" />
                    ) : null}
                  </div>
                </th>

                <th className="py-3 px-4 text-center">Sumber Data</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E8EF] text-[#1E293B]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                  {/* Left: Asset Logo + Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <AssetLogo
                        symbol={item.symbol}
                        name={item.name}
                        assetType={item.assetType}
                        market={item.market}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-[#1E293B] font-mono">
                            {item.symbol || item.name}
                          </span>
                        </div>
                        <span className="text-xs text-[#64748B] block truncate max-w-xs">
                          {item.name}
                        </span>
                        {item.note && (
                          <span className="text-xs text-[#94A3B8] italic block mt-0.5">
                            &quot;{item.note}&quot;
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Asset Type */}
                  <td className="py-3.5 px-4">
                    <span className="text-xs text-[#64748B] font-medium">
                      {getAssetLabel(item.assetType)}
                    </span>
                  </td>

                  {/* Market */}
                  <td className="py-3.5 px-4">
                    <span className="text-xs text-[#64748B] font-mono">
                      {item.market || "IDX"}
                    </span>
                  </td>

                  {/* Latest Price & Real-Time % Change (Right next to price) */}
                  <td className="py-3.5 px-4 text-right">
                    {item.latestPrice ? (
                      <div className="flex flex-col items-end sm:flex-row sm:items-center sm:justify-end gap-1.5 sm:gap-2">
                        <span className="font-bold text-sm text-[#1E293B] font-mono whitespace-nowrap">
                          {formatCurrency(item.latestPrice, item.currency)}
                        </span>

                        {/* Real-Time Price Change Badge (+% green / -% red) */}
                        {typeof item.changePercent === "number" && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight shrink-0 whitespace-nowrap transition-all",
                              item.changePercent > 0
                                ? "text-emerald-700 bg-emerald-50 border border-emerald-200/70"
                                : item.changePercent < 0
                                ? "text-rose-700 bg-rose-50 border border-rose-200/70"
                                : "text-slate-600 bg-slate-100 border border-slate-200/70"
                            )}
                            title={`Perubahan harga: ${item.changePercent > 0 ? "+" : ""}${item.changePercent.toFixed(2)}%`}
                          >
                            {item.changePercent > 0 ? (
                              <TrendingUp className="h-2.5 w-2.5 stroke-[2.5]" />
                            ) : item.changePercent < 0 ? (
                              <TrendingDown className="h-2.5 w-2.5 stroke-[2.5]" />
                            ) : null}
                            <span>
                              {item.changePercent > 0 ? "+" : ""}
                              {item.changePercent.toFixed(2)}%
                            </span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-[#94A3B8] italic">Belum ada kuotasi</span>
                    )}
                  </td>

                  {/* Effective At */}
                  <td className="py-3.5 px-4 text-center font-mono text-xs text-[#64748B]">
                    {item.latestEffectiveAt ? formatDate(item.latestEffectiveAt) : "-"}
                  </td>

                  {/* Source */}
                  <td className="py-3.5 px-4 text-center">
                    {item.isManualOverride ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Sliders className="h-3 w-3" />
                        Manual
                      </span>
                    ) : item.sourceName ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="h-3 w-3" />
                        {item.sourceName}
                      </span>
                    ) : (
                      <span className="text-xs text-[#94A3B8]">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRefreshSingle(item.instrumentId, item.symbol)}
                        disabled={syncingId === item.instrumentId}
                        className="rounded p-1 text-[#94A3B8] hover:bg-slate-100 hover:text-blue-600 transition-colors"
                        title="Refresh Kuotasi Real-Time"
                      >
                        {syncingId === item.instrumentId ? (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </button>

                      <ManualValuationDialog
                        instrumentId={item.instrumentId}
                        instrumentName={item.name}
                        symbol={item.symbol}
                        currentPrice={item.latestPrice}
                        currency={item.currency}
                        onValuationSaved={onDataChanged}
                      />

                      <ValuationHistoryDialog
                        instrumentId={item.instrumentId}
                        instrumentName={item.name}
                        symbol={item.symbol}
                      />

                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ id: item.id, name: item.symbol || item.name })}
                        className="rounded p-1 text-[#94A3B8] hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Hapus dari Watchlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Apple Styled Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        isLoading={isDeleting}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={confirmDeleteWatchlist}
        title="Hapus dari Daftar Pantauan?"
        description={
          deleteTarget ? (
            <>
              Apakah Anda yakin ingin menghapus <strong className="text-[#1E293B]">{deleteTarget.name}</strong> dari daftar pantauan harga pasar Anda?
            </>
          ) : null
        }
        confirmText="Hapus dari Pantauan"
      />
    </div>
  );
}
