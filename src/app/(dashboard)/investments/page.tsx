import { requireAuth } from "@/lib/auth";
import { HoldingsService } from "@/application/use-cases/portfolio/holdings-service";
import { AccountsService } from "@/application/use-cases/portfolio/accounts-service";
import { InstrumentsService } from "@/application/use-cases/portfolio/instruments-service";
import { MarketDataSyncService } from "@/application/use-cases/portfolio/market-data-sync-service";
import { CurrencyService } from "@/application/use-cases/system/currency-service";
import { formatCurrency } from "@/lib/decimal";
import { HoldingItem } from "@/presentation/components/portfolio/holdings-table";
import { AccountItem } from "@/presentation/components/portfolio/accounts-table";
import { InstrumentItem } from "@/presentation/components/portfolio/instruments-table";
import { InvestmentsTabsView } from "@/presentation/components/portfolio/investments-tabs-view";
import { AccountDialog } from "@/presentation/components/portfolio/account-dialog";
import { InstrumentDialog } from "@/presentation/components/portfolio/instrument-dialog";
import { RecordTransactionDialog } from "@/presentation/components/portfolio/record-transaction-dialog";
import { RefreshQuotesButton } from "@/presentation/components/portfolio/refresh-quotes-button";
import { Button } from "@/presentation/components/ui/button";
import { TrendingUp, TrendingDown, Layers, PieChart, Building2, LineChart, Plus } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InvestmentsPage() {
  const session = await requireAuth();
  const targetCurrency = session.reportingCurrency || "IDR";

  // Automatic daily price sync check non-blocking in background
  void MarketDataSyncService.autoSyncIfStale(session.userId).catch(() => {});

  const [{ holdings, summary }, accounts, instruments] = await Promise.all([
    HoldingsService.listActiveHoldings(session.userId),
    AccountsService.listAccounts(session.userId),
    InstrumentsService.listInstruments(session.userId),
  ]);

  const [dispMarketValue, dispCostBasis, dispUnrealizedPL] = await Promise.all([
    CurrencyService.convert(summary.totalMarketValue, targetCurrency, "IDR"),
    CurrencyService.convert(summary.totalCostBasis, targetCurrency, "IDR"),
    CurrencyService.convert(summary.totalUnrealizedPL, targetCurrency, "IDR"),
  ]);

  const isProfit = parseFloat(summary.totalUnrealizedPL) >= 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#E4E8EF]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-0.5">
            PORTOFOLIO INSTRUMEN
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Portofolio Investasi</h1>
          <p className="text-sm text-[#64748B]">
            Pencatatan kepemilikan saham, reksa dana, emas, dan obligasi dengan weighted-average cost.
          </p>
        </div>
        {/* Responsive Toolbar Buttons: Catat Transaksi AT THE TOP on mobile, 3 secondary buttons below, single inline row on tablet & desktop */}
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

          {/* Secondary Buttons Grid on Mobile (order-2), Inline on Desktop/Tablet (order-2) */}
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-2 order-2 w-full sm:w-auto shrink-0">
            <RefreshQuotesButton className="w-full sm:w-auto h-10 sm:h-9.5" />
            <AccountDialog
              triggerButton={
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto gap-1.5 sm:gap-2 h-10 sm:h-9.5 px-3 border border-black/[0.08] bg-white text-xs font-semibold sm:font-medium text-[#1C1C1E] hover:bg-black/[0.03] active:scale-[0.98] rounded-xl shadow-2xs transition-all justify-center whitespace-nowrap shrink-0"
                >
                  <Building2 className="h-3.5 w-3.5 text-[#007AFF] shrink-0" />
                  <span className="truncate">+ Akun</span>
                </Button>
              }
            />
            <InstrumentDialog
              triggerButton={
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto gap-1.5 sm:gap-2 h-10 sm:h-9.5 px-3 border border-black/[0.08] bg-white text-xs font-semibold sm:font-medium text-[#1C1C1E] hover:bg-black/[0.03] active:scale-[0.98] rounded-xl shadow-2xs transition-all justify-center whitespace-nowrap shrink-0"
                >
                  <LineChart className="h-3.5 w-3.5 text-[#AF52DE] shrink-0" />
                  <span className="truncate">+ Instrumen</span>
                </Button>
              }
            />
          </div>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Market Value */}
        <div className="adm-card p-5">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold uppercase tracking-wider">Nilai Pasar Portofolio</span>
            <PieChart className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-[#1E293B] font-mono">
            {formatCurrency(dispMarketValue, targetCurrency)}
          </div>
          <span className="text-xs text-[#94A3B8] mt-1 block">
            Berdasarkan valuasi harga pasar terkini
          </span>
        </div>

        {/* Total Cost Basis */}
        <div className="adm-card p-5">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold uppercase tracking-wider">Total Modal Terinvestasi</span>
            <Layers className="h-4 w-4 text-[#475569]" />
          </div>
          <div className="text-2xl font-bold text-[#1E293B] font-mono">
            {formatCurrency(dispCostBasis, targetCurrency)}
          </div>
          <span className="text-xs text-[#94A3B8] mt-1 block">
            Total modal pokok (Weighted Average Basis)
          </span>
        </div>

        {/* Total Unrealized P/L */}
        <div className="adm-card p-5">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold uppercase tracking-wider">Unrealized P/L</span>
            {isProfit ? (
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </div>
          <div
            className={`text-2xl font-bold font-mono ${
              isProfit ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {isProfit ? "+" : ""}
            {formatCurrency(dispUnrealizedPL, targetCurrency)}
          </div>
          <span
            className={`text-xs font-semibold mt-1 block ${
              isProfit ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {isProfit ? "+" : ""}
            {summary.totalUnrealizedPLPercentage}% terhadap modal
          </span>
        </div>

        {/* Position Count */}
        <div className="adm-card p-5">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold uppercase tracking-wider">Posisi Aktif</span>
            <Layers className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-[#1E293B] font-mono">
            {summary.positionCount}
          </div>
          <span className="text-xs text-[#94A3B8] mt-1 block">
            Instrumen dengan saldo kepemilikan &gt; 0
          </span>
        </div>
      </div>

      {/* Tabs View (Holdings, Accounts, Instruments) */}
      <InvestmentsTabsView
        holdings={holdings as unknown as HoldingItem[]}
        accounts={accounts as unknown as AccountItem[]}
        instruments={instruments as unknown as InstrumentItem[]}
      />
    </div>
  );
}
