"use client";

import { useState } from "react";
import {
  CreditCard,
  ShoppingBag,
  Building,
  Users,
  CheckCircle2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/decimal";
import { deleteLiabilityAction } from "@/app/actions/liability-actions";
import { useToast } from "@/presentation/components/ui/toast";
import { LiabilityPaymentDialog } from "./liability-payment-dialog";
import { Decimal } from "decimal.js";

interface CashAccountOption {
  id: string;
  name: string;
  institution: string;
  currentBalance: string;
}

interface LiabilityItem {
  id: string;
  name: string;
  type: string;
  creditor: string;
  originalAmount: string;
  outstandingBalance: string;
  currency: string;
  startDate: Date;
  dueDate: Date | null;
  installmentAmount: string | null;
  installmentFrequency: string | null;
  installmentCount: number | null;
  status: string;
  isSettled: boolean;
  isOverdue: boolean;
  note: string | null;
  createdAt: Date;
}

interface LiabilitiesTableProps {
  liabilities: LiabilityItem[];
  cashAccounts: CashAccountOption[];
  onDataChanged?: () => void;
}

export function LiabilitiesTable({
  liabilities,
  cashAccounts,
  onDataChanged,
}: LiabilitiesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus catatan liabilitas "${name}"?`)) return;

    setDeletingId(id);
    const formData = new FormData();
    formData.set("liabilityId", id);

    const result = await deleteLiabilityAction(formData);
    if (result.success) {
      toast.success("Liabilitas berhasil dihapus");
      setDeletingId(null);
      if (onDataChanged) onDataChanged();
    } else {
      toast.error(result.error || "Gagal menghapus liabilitas");
      setDeletingId(null);
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case "paylater":
        return <ShoppingBag className="h-4 w-4 text-purple-600" />;
      case "credit_card":
        return <CreditCard className="h-4 w-4 text-rose-600" />;
      case "bank_loan":
        return <Building className="h-4 w-4 text-blue-600" />;
      case "informal":
        return <Users className="h-4 w-4 text-amber-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-slate-600" />;
    }
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case "paylater":
        return "PayLater";
      case "credit_card":
        return "Kartu Kredit";
      case "installment":
        return "Cicilan Barang";
      case "bank_loan":
        return "Pinjaman Bank / KPR";
      case "personal_loan":
        return "Pinjaman Finansial";
      case "informal":
        return "Pinjaman Pribadi";
      default:
        return "Lainnya";
    }
  }

  if (liabilities.length === 0) {
    return (
      <div className="min-h-[260px] flex flex-col items-center justify-center text-center p-8 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E4E8EF]">
        <CreditCard className="h-8 w-8 text-[#94A3B8] mb-3" strokeWidth={1.5} />
        <h3 className="text-sm font-bold text-[#1E293B]">Bebas dari Liabilitas Aktif</h3>
        <p className="text-xs text-[#64748B] max-w-sm mt-1 leading-relaxed">
          Tidak ada kewajiban, cicilan, atau utang yang tercatat. Gunakan tombol &quot;Catat Liabilitas&quot; di atas untuk mulai mencatat.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#E4E8EF] bg-[#F8FAFC] text-[#64748B] font-semibold uppercase tracking-wider text-xs">
            <th className="py-3 px-4">Nama Kewajiban & Kreditor</th>
            <th className="py-3 px-4">Kategori</th>
            <th className="py-3 px-4 text-right">Pokok Pinjaman</th>
            <th className="py-3 px-4 text-right">Sisa Kewajiban</th>
            <th className="py-3 px-4 text-right">Cicilan / Bulan</th>
            <th className="py-3 px-4 text-center">Jatuh Tempo</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E4E8EF] text-[#1E293B]">
          {liabilities.map((item) => {
            const original = new Decimal(item.originalAmount);
            const outstanding = new Decimal(item.outstandingBalance);
            const paidRatio = original.gt(0)
              ? original.minus(outstanding).dividedBy(original).times(100).toNumber()
              : 100;

            return (
              <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-[#E4E8EF] shrink-0">
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-[#1E293B] block leading-tight">
                        {item.name}
                      </span>
                      <span className="text-xs text-[#64748B] block mt-0.5">
                        {item.creditor}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs text-[#64748B] font-medium">
                    {getTypeLabel(item.type)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono text-sm text-[#64748B]">
                  {formatCurrency(item.originalAmount, item.currency)}
                </td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`font-mono text-sm font-bold block ${
                      item.isSettled ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {formatCurrency(item.outstandingBalance, item.currency)}
                  </span>
                  {!item.isSettled && (
                    <div className="mt-1 flex items-center justify-end gap-1.5">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, paidRatio))}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-[#94A3B8]">
                        {Math.round(paidRatio)}%
                      </span>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-mono text-sm text-[#475569]">
                  {item.installmentAmount ? (
                    <div>
                      <span className="font-medium">
                        {formatCurrency(item.installmentAmount, item.currency)}
                      </span>
                      {item.installmentCount && (
                        <span className="text-xs text-[#94A3B8] block">
                          Tenor: {item.installmentCount} bln
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[#94A3B8]">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center font-mono text-xs text-[#64748B]">
                  {item.dueDate ? formatDate(item.dueDate) : "-"}
                </td>
                <td className="py-3 px-4 text-center">
                  {item.isSettled ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Lunas
                    </span>
                  ) : item.isOverdue ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Terlambat
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                      Lancar
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!item.isSettled && (
                      <LiabilityPaymentDialog
                        liability={item}
                        cashAccounts={cashAccounts}
                        onPaymentRecorded={onDataChanged}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.name)}
                      disabled={deletingId === item.id}
                      className="rounded p-1 text-[#94A3B8] hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Hapus Liabilitas"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
