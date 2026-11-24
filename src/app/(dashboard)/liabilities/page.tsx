import { requireAuth } from "@/lib/auth";
import { LiabilityService } from "@/application/use-cases/liabilities/liability-service";
import { CashService } from "@/application/use-cases/cash/cash-service";
import { CurrencyService } from "@/application/use-cases/system/currency-service";
import { formatCurrency, formatDate } from "@/lib/decimal";
import { CreditCard, CalendarClock, CheckCircle2, AlertCircle } from "lucide-react";
import { LiabilityDialog } from "@/presentation/components/liabilities/liability-dialog";
import { LiabilitiesTable } from "@/presentation/components/liabilities/liabilities-table";

export default async function LiabilitiesPage() {
  const session = await requireAuth();
  const targetCurrency = session.reportingCurrency || "IDR";

  const [liabilitiesList, summary, cashAccounts] = await Promise.all([
    LiabilityService.getLiabilities(session.userId),
    LiabilityService.getSummary(session.userId),
    CashService.listCashAccounts(session.userId),
  ]);

  const [dispOutstanding, dispOriginal, dispMonthly, dispNextDueAmount] = await Promise.all([
    CurrencyService.convert(summary.totalOutstanding, targetCurrency, "IDR"),
    CurrencyService.convert(summary.totalOriginalAmount, targetCurrency, "IDR"),
    CurrencyService.convert(summary.totalMonthlyCommitment, targetCurrency, "IDR"),
    summary.nextDuePayment
      ? CurrencyService.convert(summary.nextDuePayment.amount, targetCurrency, "IDR")
      : Promise.resolve(null),
  ]);

  const cashOptions = cashAccounts.map((c) => ({
    id: c.id,
    name: c.name,
    institution: c.institution,
    currentBalance: c.currentBalance,
  }));

  const hasLiabilities = liabilitiesList.length > 0;
  const isDebtFree = parseFloat(summary.totalOutstanding) === 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E8EF]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
            MANAJEMEN KEWAJIBAN
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Liabilitas &amp; Utang</h1>
          <p className="text-sm text-[#64748B]">
            Pencatatan PayLater, tagihan kartu kredit, cicilan pembelian, dan pinjaman aktif terverifikasi.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <LiabilityDialog />
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Sisa Utang */}
        <div className="adm-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Total Sisa Liabilitas
            </span>
            <CreditCard className="h-4 w-4 text-rose-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-rose-600 font-mono">
              {formatCurrency(dispOutstanding, targetCurrency)}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Dari total pokok pinjaman {formatCurrency(dispOriginal, targetCurrency)}
            </p>
          </div>
        </div>

        {/* KPI 2: Beban Cicilan Bulanan */}
        <div className="adm-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Beban Cicilan Bulanan
            </span>
            <CalendarClock className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#1E293B] font-mono">
              {formatCurrency(dispMonthly, targetCurrency)}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Total komitmen pengeluaran rutin bulanan
            </p>
          </div>
        </div>

        {/* KPI 3: Jatuh Tempo Terdekat */}
        <div className="adm-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Jatuh Tempo Terdekat
            </span>
            {summary.nextDuePayment?.isOverdue ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <CalendarClock className="h-4 w-4 text-amber-600" />
            )}
          </div>
          <div>
            {summary.nextDuePayment ? (
              <>
                <div className="text-2xl font-bold tracking-tight text-[#1E293B] font-mono">
                  {formatDate(summary.nextDuePayment.dueDate)}
                </div>
                <p className="text-xs text-[#64748B] mt-1 truncate">
                  {summary.nextDuePayment.liabilityName} (
                  {dispNextDueAmount
                    ? formatCurrency(dispNextDueAmount, targetCurrency)
                    : formatCurrency(summary.nextDuePayment.amount, targetCurrency)}
                  )
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold tracking-tight text-[#1E293B]">
                  Tidak Ada
                </div>
                <p className="text-xs text-[#64748B] mt-1">
                  Tidak ada tagihan mendesak
                </p>
              </>
            )}
          </div>
        </div>

        {/* KPI 4: Status Kewajiban */}
        <div className="adm-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Status Kesehatan Utang
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">
              {isDebtFree ? "Bebas Utang" : `${summary.activeCount} Aktif`}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              {summary.settledCount} lunas &bull; {summary.overdueCount} terlambat
            </p>
          </div>
        </div>
      </div>

      {/* Main Liabilities Table */}
      <div className="adm-card p-6">
        <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <CreditCard className="h-5 w-5 text-rose-600" />
            <div>
              <h2 className="text-base font-bold text-[#1E293B]">Daftar Kewajiban &amp; Tagihan</h2>
              <p className="text-xs text-[#64748B]">
                Saldo sisa berkurang berdasarkan pencatatan pembayaran cicilan riil
              </p>
            </div>
          </div>
          {hasLiabilities && (
            <span className="text-xs text-[#64748B]">
              {liabilitiesList.length} Akun Liabilitas
            </span>
          )}
        </div>

        <LiabilitiesTable
          liabilities={liabilitiesList}
          cashAccounts={cashOptions}
        />
      </div>
    </div>
  );
}
