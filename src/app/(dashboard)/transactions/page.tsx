import { requireAuth } from "@/lib/auth";
import { TransactionsService } from "@/application/use-cases/portfolio/transactions-service";
import { AccountsService } from "@/application/use-cases/portfolio/accounts-service";
import { InstrumentsService } from "@/application/use-cases/portfolio/instruments-service";
import { TransactionsTable, TransactionItem } from "@/presentation/components/portfolio/transactions-table";
import { RecordTransactionDialog } from "@/presentation/components/portfolio/record-transaction-dialog";
import { AccountDialog } from "@/presentation/components/portfolio/account-dialog";
import { InstrumentDialog } from "@/presentation/components/portfolio/instrument-dialog";
import { History } from "lucide-react";

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
        <div className="flex flex-wrap items-center gap-2">
          <AccountDialog />
          <InstrumentDialog />
          <RecordTransactionDialog
            accounts={accounts}
            instruments={instruments}
          />
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
