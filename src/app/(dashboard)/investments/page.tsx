import { requireAuth } from "@/lib/auth";
import { HoldingsService } from "@/application/use-cases/portfolio/holdings-service";
import { AccountsService } from "@/application/use-cases/portfolio/accounts-service";
import { InstrumentsService } from "@/application/use-cases/portfolio/instruments-service";
import { MarketDataSyncService } from "@/application/use-cases/portfolio/market-data-sync-service";
import { formatCurrency } from "@/lib/decimal";
import { HoldingItem } from "@/presentation/components/portfolio/holdings-table";
import { AccountItem } from "@/presentation/components/portfolio/accounts-table";
import { InstrumentItem } from "@/presentation/components/portfolio/instruments-table";
import { InvestmentsTabsView } from "@/presentation/components/portfolio/investments-tabs-view";
import { AccountDialog } from "@/presentation/components/portfolio/account-dialog";
import { InstrumentDialog } from "@/presentation/components/portfolio/instrument-dialog";
import { RecordTransactionDialog } from "@/presentation/components/portfolio/record-transaction-dialog";
import { RefreshQuotesButton } from "@/presentation/components/portfolio/refresh-quotes-button";
import { TrendingUp, TrendingDown, Layers, PieChart } from "lucide-react";

export default async function InvestmentsPage() {
  const session = await requireAuth();

  // Automatic daily price sync check (triggers if quotes are > 24 hours old)
  await MarketDataSyncService.autoSyncIfStale(session.userId);

  const [{ holdings, summary }, accounts, instruments] = await Promise.all([
    HoldingsService.listActiveHoldings(session.userId),
    AccountsService.listAccounts(session.userId),
    InstrumentsService.listInstruments(session.userId),
  ]);

  const isProfit = parseFloat(summary.totalUnrealizedPL) >= 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E8EF]">
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-600 block mb-0.5">
            PORTOFOLIO INSTRUMEN
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Portofolio Investasi</h1>
          <p className="text-sm text-[#64748B]">
            Pencatatan kepemilikan saham, reksa dana, emas, dan obligasi dengan weighted-average cost.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RefreshQuotesButton />
          <AccountDialog />
          <InstrumentDialog />
          <RecordTransactionDialog
            accounts={accounts}
            instruments={instruments}
          />
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
            {formatCurrency(summary.totalMarketValue)}
          </div>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">
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
            {formatCurrency(summary.totalCostBasis)}
          </div>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">
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
            {formatCurrency(summary.totalUnrealizedPL)}
          </div>
          <span
            className={`text-[11px] font-semibold mt-1 block ${
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
          <span className="text-[11px] text-[#94A3B8] mt-1 block">
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
