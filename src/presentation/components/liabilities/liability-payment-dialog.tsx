"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, X, Wallet } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useToast } from "@/presentation/components/ui/toast";
import { recordLiabilityPaymentAction } from "@/app/actions/liability-actions";
import { formatCurrency } from "@/lib/decimal";
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
  creditor: string;
  outstandingBalance: string;
  installmentAmount: string | null;
  dueDate: Date | null;
}

interface LiabilityPaymentDialogProps {
  liability: LiabilityItem;
  cashAccounts: CashAccountOption[];
  onPaymentRecorded?: () => void;
  triggerButton?: React.ReactNode;
}

export function LiabilityPaymentDialog({
  liability,
  cashAccounts,
  onPaymentRecorded,
  triggerButton,
}: LiabilityPaymentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [amount, setAmount] = useState(
    liability.installmentAmount ? String(parseFloat(liability.installmentAmount)) : ""
  );
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [fromCashAccountId, setFromCashAccountId] = useState("none");
  const [note, setNote] = useState("");

  const { toast } = useToast();

  const outstandingDec = new Decimal(liability.outstandingBalance);
  const paymentDec = new Decimal(amount || "0");
  const projectedRemaining = outstandingDec.minus(paymentDec);
  const isSettlement = projectedRemaining.lte(0) && paymentDec.gt(0);

  function handleFullSettlement() {
    setAmount(outstandingDec.toFixed(2));
  }

  function handleMonthlyInstallment() {
    if (liability.installmentAmount) {
      setAmount(new Decimal(liability.installmentAmount).toFixed(2));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("liabilityId", liability.id);
    formData.set("amount", amount);
    formData.set("paymentDate", paymentDate);
    if (fromCashAccountId && fromCashAccountId !== "none") {
      formData.set("fromCashAccountId", fromCashAccountId);
    }
    if (note) formData.set("note", note);

    const result = await recordLiabilityPaymentAction(formData);

    if (result.success) {
      toast.success(
        isSettlement
          ? "Selamat! Liabilitas telah lunas seluruhnya."
          : "Pembayaran cicilan berhasil dicatat!"
      );
      setIsLoading(false);
      setIsOpen(false);
      if (onPaymentRecorded) onPaymentRecorded();
    } else {
      const errMsg = result.error || "Gagal mencatat pembayaran";
      setError(errMsg);
      toast.error(errMsg);
      setIsLoading(false);
    }
  }

  return (
    <>
      {triggerButton ? (
        <span onClick={() => setIsOpen(true)}>{triggerButton}</span>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="gap-1.5 h-8 border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-semibold"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Bayar
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl sm:max-w-2xl rounded-2xl border border-[#E4E8EF] bg-white p-6 sm:p-7 shadow-xl animate-in fade-in zoom-in-95 duration-150 my-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Catat Pembayaran Liabilitas</h3>
                  <p className="text-xs text-[#64748B]">{liability.name} ({liability.creditor})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-[#94A3B8] hover:bg-slate-100 hover:text-[#1E293B]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sisa Utang Info Box */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#64748B] block">Sisa Kewajiban Saat Ini</span>
                <span className="text-base font-bold text-rose-600 font-mono">
                  {formatCurrency(liability.outstandingBalance, "IDR")}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                {liability.installmentAmount && (
                  <button
                    type="button"
                    onClick={handleMonthlyInstallment}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Bayar Cicilan Bulan Ini
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleFullSettlement}
                  className="text-xs font-semibold text-emerald-600 hover:underline"
                >
                  Lunasi Seluruhnya
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Nominal Pembayaran (Rp)
                </label>
                <Input
                  type="number"
                  step="any"
                  name="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="Contoh: 1250000"
                  className="h-10 text-sm font-mono"
                />
                {paymentDec.gt(0) && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[#64748B]">Proyeksi Sisa Utang:</span>
                    <span
                      className={`font-semibold font-mono ${
                        projectedRemaining.isZero()
                          ? "text-emerald-600"
                          : projectedRemaining.isNegative()
                          ? "text-red-600"
                          : "text-[#1E293B]"
                      }`}
                    >
                      {projectedRemaining.lte(0)
                        ? "LUNAS (Rp 0)"
                        : formatCurrency(projectedRemaining.toFixed(2), "IDR")}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Tanggal Pembayaran
                </label>
                <Input
                  type="date"
                  name="paymentDate"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="h-10 text-sm"
                />
              </div>

              {/* Potong dari Saldo Kas */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Potong dari Rekening Kas
                  </label>
                  <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                    <Wallet className="h-3 w-3" /> Opsional
                  </span>
                </div>
                <Select value={fromCashAccountId} onValueChange={setFromCashAccountId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih rekening kas sumber" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak memotong kas (Pencatatan saja)</SelectItem>
                    {cashAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name} ({acc.institution}) — Saldo: {formatCurrency(acc.currentBalance, "IDR")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-[#64748B] block">
                  Jika dipilih, saldo kas di rekening terkait otomatis terpotong sebagai mutasi pengeluaran.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Catatan Pembayaran (Opsional)
                </label>
                <Input
                  name="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Cicilan ke-3 dari 6, pelunasan THR"
                  className="h-10 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E8EF]">
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
                  disabled={isLoading || paymentDec.lte(0)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Posting Pembayaran
                    </>
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
