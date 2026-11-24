import { requireAuth } from "@/lib/auth";
import { CashService } from "@/application/use-cases/cash/cash-service";
import { CurrencyService } from "@/application/use-cases/system/currency-service";
import { formatCurrency } from "@/lib/decimal";
import { Wallet, ShieldAlert, ArrowRightLeft, ArrowDownUp } from "lucide-react";
import { CashAccountDialog } from "@/presentation/components/cash/cash-account-dialog";
import { InternalTransferDialog } from "@/presentation/components/cash/internal-transfer-dialog";
import { CashAccountsTable } from "@/presentation/components/cash/cash-accounts-table";
import { CashMovementsTable } from "@/presentation/components/cash/cash-movements-table";
import { EmergencyFundCard } from "@/presentation/components/cash/emergency-fund-card";

export default async function CashPage() {
  const session = await requireAuth();
  const targetCurrency = session.reportingCurrency || "IDR";

  const [accounts, movements, summary] = await Promise.all([
    CashService.listCashAccounts(session.userId),
    CashService.listMovements(session.userId, 50),
    CashService.getCashSummary(session.userId),
  ]);

  const [dispTotalCash, dispEmergencyFund, dispEmergencyTarget] = await Promise.all([
    CurrencyService.convert(summary.totalCashBalance, targetCurrency, "IDR"),
    CurrencyService.convert(summary.emergencyFundCurrent, targetCurrency, "IDR"),
    CurrencyService.convert(summary.emergencyFundTarget, targetCurrency, "IDR"),
  ]);

  const dispAccounts = await Promise.all(
    accounts.map(async (a) => ({
      ...a,
      currentBalance: (await CurrencyService.convert(a.currentBalance, targetCurrency, "IDR")).toFixed(2),
    }))
  );

  const accountTransferOptions = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    institution: a.institution,
    currentBalance: a.currentBalance,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E8EF]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 block mb-0.5">
            LIKUIDITAS &amp; REKENING
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Kas &amp; Simpanan</h1>
          <p className="text-sm text-[#64748B]">
            Manajemen saldo rekening bank, dompet digital (e-wallet), kas tunai, dan dana darurat.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {accounts.length >= 2 && (
            <InternalTransferDialog accounts={accountTransferOptions} />
          )}
          <CashAccountDialog />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Saldo Kas */}
        <div className="rounded-2xl border border-[#E4E8EF] bg-white p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#64748B]">Total Kas &amp; Likuiditas</span>
            <Wallet className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#1E293B] font-mono">
              {formatCurrency(dispTotalCash, targetCurrency)}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Dari {summary.accountCount} akun terdaftar
            </p>
          </div>
        </div>

        {/* KPI 2: Dana Darurat */}
        <div className="rounded-2xl border border-[#E4E8EF] bg-white p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#64748B]">Dana Darurat (Emergency)</span>
            <ShieldAlert className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600 font-mono">
              {formatCurrency(dispEmergencyFund, targetCurrency)}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Tercapai {summary.emergencyFundCoverage}% dari target
            </p>
          </div>
        </div>

        {/* KPI 3: Jumlah Rekening */}
        <div className="rounded-2xl border border-[#E4E8EF] bg-white p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#64748B]">Akun Terdaftar</span>
            <ArrowRightLeft className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#1E293B] font-mono">
              {summary.accountCount} Rekening
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Bank, E-Wallet, &amp; Kas Fisik
            </p>
          </div>
        </div>

        {/* KPI 4: Aktivitas Mutasi */}
        <div className="rounded-2xl border border-[#E4E8EF] bg-white p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#64748B]">Buku Besar Mutasi</span>
            <ArrowDownUp className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#1E293B] font-mono">
              {movements.length} Mutasi
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Riwayat transaksi kas aktif
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Fund Card */}
      <EmergencyFundCard
        currentAmount={dispEmergencyFund.toFixed(2)}
        targetAmount={dispEmergencyTarget.toFixed(2)}
        coveragePercent={summary.emergencyFundCoverage}
        accountCount={accounts.filter((a) => a.isEmergencyFund).length}
        currency={targetCurrency}
      />

      {/* Cash Accounts Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Daftar Rekening Kas</h2>
            <p className="text-xs text-[#64748B]">
              Daftar rekening bank, e-wallet, dan kas tunai aktif beserta saldo terkini
            </p>
          </div>
        </div>
        <CashAccountsTable accounts={dispAccounts} currency={targetCurrency} />
      </div>

      {/* Cash Movements Ledger Table */}
      <div className="space-y-3">
        <CashMovementsTable movements={movements} />
      </div>
    </div>
  );
}
