import Link from "next/link";
import {
  TrendingUp,
  Wallet,
  CreditCard,
  PiggyBank,
  CheckCircle2,
  ArrowUpRight,
  Calendar,
  Layers,
  ChevronRight,
  Plus,
  Share2,
  Download,
  Upload,
} from "lucide-react";
import { formatCurrency } from "@/lib/decimal";
import { requireAuth } from "@/lib/auth";
import { HoldingsService } from "@/application/use-cases/portfolio/holdings-service";
import { AccountsService } from "@/application/use-cases/portfolio/accounts-service";
import { InstrumentsService } from "@/application/use-cases/portfolio/instruments-service";
import { MarketDataSyncService } from "@/application/use-cases/portfolio/market-data-sync-service";
import { CashService } from "@/application/use-cases/cash/cash-service";
import { LiabilityService } from "@/application/use-cases/liabilities/liability-service";
import { WatchlistService } from "@/application/use-cases/portfolio/watchlist-service";
import { IncomeService } from "@/application/use-cases/income/income-service";
import { SnapshotService } from "@/application/use-cases/analytics/snapshot-service";
import { Decimal } from "decimal.js";
import { Button } from "@/presentation/components/ui/button";
import { RecordTransactionDialog } from "@/presentation/components/portfolio/record-transaction-dialog";
import { NetWorthChart } from "@/presentation/components/analytics/net-worth-chart";
import { AssetAllocationDonut } from "@/presentation/components/analytics/asset-allocation-donut";
import { CaptureSnapshotButton } from "@/presentation/components/analytics/capture-snapshot-button";
import { ExportDialog } from "@/presentation/components/import-export/export-dialog";
import { ImportDialog } from "@/presentation/components/import-export/import-dialog";
import { SharePortfolioDialog } from "@/presentation/components/import-export/share-portfolio-dialog";
import { ShareAllocationDialog } from "@/presentation/components/analytics/share-allocation-dialog";

export default async function OverviewPage() {
  const session = await requireAuth();

  // Automatic daily price sync check (triggers if quotes are > 24 hours old)
  await MarketDataSyncService.autoSyncIfStale(session.userId);

  const [{ summary }, accounts, instruments, cashSummary, liabilitySummary, watchlistItems, incomeSummary, snapshots, analytics] = await Promise.all([
    HoldingsService.listActiveHoldings(session.userId),
    AccountsService.listAccounts(session.userId),
    InstrumentsService.listInstruments(session.userId),
    CashService.getCashSummary(session.userId),
    LiabilityService.getSummary(session.userId),
    WatchlistService.listWatchlist(session.userId),
    IncomeService.getSummary(session.userId),
    SnapshotService.listSnapshots(session.userId),
    SnapshotService.getAnalytics(session.userId),
  ]);

  const rawUserName = session.email ? session.email.split("@")[0] : "Investor";
  const capitalUserName = session.name || (rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1));

  // Total net worth = (investments + cash & liquid savings) - liabilities
  const netWorth = new Decimal(summary.totalMarketValue)
    .plus(cashSummary.totalCashBalance)
    .minus(liabilitySummary.totalOutstanding)
    .toFixed(2);

  return (
    <div className="space-y-6">
      {/* Adminator Hero Section */}
      <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-2">
        <div className="space-y-1">
          <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
            Jumat · 20 November 2026
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E293B]">
            Selamat datang kembali, <span className="text-blue-600">{capitalUserName}</span>
          </h1>
          <p className="text-sm text-[#64748B] max-w-2xl leading-relaxed">
            Konsolidasi menyeluruh posisi aset finansial, portofolio investasi, saldo kas likuid, dan jadwal liabilitas.
          </p>
        </div>
        {/* Action Buttons Toolbar: High-polish 2-row layout on mobile, single horizontal row on tablet & desktop */}
        <div className="w-full xl:w-auto flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 shrink-0">
          {/* Symmetrical 2x2 Utility Grid on Mobile, Flex Inline on Desktop/Tablet */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 order-2 sm:order-1">
            <SharePortfolioDialog
              netWorth={netWorth}
              totalInvestments={summary.totalMarketValue}
              totalCash={cashSummary.totalCashBalance}
              totalLiabilities={liabilitySummary.totalOutstanding}
              overallReturnPercent={Number(summary.totalUnrealizedPLPercentage) || 0}
              allocations={analytics.assetAllocation.map((a) => ({
                category: a.name,
                value: a.value,
                percentage: a.percentage,
                color: a.color,
              }))}
              userName={capitalUserName}
              currency={session.reportingCurrency || "IDR"}
              triggerButton={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto h-9 gap-1.5 px-3 text-xs font-medium text-[#1C1C1E] bg-white border-black/[0.08] hover:bg-black/[0.03] rounded-xl justify-center shadow-2xs active:scale-[0.97] transition-all"
                >
                  <Share2 className="h-3.5 w-3.5 text-[#007AFF]" />
                  <span className="truncate">Bagikan Portofolio</span>
                </Button>
              }
            />

            <CaptureSnapshotButton className="w-full sm:w-auto h-9 gap-1.5 px-3 text-xs font-medium text-[#1C1C1E] bg-white border-black/[0.08] hover:bg-black/[0.03] rounded-xl justify-center shadow-2xs active:scale-[0.97] transition-all" />

            <ExportDialog
              triggerButton={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto h-9 gap-1.5 px-3 text-xs font-medium text-[#1C1C1E] bg-white border-black/[0.08] hover:bg-black/[0.03] rounded-xl justify-center shadow-2xs active:scale-[0.97] transition-all"
                >
                  <Download className="h-3.5 w-3.5 text-[#8E8E93]" />
                  <span className="truncate">Ekspor Data</span>
                </Button>
              }
            />

            <ImportDialog
              triggerButton={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto h-9 gap-1.5 px-3 text-xs font-medium text-[#1C1C1E] bg-white border-black/[0.08] hover:bg-black/[0.03] rounded-xl justify-center shadow-2xs active:scale-[0.97] transition-all"
                >
                  <Upload className="h-3.5 w-3.5 text-[#007AFF]" />
                  <span className="truncate">Impor Data</span>
                </Button>
              }
            />
          </div>

          {/* Primary Action Button: Top on mobile (order-1), inline on tablet/desktop (order-2) */}
          <div className="order-1 sm:order-2 w-full sm:w-auto">
            <RecordTransactionDialog
              accounts={accounts}
              instruments={instruments}
              triggerButton={
                <Button
                  className="w-full sm:w-auto h-9 px-3.5 gap-1.5 bg-[#007AFF] hover:bg-[#0066D6] active:scale-[0.97] text-white font-semibold text-xs rounded-xl shadow-xs shadow-[#007AFF]/25 transition-all justify-center"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  Catat Transaksi
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* 4-Card KPI Grid */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Net Worth */}
        <article className="adm-card p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-[#64748B]">Kekayaan Bersih</span>
            </div>
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Net Worth
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight tabular-nums text-[#1E293B]">
              {formatCurrency(netWorth, "IDR")}
            </div>
          </div>
          <div className="pt-3 border-t border-dashed border-[#EEF1F5] text-xs text-[#94A3B8] flex items-center justify-between">
            <span>Aset - Liabilitas</span>
            <span className="font-mono text-[#475569]">Terkonsolidasi</span>
          </div>
        </article>

        {/* KPI 2: Investments */}
        <article className="adm-card p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-[#64748B]">Nilai Investasi</span>
            </div>
            <span className="text-xs font-medium text-blue-600">
              Portofolio
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight tabular-nums text-[#1E293B]">
              {formatCurrency(summary.totalMarketValue, "IDR")}
            </div>
          </div>
          <div className="pt-3 border-t border-dashed border-[#EEF1F5] text-xs text-[#94A3B8] flex items-center justify-between">
            <span>Saham, RDPU, Emas</span>
            <span className="font-mono text-[#475569]">
              {summary.positionCount} Aset Aktif
            </span>
          </div>
        </article>

        {/* KPI 3: Cash & Savings */}
        <article className="adm-card p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium text-[#64748B]">Kas & Simpanan</span>
            </div>
            <span className="text-xs font-medium text-purple-600">
              Likuid
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight tabular-nums text-[#1E293B]">
              {formatCurrency(cashSummary.totalCashBalance, "IDR")}
            </div>
          </div>
          <div className="pt-3 border-t border-dashed border-[#EEF1F5] text-xs text-[#94A3B8] flex items-center justify-between">
            <span>Bank & Dana Darurat</span>
            <span className="font-mono text-[#475569]">{cashSummary.accountCount} Akun Aktif</span>
          </div>
        </article>

        {/* KPI 4: Liabilities */}
        <article className="adm-card p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-rose-600" />
              <span className="text-xs font-medium text-[#64748B]">Total Liabilitas</span>
            </div>
            <Link
              href="/liabilities"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              Kelola &rarr;
            </Link>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight tabular-nums text-rose-600">
              {formatCurrency(liabilitySummary.totalOutstanding, "IDR")}
            </div>
          </div>
          <div className="pt-3 border-t border-dashed border-[#EEF1F5] text-xs text-[#94A3B8] flex items-center justify-between">
            <span>PayLater & Pinjaman</span>
            <span className="font-mono text-[#475569]">
              {parseFloat(liabilitySummary.totalOutstanding) === 0
                ? "Bebas Utang"
                : `${liabilitySummary.activeCount} Utang Aktif`}
            </span>
          </div>
        </article>
      </section>

      {/* Adminator Panel Grid (Charts & Allocation) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart Panel (8 Columns) */}
        <div className="lg:col-span-8 adm-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4 mb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-0.5">
                HISTORIS TERVERIFIKASI
              </span>
              <h2 className="text-base font-bold text-[#1E293B]">Riwayat Kekayaan Bersih</h2>
            </div>
            <Link
              href="/analytics"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              Lihat Analitik
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <NetWorthChart initialData={snapshots} currency="IDR" />
        </div>

        {/* Side Panel: Asset Allocation (4 Columns) */}
        <div className="lg:col-span-4 adm-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4 mb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 block mb-0.5">
                DISTRIBUSI KELAS ASET
              </span>
              <h2 className="text-base font-bold text-[#1E293B]">Alokasi Portofolio</h2>
            </div>
            <ShareAllocationDialog
              data={analytics.assetAllocation}
              userName={capitalUserName}
              currency="IDR"
            />
          </div>

          <AssetAllocationDonut data={analytics.assetAllocation} currency="IDR" />
        </div>
      </section>

      {/* Supporting Bottom Row: Passive Income & Quick Highlights */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link
          href="/income"
          className="adm-card p-6 flex items-center justify-between hover:border-emerald-300 transition-colors"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#64748B]">Dividen &amp; Bunga Diterima</span>
            <div className="text-2xl font-bold tabular-nums text-emerald-600 font-mono">
              {formatCurrency(incomeSummary.totalRealizedYTD, "IDR")}
            </div>
            <p className="text-xs text-[#94A3B8]">Realisasi pendapatan tahun {new Date().getFullYear()} &rarr;</p>
          </div>
          <PiggyBank className="h-6 w-6 text-emerald-600" strokeWidth={1.5} />
        </Link>

        <div className="adm-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#64748B]">Dana Darurat Terkumpul</span>
            <div className="text-2xl font-bold tabular-nums text-[#1E293B]">
              {formatCurrency(cashSummary.emergencyFundCurrent, "IDR")}
            </div>
            <p className="text-xs text-[#94A3B8]">
              {parseFloat(cashSummary.emergencyFundCoverage) > 0
                ? `Tercapai ${cashSummary.emergencyFundCoverage}% dari target`
                : "Cadangan likuid darurat"}
            </p>
          </div>
          <CheckCircle2 className="h-6 w-6 text-emerald-600" strokeWidth={1.5} />
        </div>

        <Link
          href="/watchlist"
          className="adm-card p-6 flex items-center justify-between hover:border-blue-300 transition-colors"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#64748B]">Instrumen Pantauan</span>
            <div className="text-2xl font-bold tabular-nums text-[#1E293B]">
              {watchlistItems.length} Ticker
            </div>
            <p className="text-xs text-[#94A3B8]">Watchlist terisolasi dari Net Worth &rarr;</p>
          </div>
          <Layers className="h-6 w-6 text-indigo-600" strokeWidth={1.5} />
        </Link>
      </section>
    </div>
  );
}
