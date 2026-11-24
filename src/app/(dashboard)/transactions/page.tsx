import { requireAuth } from "@/lib/auth";
import { TransactionsService } from "@/application/use-cases/portfolio/transactions-service";
import { AccountsService } from "@/application/use-cases/portfolio/accounts-service";
import { InstrumentsService } from "@/application/use-cases/portfolio/instruments-service";
import { TransactionsTable, TransactionItem } from "@/presentation/components/portfolio/transactions-table";
import { RecordTransactionDialog } from "@/presentation/components/portfolio/record-transaction-dialog";
import { AccountDialog } from "@/presentation/components/portfolio/account-dialog";
import { InstrumentDialog } from "@/presentation/components/portfolio/instrument-dialog";
import { History, Plus, Building2, LineChart } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TransactionsPage() {
  const session = await requireAuth();

  const [transactions, accounts, instruments] = await Promise.all([
    TransactionsService.listTransactions(session.userId),
    AccountsService.listAccounts(session.userId),
    InstrumentsService.listInstruments(session.userId),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E8EF]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-0.5">
            LOG AKTIVITAS KEUANGAN
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Buku Besar Transaksi</h1>
          <p className="text-sm text-[#64748B]">
            Pencatatan kronologis aktivitas beli, jual, langganan, dan penebusan aset investasi.
          </p>
        </div>
        <div className="w-full xl:w-auto flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2.5 sm:gap-2 shrink-0">
          <div className="order-1 w-full sm:w-auto shrink-0">
            <RecordTransactionDialog
              accounts={accounts}
              instruments={instruments}
              triggerButton={
                <Button className="w-full sm:w-auto h-10 sm:h-9.5 px-3.5 gap-2 bg-[#007AFF] hover:bg-[#0066D6] active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-xs shadow-[#007AFF]/25 transition-all justify-center whitespace-nowrap shrink-0">
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Catat Transaksi</span>
                </Button>
              }
            />
          </div>
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2 order-2 w-full sm:w-auto shrink-0">
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

      {/* Main Ledger Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1E293B]">Riwayat Ledger Terpadu</h2>
              <p className="text-xs text-[#64748B]">
                Total {transactions.length} transaksi tercatat di database
              </p>
            </div>
          </div>
        </div>

        <TransactionsTable transactions={transactions as unknown as TransactionItem[]} />
      </div>
    </div>
  );
}
