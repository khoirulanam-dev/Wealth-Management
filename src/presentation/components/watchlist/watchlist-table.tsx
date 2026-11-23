"use client";

import { useState } from "react";
import {
  Eye,
  RefreshCw,
  Trash2,
  TrendingUp,
  Coins,
  Gem,
  Building,
  CheckCircle2,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/decimal";
import { removeFromWatchlistAction } from "@/app/actions/watchlist-actions";
import { syncSingleInstrumentAction } from "@/app/actions/portfolio-actions";
import { useToast } from "@/presentation/components/ui/toast";
import { ManualValuationDialog } from "@/presentation/components/portfolio/manual-valuation-dialog";
import { ValuationHistoryDialog } from "@/presentation/components/portfolio/valuation-history-dialog";
import { WatchlistItemDetail } from "@/application/use-cases/portfolio/watchlist-service";

interface WatchlistTableProps {
  items: WatchlistItemDetail[];
  onDataChanged?: () => void;
}

export function WatchlistTable({ items, onDataChanged }: WatchlistTableProps) {
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus "${name}" dari daftar pantauan?`)) return;

    setDeletingId(id);
    const formData = new FormData();
    formData.set("watchlistItemId", id);

    const result = await removeFromWatchlistAction(formData);
    if (result.success) {
      toast.success(`"${name}" dihapus dari daftar pantauan`);
      if (onDataChanged) onDataChanged();
    } else {
      toast.error(result.error || "Gagal menghapus");
    }
    setDeletingId(null);
  }

  function getAssetIcon(type: string) {
    switch (type) {
      case "crypto":
        return <Coins className="h-4 w-4 text-amber-500" />;
      case "gold":
        return <Gem className="h-4 w-4 text-yellow-500" />;
      case "stock":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default:
        return <Building className="h-4 w-4 text-indigo-600" />;
    }
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
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#E4E8EF] bg-[#F8FAFC] text-[#64748B] font-semibold uppercase tracking-wider text-xs">
            <th className="py-3 px-4">Instrumen Pantauan</th>
            <th className="py-3 px-4">Kelas Aset</th>
            <th className="py-3 px-4">Bursa / Pasar</th>
            <th className="py-3 px-4 text-right">Harga Kuotasi Terkini</th>
            <th className="py-3 px-4 text-center">Waktu Kuotasi</th>
            <th className="py-3 px-4 text-center">Sumber Data</th>
            <th className="py-3 px-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E4E8EF] text-[#1E293B]">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-[#E4E8EF] shrink-0">
                    {getAssetIcon(item.assetType)}
                  </div>
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
              <td className="py-3.5 px-4">
                <span className="text-xs text-[#64748B] font-medium">
                  {getAssetLabel(item.assetType)}
                </span>
              </td>
              <td className="py-3.5 px-4">
                <span className="text-xs text-[#64748B] font-mono">
                  {item.market || "IDX"}
                </span>
              </td>
              <td className="py-3.5 px-4 text-right">
                {item.latestPrice ? (
                  <span className="font-bold text-sm text-[#1E293B] font-mono block">
                    {formatCurrency(item.latestPrice, item.currency)}
                  </span>
                ) : (
                  <span className="text-xs text-[#94A3B8] italic">Belum ada kuotasi</span>
                )}
              </td>
              <td className="py-3.5 px-4 text-center font-mono text-xs text-[#64748B]">
                {item.latestEffectiveAt ? formatDate(item.latestEffectiveAt) : "-"}
              </td>
              <td className="py-3.5 px-4 text-center">
                {item.isManualOverride ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <ShieldCheck className="h-3 w-3" />
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
                    onClick={() => handleDelete(item.id, item.symbol || item.name)}
                    disabled={deletingId === item.id}
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
  );
}
