import { requireAuth } from "@/lib/auth";
import { IncomeService } from "@/application/use-cases/income/income-service";
import { InstrumentsService } from "@/application/use-cases/portfolio/instruments-service";
import { AccountsService } from "@/application/use-cases/portfolio/accounts-service";
import { CashService } from "@/application/use-cases/cash/cash-service";
import { formatCurrency } from "@/lib/decimal";
import { PiggyBank, CalendarClock, TrendingUp, Calendar, Layers } from "lucide-react";
import { IncomeDialog } from "@/presentation/components/income/income-dialog";
import { IncomeTable } from "@/presentation/components/income/income-table";

export default async function IncomePage() {
  const session = await requireAuth();

  const [incomeList, summary, instruments, accounts, cashAccounts] = await Promise.all([
    IncomeService.listIncome(session.userId),
    IncomeService.getSummary(session.userId),
    InstrumentsService.listInstruments(session.userId),
    AccountsService.listAccounts(session.userId),
    CashService.listCashAccounts(session.userId),
  ]);

  const instrumentOptions = instruments.map((i) => ({
    id: i.id,
    name: i.name,
    symbol: i.symbol,
    assetType: i.assetType,
  }));

  const accountOptions = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    institution: a.institution,
  }));

  const cashOptions = cashAccounts.map((c) => ({
    id: c.id,
    name: c.name,
    institution: c.institution,
    currentBalance: c.currentBalance,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E8EF]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
            PENDAPATAN PASIF &amp; IMBAL HASIL
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Dividen &amp; Passive Income</h1>
          <p className="text-sm text-[#64748B]">
            Pencatatan dividen saham, kupon obligasi/SBN, bagi hasil reksa dana, dan bunga simpanan dengan pemisahan tegas antara realisasi riil dan estimasi proyeksi.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <IncomeDialog
            instruments={instrumentOptions}
            accounts={accountOptions}
            cashAccounts={cashOptions}
          />
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Realisasi Pendapatan YTD */}
        <div className="adm-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Realisasi Diterima YTD
            </span>
            <PiggyBank className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600 font-mono">
              {formatCurrency(summary.totalRealizedYTD, "IDR")}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Tahun berjalan ({new Date().getFullYear()})
            </p>
          </div>
        </div>

        {/* KPI 2: Proyeksi Mendatang (Forecast) */}
        <div className="adm-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Proyeksi Mendatang
            </span>
            <CalendarClock className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#1E293B] font-mono">
              {formatCurrency(summary.totalForecastUpcoming, "IDR")}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Estimasi dividen &amp; kupon belum cair
            </p>
          </div>
        </div>

        {/* KPI 3: Akumulasi Lifetime */}
        <div className="adm-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Total Akumulasi Lifetime
            </span>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#1E293B] font-mono">
              {formatCurrency(summary.totalRealizedLifetime, "IDR")}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Total hasil investasi riil seluruh waktu
            </p>
          </div>
        </div>

        {/* KPI 4: Rata-rata per Bulan */}
        <div className="adm-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Rata-rata per Bulan (YTD)
            </span>
            <Calendar className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#1E293B] font-mono">
              {formatCurrency(summary.monthlyAverageYTD, "IDR")}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Arus kas pasif bulanan berjalan
            </p>
          </div>
        </div>
      </div>

      {/* Main Income Ledger Table */}
      <div className="adm-card p-6">
        <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-[#1E293B]">Buku Besar Dividen &amp; Kupon</h2>
              <p className="text-xs text-[#64748B]">
                Riwayat pendapatan riil diterima dan jadwal estimasi pembayaran berikutnya
              </p>
            </div>
          </div>
          {incomeList.length > 0 && (
            <span className="text-xs text-[#64748B]">
              {incomeList.length} Catatan Pendapatan
            </span>
          )}
        </div>

        <IncomeTable
          items={incomeList}
          cashAccounts={cashOptions}
        />
      </div>
    </div>
  );
}
