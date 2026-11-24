"use client";

import { Wallet, ShieldAlert, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/decimal";
import { CashMovementDialog } from "./cash-movement-dialog";
import { ReconcileDialog } from "./reconcile-dialog";
import { EditCashAccountDialog } from "./edit-cash-account-dialog";
import { AssetLogo } from "@/presentation/components/ui/asset-logo";
import { deleteCashAccountAction } from "@/app/actions/cash-actions";
import { useToast } from "@/presentation/components/ui/toast";
import { useState } from "react";

export interface CashAccountItem {
  id: string;
  financialAccountId: string;
  name: string;
  institution: string;
  accountType: string;
  openingBalance: string;
  currentBalance: string;
  isEmergencyFund: boolean;
  emergencyFundTarget: string | null;
  currency: string;
  updatedAt: Date;
}

interface CashAccountsTableProps {
  accounts: CashAccountItem[];
  currency?: string;
}

export function CashAccountsTable({ accounts, currency = "IDR" }: CashAccountsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleDeleteAccount(id: string, name: string) {
    if (!confirm(`Hapus rekening "${name}" beserta seluruh riwayat mutasinya?`)) return;
    setDeletingId(id);
    const result = await deleteCashAccountAction(id);
    if (result.success) {
      toast.success(`Rekening ${name} berhasil dihapus`);
    } else {
      toast.error(result.error || "Gagal menghapus rekening");
    }
    setDeletingId(null);
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E4E8EF] bg-white p-12 text-center shadow-card">
        <Wallet className="h-8 w-8 text-[#94A3B8] mx-auto mb-3" strokeWidth={1.5} />
        <h3 className="text-base font-bold text-[#1E293B]">Belum Ada Rekening Kas</h3>
        <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1 leading-relaxed">
          Tambahkan rekening bank utama (BCA, Mandiri), e-wallet (GoPay, OVO), atau kas tunai fisik Anda untuk mulai mencatat likuiditas dan dana darurat.
        </p>
      </div>
    );
  }

  const accountOptions = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    institution: a.institution,
    currentBalance: a.currentBalance,
  }));

  return (
    <div className="rounded-2xl border border-[#E4E8EF] bg-white shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E4E8EF] bg-[#F8FAFC] text-[#64748B] font-semibold uppercase tracking-wider text-xs">
              <th className="py-3.5 px-4">Rekening &amp; Institusi</th>
              <th className="py-3.5 px-4">Jenis Akun</th>
              <th className="py-3.5 px-4 text-center">Status Alokasi</th>
              <th className="py-3.5 px-4 text-right">Saldo Saat Ini</th>
              <th className="py-3.5 px-4 text-center">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E8EF] text-[#1E293B]">
            {accounts.map((acc) => {
              const balNum = parseFloat(acc.currentBalance);

              return (
                <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Account & Institution */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <AssetLogo
                        symbol={acc.institution}
                        name={acc.institution || acc.name}
                        size="md"
                      />
                      <div>
                        <span className="font-bold text-[#1E293B] block">{acc.name}</span>
                        <span className="text-xs text-[#64748B]">{acc.institution}</span>
                      </div>
                    </div>
                  </td>

                  {/* Account Type */}
                  <td className="py-3.5 px-4 text-[#64748B] capitalize">
                    {acc.accountType === "bank"
                      ? "Rekening Bank"
                      : acc.accountType === "e_wallet"
                      ? "Dompet Digital"
                      : "Kas Tunai"}
                  </td>

                  {/* Emergency Fund Badge */}
                  <td className="py-3.5 px-4 text-center">
                    {acc.isEmergencyFund ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <ShieldAlert className="h-3.5 w-3.5 text-emerald-600" />
                        Dana Darurat
                      </span>
                    ) : (
                      <span className="text-xs text-[#94A3B8]">Operasional / Umum</span>
                    )}
                  </td>

                  {/* Balance */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-[#1E293B]">
                    {formatCurrency(balNum, currency)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <CashMovementDialog
                        accounts={accountOptions}
                        triggerButton={
                          <button className="text-xs font-semibold text-blue-600 hover:underline">
                            Setor/Tarik
                          </button>
                        }
                      />
                      <span className="text-[#CBD5E1]">·</span>
                      <ReconcileDialog
                        accounts={accountOptions}
                        defaultAccountId={acc.id}
                        triggerButton={
                          <button className="text-xs font-semibold text-amber-600 hover:underline">
                            Rekonsiliasi
                          </button>
                        }
                      />
                      <span className="text-[#CBD5E1]">·</span>
                      <EditCashAccountDialog account={acc} />
                      <button
                        disabled={deletingId === acc.id}
                        onClick={() => handleDeleteAccount(acc.id, acc.name)}
                        className="rounded p-1 text-[#94A3B8] hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Hapus Rekening"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

