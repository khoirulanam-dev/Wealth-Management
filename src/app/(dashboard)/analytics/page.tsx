import { requireAuth } from "@/lib/auth";
import { SnapshotService } from "@/application/use-cases/analytics/snapshot-service";
import { NetWorthChart } from "@/presentation/components/analytics/net-worth-chart";
import { AssetAllocationDonut } from "@/presentation/components/analytics/asset-allocation-donut";
import { ContributionsVsGrowth } from "@/presentation/components/analytics/contributions-vs-growth";
import { CaptureSnapshotButton } from "@/presentation/components/analytics/capture-snapshot-button";
import { AssetLogo } from "@/presentation/components/ui/asset-logo";
import { ExportDialog } from "@/presentation/components/import-export/export-dialog";
import { SharePortfolioDialog } from "@/presentation/components/import-export/share-portfolio-dialog";
import { formatCurrency } from "@/lib/decimal";
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Wallet,
  CreditCard,
  Building2,
  PieChart,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await requireAuth();

  const [snapshots, analytics] = await Promise.all([
    SnapshotService.listSnapshots(session.userId),
    SnapshotService.getAnalytics(session.userId),
  ]);

  const currency = session.reportingCurrency || "IDR";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E8EF]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 block mb-0.5">
            LAPORAN & INTELIJEN FINANSIAL
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">
            Analitik & Laporan Portofolio
          </h1>
          <p className="text-sm text-[#64748B]">
            Analisis pertumbuhan kekayaan bersih, pemisahan setoran modal vs pertumbuhan pasar riil, dan alokasi aset.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <SharePortfolioDialog
            netWorth={analytics.netWorth}
            totalInvestments={analytics.totalInvestments}
            totalCash={analytics.totalCash}
            totalLiabilities={analytics.totalLiabilities}
            overallReturnPercent={analytics.contributionsVsGains.gainPercentage}
            allocations={analytics.assetAllocation.map((a) => ({
              category: a.name,
              value: a.value,
              percentage: a.percentage,
              color: a.color,
            }))}
            userName={session.email ? session.email.split("@")[0] : "Investor"}
            currency={currency}
          />
          <ExportDialog />
          <CaptureSnapshotButton />
        </div>
      </div>

      {/* 4 Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Net Worth */}
        <div className="adm-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Kekayaan Bersih</span>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1E293B]">
            {formatCurrency(analytics.netWorth, currency)}
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Investasi + Saldo Kas - Liabilitas
          </p>
        </div>

        {/* Modal Pokok */}
        <div className="adm-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Modal Pokok (Setoran)</span>
            <Wallet className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1E293B]">
            {formatCurrency(analytics.contributionsVsGains.totalCapitalInvested, currency)}
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Total modal yang disetorkan
          </p>
        </div>

        {/* Keuntungan Pasar */}
        <div className="adm-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Hasil Pertumbuhan Pasar</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div
            className={`text-2xl font-bold font-mono ${
              parseFloat(analytics.contributionsVsGains.totalMarketGain) >= 0
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {parseFloat(analytics.contributionsVsGains.totalMarketGain) >= 0 ? "+" : ""}
            {formatCurrency(analytics.contributionsVsGains.totalMarketGain, currency)}
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Return {analytics.contributionsVsGains.gainPercentage >= 0 ? "+" : ""}
            {analytics.contributionsVsGains.gainPercentage}% terhadap modal
          </p>
        </div>

        {/* Rasio Likuiditas & Utang */}
        <div className="adm-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Rasio Keamanan</span>
            <CreditCard className="h-4 w-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-purple-600">
              {analytics.liquidityRatio.toFixed(1)}%
            </span>
            <span className="text-xs text-[#94A3B8]">Likuiditas</span>
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Rasio utang terhadap aset:{" "}
            <span className="font-mono font-semibold text-[#1E293B]">
              {analytics.debtToAssetRatio.toFixed(1)}%
            </span>
          </p>
        </div>
      </div>

      {/* Row 1: Net Worth Growth Chart & Asset Allocation Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart (8 Columns) */}
        <div className="lg:col-span-8 adm-card p-6">
          <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <h2 className="text-base font-bold text-[#1E293B]">
                  Kurva Pertumbuhan Kekayaan Bersih
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Riwayat snapshot harian terverifikasi tanpa manipulasi data backfill
                </p>
              </div>
            </div>
          </div>
          <NetWorthChart initialData={snapshots} currency={currency} />
        </div>

        {/* Asset Allocation Donut (4 Columns) */}
        <div className="lg:col-span-4 adm-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <PieChart className="h-5 w-5 text-emerald-600" />
              <div>
                <h2 className="text-base font-bold text-[#1E293B]">
                  Komposisi Kelas Aset
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Distribusi proporsi seluruh kekayaan Anda
                </p>
              </div>
            </div>
          </div>
          <AssetAllocationDonut data={analytics.assetAllocation} currency={currency} />
        </div>
      </div>

      {/* Row 2: Contributions vs Market Gains & Financial Institutions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contributions vs Gain (7 Columns) */}
        <div className="lg:col-span-7 adm-card p-6">
          <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <h2 className="text-base font-bold text-[#1E293B]">
                  Pemisahan Setoran Modal vs Pertumbuhan Riil
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Membedakan uang setoran pribadi dari keuntungan investasi pasar
                </p>
              </div>
            </div>
          </div>
          <ContributionsVsGrowth
            totalCapitalInvested={analytics.contributionsVsGains.totalCapitalInvested}
            totalMarketGain={analytics.contributionsVsGains.totalMarketGain}
            gainPercentage={analytics.contributionsVsGains.gainPercentage}
            totalUnrealizedPL={analytics.totalUnrealizedPL}
            totalRealizedIncome={analytics.totalRealizedIncomeYTD}
            currency={currency}
          />
        </div>

        {/* Institution Distribution (5 Columns) */}
        <div className="lg:col-span-5 adm-card p-6">
          <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <h2 className="text-base font-bold text-[#1E293B]">
                  Sebaran Bank &amp; Sekuritas
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Konsentrasi dana pada masing-masing institusi
                </p>
              </div>
            </div>
          </div>

          {analytics.institutionAllocation.length > 0 ? (
            <div className="space-y-3.5">
              {analytics.institutionAllocation.map((inst) => (
                <div key={inst.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <AssetLogo symbol={inst.name} name={inst.name} size="xs" />
                      <span className="font-semibold text-[#1E293B]">{inst.name}</span>
                    </div>
                    <span className="font-mono text-[#64748B]">
                      {inst.percentage.toFixed(1)}% ({formatCurrency(inst.value, currency)})
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded transition-all duration-300"
                      style={{ width: `${Math.min(inst.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#94A3B8]">
              Belum ada data institusi finansial yang terdaftar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
