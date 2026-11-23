"use client";

import { useState } from "react";
import {
  PiggyBank,
  CheckCircle2,
  Clock,
  Trash2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/decimal";
import { deleteIncomeAction } from "@/app/actions/income-actions";
import { useToast } from "@/presentation/components/ui/toast";
import { MarkReceivedDialog } from "./mark-received-dialog";
import { IncomeItemDetail } from "@/application/use-cases/income/income-service";
import { AssetLogo } from "@/presentation/components/ui/asset-logo";

interface CashAccountOption {
  id: string;
  name: string;
  institution: string;
  currentBalance: string;
}

interface IncomeTableProps {
  items: IncomeItemDetail[];
  cashAccounts: CashAccountOption[];
  onDataChanged?: () => void;
}

export function IncomeTable({ items, cashAccounts, onDataChanged }: IncomeTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus catatan pendapatan "${name}"?`)) return;

    setDeletingId(id);
    const formData = new FormData();
    formData.set("incomeId", id);

    const result = await deleteIncomeAction(formData);
    if (result.success) {
      toast.success("Catatan pendapatan berhasil dihapus");
      if (onDataChanged) onDataChanged();
    } else {
      toast.error(result.error || "Gagal menghapus");
    }
    setDeletingId(null);
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case "dividend":
        return "Dividen Saham";
      case "coupon":
        return "Kupon SBN/Obligasi";
      case "distribution":
        return "Bagi Hasil Reksadana";
      case "interest":
        return "Bunga Deposito/Bank";
      default:
        return "Pendapatan Lain";
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[260px] flex flex-col items-center justify-center text-center p-8 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E4E8EF]">
        <PiggyBank className="h-8 w-8 text-[#94A3B8] mb-3" strokeWidth={1.5} />
        <h3 className="text-sm font-bold text-[#1E293B]">Belum Ada Pendapatan Pasif Dicatat</h3>
        <p className="text-xs text-[#64748B] max-w-sm mt-1 leading-relaxed">
          Catat dividen tunai saham, kupon SBN bulanan, atau bunga simpanan Anda secara terstruktur.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#E4E8EF] bg-[#F8FAFC] text-[#64748B] font-semibold uppercase tracking-wider text-xs">
            <th className="py-3 px-4">Sumber / Instrumen</th>
            <th className="py-3 px-4">Jenis</th>
            <th className="py-3 px-4 text-center">Ex-Date / Cum</th>
            <th className="py-3 px-4 text-center">Tanggal Bayar</th>
            <th className="py-3 px-4 text-right">Nominal</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E4E8EF] text-[#1E293B]">
          {items.map((item) => {
            const isReceived = item.status === "received";
            const displayAmount = isReceived ? item.actualAmount : item.expectedAmount;

            return (
              <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <AssetLogo
                      symbol={item.instrumentSymbol}
                      name={item.instrumentName}
                      assetType={item.assetType}
                      size="md"
                    />
                    <div>
                      <span className="font-semibold text-sm text-[#1E293B] block">
                        {item.instrumentSymbol || item.instrumentName || "Pendapatan Langsung"}
                      </span>
                      <span className="text-xs text-[#64748B] block mt-0.5">
                        {item.accountName || item.instrumentName || "Portofolio"}
                      </span>
                      {item.note && (
                        <span className="text-xs text-[#94A3B8] italic block mt-0.5">
                          &quot;{item.note}&quot;
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-xs text-[#64748B] font-medium">
                    {getTypeLabel(item.type)}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center font-mono text-xs text-[#64748B]">
                  {item.exDate ? formatDate(item.exDate) : "-"}
                </td>
                <td className="py-3.5 px-4 text-center font-mono text-xs text-[#64748B]">
                  {item.paymentDate ? formatDate(item.paymentDate) : "-"}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span
                    className={`font-mono text-sm font-bold block ${
                      isReceived ? "text-emerald-600" : "text-blue-600"
                    }`}
                  >
                    {displayAmount ? formatCurrency(displayAmount, item.currency) : "-"}
                  </span>
                  <span className="text-xs text-[#94A3B8] block">
                    {isReceived ? "Riil Masuk" : "Estimasi (Forecast)"}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  {isReceived ? (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Diterima
                    </span>
                  ) : item.status === "forecast" ? (
                    <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      <Clock className="h-3 w-3" />
                      Proyeksi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      Dibatalkan
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {!isReceived && item.status === "forecast" && (
                      <MarkReceivedDialog
                        incomeId={item.id}
                        instrumentName={item.instrumentSymbol || item.instrumentName}
                        expectedAmount={item.expectedAmount}
                        currency={item.currency}
                        cashAccounts={cashAccounts}
                        onReceived={onDataChanged}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          item.id,
                          item.instrumentSymbol || item.instrumentName || "Pendapatan"
                        )
                      }
                      disabled={deletingId === item.id}
                      className="rounded p-1 text-[#94A3B8] hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Hapus Catatan"
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
