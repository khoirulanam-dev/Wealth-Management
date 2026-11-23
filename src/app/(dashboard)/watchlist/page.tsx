import { requireAuth } from "@/lib/auth";
import { WatchlistService } from "@/application/use-cases/portfolio/watchlist-service";
import { Eye, CheckCircle2, Clock, Layers } from "lucide-react";
import { AddWatchlistDialog } from "@/presentation/components/watchlist/add-watchlist-dialog";
import { RefreshWatchlistButton } from "@/presentation/components/watchlist/refresh-watchlist-button";
import { WatchlistTable } from "@/presentation/components/watchlist/watchlist-table";
import { formatDate } from "@/lib/decimal";

export default async function WatchlistPage() {
  const session = await requireAuth();

  const watchlistItems = await WatchlistService.listWatchlist(session.userId);

  const latestUpdated = watchlistItems
    .map((w) => w.latestEffectiveAt)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E8EF]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
            PANTAUAN HARGA PASAR
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Daftar Pantauan (Watchlist)</h1>
          <p className="text-sm text-[#64748B]">
            Instrumen pasar yang dipantau. Nilai watchlist terisolasi dan tidak mempengaruhi portofolio kepemilikan maupun Net Worth.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <RefreshWatchlistButton />
          <AddWatchlistDialog />
        </div>
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Total Pantauan */}
        <div className="adm-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Total Instrumen Pantauan
            </span>
            <Eye className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#1E293B] font-mono">
              {watchlistItems.length} Instrumen
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Saham IDX, Reksa Dana, Emas, &amp; Kripto
            </p>
          </div>
        </div>

        {/* KPI 2: Status Isolasi Finansial */}
        <div className="adm-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Dampak ke Net Worth
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600 font-mono">
              Rp 0 (Terisolasi)
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Tidak mengubah modal pokok atau saldo kas
            </p>
          </div>
        </div>

        {/* KPI 3: Pembaruan Terakhir */}
        <div className="adm-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Pembaruan Terkini
            </span>
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#1E293B]">
              {latestUpdated ? formatDate(latestUpdated) : "Belum Ada"}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Sinkronisasi harga pasar manual atau terjadwal
            </p>
          </div>
        </div>
      </div>

      {/* Main Watchlist Card */}
      <div className="adm-card p-6">
        <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-[#1E293B]">Katalog Instrumen Terpantau</h2>
              <p className="text-xs text-[#64748B]">
                Pantau harga penutupan dan pergerakan pasar secara independen
              </p>
            </div>
          </div>
          {watchlistItems.length > 0 && (
            <span className="text-xs text-[#64748B]">
              {watchlistItems.length} Ticker Aktif
            </span>
          )}
        </div>

        <WatchlistTable items={watchlistItems} />
      </div>
    </div>
  );
}
