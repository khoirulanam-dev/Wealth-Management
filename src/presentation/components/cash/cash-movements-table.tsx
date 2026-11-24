"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, SlidersHorizontal, History, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/decimal";
import { deleteCashMovementAction } from "@/app/actions/cash-actions";
import { useToast } from "@/presentation/components/ui/toast";
import { ConfirmDialog } from "@/presentation/components/ui/confirm-dialog";

export interface CashMovementItem {
  id: string;
  cashAccountId: string;
  accountName: string;
  institution: string;
  type: string;
  amount: string;
  currency: string;
  movementDate: Date;
  transferGroupId: string | null;
  note: string | null;
  status: string;
  createdAt: Date;
}

interface CashMovementsTableProps {
  movements: CashMovementItem[];
}

export function CashMovementsTable({ movements }: CashMovementsTableProps) {
  const [deleteMovementId, setDeleteMovementId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  async function confirmDeleteMovement() {
    if (!deleteMovementId) return;
    setIsDeleting(true);
    const result = await deleteCashMovementAction(deleteMovementId);
    if (result.success) {
      toast.success("Catatan mutasi berhasil dihapus");
      setDeleteMovementId(null);
    } else {
      toast.error(result.error || "Gagal menghapus mutasi");
    }
    setIsDeleting(false);
  }

  if (movements.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E4E8EF] bg-white p-12 text-center shadow-card">
        <History className="h-8 w-8 text-[#94A3B8] mx-auto mb-3" strokeWidth={1.5} />
        <h3 className="text-base font-bold text-[#1E293B]">Belum Ada Riwayat Mutasi Kas</h3>
        <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1 leading-relaxed">
          Semua transaksi setor tunai, penarikan, transfer antar rekening, dan rekonsiliasi saldo akan tercatat otomatis di buku besar kas ini.
        </p>
      </div>
    );
  }

  function getMovementBadge(type: string) {
    switch (type) {
      case "deposit":
        return {
          label: "Setor Kas",
          icon: <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />,
          colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
        };
      case "withdrawal":
        return {
          label: "Penarikan",
          icon: <ArrowUpRight className="h-3.5 w-3.5 text-rose-600" />,
          colorClass: "text-rose-700 bg-rose-50 border-rose-200",
        };
      case "transfer_in":
        return {
          label: "Transfer Masuk",
          icon: <ArrowRightLeft className="h-3.5 w-3.5 text-blue-600" />,
          colorClass: "text-blue-700 bg-blue-50 border-blue-200",
        };
      case "transfer_out":
        return {
          label: "Transfer Keluar",
          icon: <ArrowRightLeft className="h-3.5 w-3.5 text-amber-600" />,
          colorClass: "text-amber-700 bg-amber-50 border-amber-200",
        };
      case "adjustment":
        return {
          label: "Rekonsiliasi",
          icon: <SlidersHorizontal className="h-3.5 w-3.5 text-purple-600" />,
          colorClass: "text-purple-700 bg-purple-50 border-purple-200",
        };
      case "opening_balance":
      default:
        return {
          label: "Saldo Awal",
          icon: <ArrowDownLeft className="h-3.5 w-3.5 text-slate-600" />,
          colorClass: "text-slate-700 bg-slate-100 border-slate-200",
        };
    }
  }

  return (
    <div className="rounded-2xl border border-[#E4E8EF] bg-white shadow-card overflow-hidden">
      <div className="border-b border-[#E4E8EF] px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#1E293B]">Buku Besar Mutasi Kas</h2>
          <p className="text-xs text-[#64748B]">Riwayat arus kas, transfer internal, dan audit rekonsiliasi saldo</p>
        </div>
        <span className="text-xs font-mono text-[#94A3B8]">{movements.length} Catatan</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E4E8EF] bg-[#F8FAFC] text-[#64748B] font-semibold uppercase tracking-wider text-xs">
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Rekening</th>
              <th className="py-3 px-4">Jenis Transaksi</th>
              <th className="py-3 px-4">Keterangan / Alasan</th>
              <th className="py-3 px-4 text-right">Nominal</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E8EF] text-[#1E293B]">
            {movements.map((mov) => {
              const badge = getMovementBadge(mov.type);
              const isPositive =
                mov.type === "deposit" ||
                mov.type === "transfer_in" ||
                mov.type === "opening_balance";
              const isNegative = mov.type === "withdrawal" || mov.type === "transfer_out";

              const d = new Date(mov.movementDate);
              const formattedDate = d.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });

              return (
                <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Date */}
                  <td className="py-3 px-4 font-mono text-[#64748B] whitespace-nowrap">
                    {formattedDate}
                  </td>

                  {/* Account */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#1E293B] block">{mov.accountName}</span>
                    <span className="text-xs text-[#94A3B8]">{mov.institution}</span>
                  </td>

                  {/* Transaction Type */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${badge.colorClass}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                  </td>

                  {/* Note / Audit details */}
                  <td className="py-3 px-4 text-[#475569] max-w-xs truncate">
                    {mov.note || (
                      <span className="text-[#94A3B8] italic font-mono text-xs">-</span>
                    )}
                  </td>

                  {/* Amount */}
                  <td
                    className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${
                      isPositive
                        ? "text-emerald-600"
                        : isNegative
                        ? "text-rose-600"
                        : "text-[#1E293B]"
                    }`}
                  >
                    {isPositive ? "+" : isNegative ? "-" : ""}
                    {formatCurrency(mov.amount, mov.currency || "IDR")}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => setDeleteMovementId(mov.id)}
                      className="rounded p-1 text-[#94A3B8] hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Hapus Mutasi Kas"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!deleteMovementId}
        isLoading={isDeleting}
        onClose={() => !isDeleting && setDeleteMovementId(null)}
        onConfirm={confirmDeleteMovement}
        title="Hapus Catatan Mutasi Kas?"
        description="Apakah Anda yakin ingin menghapus catatan mutasi kas ini? Saldo rekening terkait akan disesuaikan kembali secara otomatis."
        confirmText="Hapus Mutasi"
      />
    </div>
  );
}

