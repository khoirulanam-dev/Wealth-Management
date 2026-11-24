import { requireAuth } from "@/lib/auth";
import { SnapshotService } from "@/application/use-cases/analytics/snapshot-service";
import { CurrencyService } from "@/application/use-cases/system/currency-service";
import { NetWorthChart } from "@/presentation/components/analytics/net-worth-chart";
import { AssetAllocationDonut } from "@/presentation/components/analytics/asset-allocation-donut";
import { ContributionsVsGrowth } from "@/presentation/components/analytics/contributions-vs-growth";
import { CaptureSnapshotButton } from "@/presentation/components/analytics/capture-snapshot-button";
import { AssetLogo } from "@/presentation/components/ui/asset-logo";
import { ExportDialog } from "@/presentation/components/import-export/export-dialog";
import { SharePortfolioDialog } from "@/presentation/components/import-export/share-portfolio-dialog";
import { ShareAllocationDialog } from "@/presentation/components/analytics/share-allocation-dialog";
import { formatCurrency } from "@/lib/decimal";
import {
  BarChart3,
  TrendingUp,
  Wallet,
  CreditCard,
  Building2,
  PieChart,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await requireAuth();
  const currency = session.reportingCurrency || "IDR";

  const [snapshots, analytics] = await Promise.all([
    SnapshotService.listSnapshots(session.userId),
    SnapshotService.getAnalytics(session.userId),
  ]);

  const [
    dispNetWorth,
    dispTotalInvestments,
    dispTotalCash,
    dispTotalLiabilities,
    dispCapitalInvested,
    dispMarketGain,
    dispUnrealizedPL,
    dispIncomeYtd,
  ] = await Promise.all([
    CurrencyService.convert(analytics.netWorth, currency, "IDR"),
    CurrencyService.convert(analytics.totalInvestments, currency, "IDR"),
    CurrencyService.convert(analytics.totalCash, currency, "IDR"),
    CurrencyService.convert(analytics.totalLiabilities, currency, "IDR"),
    CurrencyService.convert(analytics.contributionsVsGains.totalCapitalInvested, currency, "IDR"),
    CurrencyService.convert(analytics.contributionsVsGains.totalMarketGain, currency, "IDR"),
    CurrencyService.convert(analytics.totalUnrealizedPL, currency, "IDR"),
    CurrencyService.convert(analytics.totalRealizedIncomeYTD, currency, "IDR"),
  ]);

  const dispAllocations = await Promise.all(
    analytics.assetAllocation.map(async (a) => {
      const convVal = await CurrencyService.convert(a.value, currency, "IDR");
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
      reportingCurrency: currency,
      netWorth: Number((await CurrencyService.convert(s.netWorth, currency, "IDR")).toFixed(2)),
      totalInvestments: Number((await CurrencyService.convert(s.totalInvestments, currency, "IDR")).toFixed(2)),
      totalCash: Number((await CurrencyService.convert(s.totalCash, currency, "IDR")).toFixed(2)),
      totalLiabilities: Number((await CurrencyService.convert(s.totalLiabilities, currency, "IDR")).toFixed(2)),
    }))
  );

  const dispInstitutions = await Promise.all(
    analytics.institutionAllocation.map(async (inst) => {
      const convVal = await CurrencyService.convert(inst.value, currency, "IDR");
      return {
        ...inst,
        value: convVal.toNumber(),
      };
    })
  );

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
        <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2 sm:gap-2 shrink-0">
          <div className="grid grid-cols-1 sm:flex sm:items-center gap-2 sm:gap-2 w-full sm:w-auto shrink-0">
            <SharePortfolioDialog
              netWorth={dispNetWorth.toFixed(2)}
              totalInvestments={dispTotalInvestments.toFixed(2)}
              totalCash={dispTotalCash.toFixed(2)}
              totalLiabilities={dispTotalLiabilities.toFixed(2)}
              overallReturnPercent={analytics.contributionsVsGains.gainPercentage}
              allocations={dispAllocations.map((a) => ({
                category: a.name,
                value: parseFloat(a.value),
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
      </div>

      {/* 4 Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Net Worth */}
        <div className="adm-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Kekayaan Bersih</span>
            <Wallet className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1E293B]">
            {formatCurrency(dispNetWorth, currency)}
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
            {formatCurrency(dispCapitalInvested, currency)}
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
              dispMarketGain.greaterThanOrEqualTo(0)
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {dispMarketGain.greaterThanOrEqualTo(0) ? "+" : ""}
            {formatCurrency(dispMarketGain, currency)}
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
          <NetWorthChart initialData={dispSnapshots} currency={currency} />
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
            <ShareAllocationDialog
              data={dispAllocations}
              userName={session.name || (session.email ? session.email.split("@")[0] : "Investor")}
              currency={currency}
            />
          </div>
          <AssetAllocationDonut data={dispAllocations} currency={currency} />
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
            totalCapitalInvested={dispCapitalInvested.toFixed(2)}
            totalMarketGain={dispMarketGain.toFixed(2)}
            gainPercentage={analytics.contributionsVsGains.gainPercentage}
            totalUnrealizedPL={dispUnrealizedPL.toFixed(2)}
            totalRealizedIncome={dispIncomeYtd.toFixed(2)}
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

          {dispInstitutions.length > 0 ? (
            <div className="space-y-3.5">
              {dispInstitutions.map((inst) => (
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
