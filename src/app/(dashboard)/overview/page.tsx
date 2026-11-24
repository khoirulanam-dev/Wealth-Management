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
  RefreshCw,
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
import { CurrencyService } from "@/application/use-cases/system/currency-service";
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

  const targetCurrency = session.reportingCurrency || "IDR";

  // Convert financial metrics into reporting currency using real-time live FX rates
  const [
    dispNetWorth,
    dispTotalInvestments,
    dispTotalCash,
    dispTotalLiabilities,
    dispIncomeYtd,
    dispEmergencyFund,
    fxBadge,
  ] = await Promise.all([
    CurrencyService.convert(netWorth, targetCurrency, "IDR"),
    CurrencyService.convert(summary.totalMarketValue, targetCurrency, "IDR"),
    CurrencyService.convert(cashSummary.totalCashBalance, targetCurrency, "IDR"),
    CurrencyService.convert(liabilitySummary.totalOutstanding, targetCurrency, "IDR"),
    CurrencyService.convert(incomeSummary.totalRealizedYTD, targetCurrency, "IDR"),
    CurrencyService.convert(cashSummary.emergencyFundCurrent, targetCurrency, "IDR"),
    CurrencyService.getExchangeRateBadge(targetCurrency),
  ]);

  const dispAllocations = await Promise.all(
    analytics.assetAllocation.map(async (a) => {
      const convVal = await CurrencyService.convert(a.value, targetCurrency, "IDR");
      return {
        name: a.name,
        assetType: a.assetType,
        value: convVal.toString(),
        percentage: a.percentage,
        color: a.color,
      };
    })
  );

  const dispSnapshots = await Promise.all(
    snapshots.map(async (s) => ({
      ...s,
      reportingCurrency: targetCurrency,
      netWorth: Number((await CurrencyService.convert(s.netWorth, targetCurrency, "IDR")).toFixed(2)),
      totalInvestments: Number((await CurrencyService.convert(s.totalInvestments, targetCurrency, "IDR")).toFixed(2)),
      totalCash: Number((await CurrencyService.convert(s.totalCash, targetCurrency, "IDR")).toFixed(2)),
      totalLiabilities: Number((await CurrencyService.convert(s.totalLiabilities, targetCurrency, "IDR")).toFixed(2)),
    }))
  );

  return (
    <div className="space-y-6">
      {/* Adminator Hero Section */}
      <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#007AFF]" />
              Jumat · 20 November 2026
            </span>
            {fxBadge && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-[11px] font-medium border border-[#007AFF]/20">
                <RefreshCw className="h-3 w-3 animate-spin duration-3000" />
                <span>Kurs Real-Time: {fxBadge}</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E293B]">
            Selamat datang kembali, <span className="text-[#007AFF]">{capitalUserName}</span>
          </h1>
          <p className="text-sm text-[#64748B] max-w-2xl leading-relaxed">
            Konsolidasi menyeluruh posisi aset finansial, portofolio investasi, saldo kas likuid, dan jadwal liabilitas.
          </p>
        </div>
        {/* Action Buttons Toolbar: Catat Transaksi AT THE TOP on mobile, 2x2 grid below, single inline row on tablet & desktop */}
        <div className="w-full xl:w-auto flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2.5 sm:gap-2 shrink-0">
          {/* Primary Action Button: AT THE TOP on Mobile (order-1), First inline on Tablet/Desktop (order-1) */}
          <div className="order-1 w-full sm:w-auto shrink-0">
            <RecordTransactionDialog
              accounts={accounts}
              instruments={instruments}
              triggerButton={
                <Button
                  className="w-full sm:w-auto h-10 sm:h-9.5 px-3.5 gap-2 bg-[#007AFF] hover:bg-[#0066D6] active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-xs shadow-[#007AFF]/25 transition-all justify-center whitespace-nowrap shrink-0"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Catat Transaksi</span>
                </Button>
              }
            />
          </div>

          {/* Symmetrical 2x2 Utility Grid on Mobile (order-2), Inline on Tablet/Desktop (order-2) */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2 order-2 w-full sm:w-auto shrink-0">
            <SharePortfolioDialog
              netWorth={dispNetWorth.toFixed(2)}
              totalInvestments={dispTotalInvestments.toFixed(2)}
              totalCash={dispTotalCash.toFixed(2)}
              totalLiabilities={dispTotalLiabilities.toFixed(2)}
              overallReturnPercent={Number(summary.totalUnrealizedPLPercentage) || 0}
              allocations={dispAllocations.map((a) => ({
                category: a.name,
                value: parseFloat(a.value),
                percentage: a.percentage,
                color: a.color,
              }))}
              userName={capitalUserName}
              currency={targetCurrency}
              triggerButton={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto h-10 sm:h-9.5 gap-1.5 sm:gap-2 px-3 text-xs font-semibold sm:font-medium text-[#1C1C1E] bg-white border border-black/[0.08] hover:bg-black/[0.03] rounded-xl justify-center shadow-2xs active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
                >
                  <Share2 className="h-3.5 w-3.5 text-[#007AFF] shrink-0" />
                  <span className="truncate">Bagikan Portofolio</span>
                </Button>
              }
            />

            <CaptureSnapshotButton className="w-full sm:w-auto h-10 sm:h-9.5 gap-1.5 sm:gap-2 px-3 text-xs font-semibold sm:font-medium text-[#1C1C1E] bg-white border border-black/[0.08] hover:bg-black/[0.03] rounded-xl justify-center shadow-2xs active:scale-[0.98] transition-all whitespace-nowrap shrink-0" />

            <ExportDialog
              triggerButton={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto h-10 sm:h-9.5 gap-1.5 sm:gap-2 px-3 text-xs font-semibold sm:font-medium text-[#1C1C1E] bg-white border border-black/[0.08] hover:bg-black/[0.03] rounded-xl justify-center shadow-2xs active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
                >
                  <Download className="h-3.5 w-3.5 text-[#8E8E93] shrink-0" />
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
                  className="w-full sm:w-auto h-10 sm:h-9.5 gap-1.5 sm:gap-2 px-3 text-xs font-semibold sm:font-medium text-[#1C1C1E] bg-white border border-black/[0.08] hover:bg-black/[0.03] rounded-xl justify-center shadow-2xs active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
                >
                  <Upload className="h-3.5 w-3.5 text-[#007AFF] shrink-0" />
                  <span className="truncate">Impor Data</span>
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
              {formatCurrency(dispNetWorth, targetCurrency)}
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
              {formatCurrency(dispTotalInvestments, targetCurrency)}
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
              {formatCurrency(dispTotalCash, targetCurrency)}
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
              {formatCurrency(dispTotalLiabilities, targetCurrency)}
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

          <NetWorthChart initialData={dispSnapshots} currency={targetCurrency} />
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
              data={dispAllocations}
              userName={capitalUserName}
              currency={targetCurrency}
            />
          </div>

          <AssetAllocationDonut data={dispAllocations} currency={targetCurrency} />
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
              {formatCurrency(dispIncomeYtd, targetCurrency)}
            </div>
            <p className="text-xs text-[#94A3B8]">Realisasi pendapatan tahun {new Date().getFullYear()} &rarr;</p>
          </div>
          <PiggyBank className="h-6 w-6 text-emerald-600" strokeWidth={1.5} />
        </Link>

        <div className="adm-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#64748B]">Dana Darurat Terkumpul</span>
            <div className="text-2xl font-bold tabular-nums text-[#1E293B]">
              {formatCurrency(dispEmergencyFund, targetCurrency)}
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
