"use client";

import { useState } from "react";
import { Scale, AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { FormattedNumberInput } from "@/presentation/components/ui/formatted-number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useToast } from "@/presentation/components/ui/toast";
import { reconcileCashAccountAction } from "@/app/actions/cash-actions";
import { formatCurrency } from "@/lib/decimal";

interface CashAccountOption {
  id: string;
  name: string;
  institution: string;
  currentBalance: string;
}

interface ReconcileDialogProps {
  accounts: CashAccountOption[];
  defaultAccountId?: string;
  onReconciled?: () => void;
  triggerButton?: React.ReactNode;
}

export function ReconcileDialog({
  accounts,
  defaultAccountId,
  onReconciled,
  triggerButton,
}: ReconcileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedAccountId, setSelectedAccountId] = useState(defaultAccountId || accounts[0]?.id || "");
  const [observedBalance, setObservedBalance] = useState("");
  const [reconcileDate, setReconcileDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const appBalance = selectedAccount ? parseFloat(selectedAccount.currentBalance) : 0;
  const realBalance = observedBalance ? parseFloat(observedBalance) : appBalance;
  const diff = realBalance - appBalance;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Alasan koreksi/rekonsiliasi saldo wajib diisi.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("cashAccountId", selectedAccountId);
    formData.append("observedBalance", observedBalance || appBalance.toString());
    formData.append("reconcileDate", reconcileDate);
    formData.append("reason", reason);

    const result = await reconcileCashAccountAction(formData);

    if (result.success) {
      toast.success(
        "Rekonsiliasi saldo kas berhasil!",
        "Saldo telah disesuaikan dan catatan audit tersimpan."
      );
      setIsLoading(false);
      setIsOpen(false);
      setObservedBalance("");
      setReason("");
      if (onReconciled) onReconciled();
    } else {
      const errMsg = result.error || "Gagal melakukan rekonsiliasi";
      setError(errMsg);
      toast.error(errMsg);
      setIsLoading(false);
    }
  }

  if (accounts.length === 0) return null;

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer inline-block">
          {triggerButton}
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="gap-2 border-[#E4E8EF] text-[#1E293B] hover:bg-slate-50 font-medium text-xs h-9"
        >
          <Scale className="h-4 w-4 text-amber-600" />
          Rekonsiliasi Saldo
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/[0.04] backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl sm:max-w-2xl rounded-2xl border border-[#E4E8EF] bg-white p-6 sm:p-7 shadow-xl animate-in fade-in zoom-in-95 duration-150 my-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Rekonsiliasi Saldo Kas</h3>
                  <p className="text-xs text-[#64748B]">Sinkronkan saldo aplikasi dengan saldo rekening fisik Anda</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-[#94A3B8] hover:bg-slate-100 hover:text-[#1E293B]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Pilih Rekening yang Akan Direkonsiliasi
                </label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih rekening" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name} ({acc.institution}) - Rp {parseFloat(acc.currentBalance).toLocaleString("id-ID")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Balance Comparison Card */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E4E8EF] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Saldo di Aplikasi:</span>
                  <span className="font-mono font-semibold text-[#1E293B]">
                    {formatCurrency(appBalance.toString())}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Saldo Fisik Hasil Cek:</span>
                  <span className="font-mono font-semibold text-[#1E293B]">
                    {formatCurrency(realBalance.toString())}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E4E8EF] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1E293B]">Selisih Penyesuaian:</span>
                  <span
                    className={`font-mono font-bold ${
                      diff > 0
                        ? "text-emerald-600"
                        : diff < 0
                        ? "text-red-600"
                        : "text-[#64748B]"
                    }`}
                  >
                    {diff > 0 ? "+" : ""}
                    {formatCurrency(diff.toString())}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Saldo Fisik Asli (Rp)
                  </label>
                  <FormattedNumberInput
                    required
                    value={observedBalance}
                    onValueChange={setObservedBalance}
                    placeholder={appBalance.toString()}
                    className="h-10 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Tanggal Pengecekan
                  </label>
                  <Input
                    type="date"
                    required
                    value={reconcileDate}
                    onChange={(e) => setReconcileDate(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Alasan Koreksi / Penyesuaian (Wajib)
                </label>
                <Input
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Contoh: Bunga bank, biaya administrasi, selisih hitung"
                  className="h-10 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E8EF]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Memproses...
                    </>
                  ) : (
                    "Simpan Rekonsiliasi"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

