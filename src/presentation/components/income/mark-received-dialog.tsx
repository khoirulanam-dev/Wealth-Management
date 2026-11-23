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
import { markIncomeReceivedAction } from "@/app/actions/income-actions";
import { formatCurrency } from "@/lib/decimal";

interface CashAccountOption {
  id: string;
  name: string;
  institution: string;
  currentBalance: string;
}

interface MarkReceivedDialogProps {
  incomeId: string;
  instrumentName?: string | null;
  expectedAmount?: string | null;
  currency?: string;
  cashAccounts: CashAccountOption[];
  onReceived?: () => void;
  triggerButton?: React.ReactNode;
}

export function MarkReceivedDialog({
  incomeId,
  instrumentName,
  expectedAmount,
  currency = "IDR",
  cashAccounts,
  onReceived,
  triggerButton,
}: MarkReceivedDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [actualAmount, setActualAmount] = useState(
    expectedAmount ? String(parseFloat(expectedAmount)) : ""
  );
  const [depositToCashAccountId, setDepositToCashAccountId] = useState("none");

  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("incomeId", incomeId);
    formData.set("actualAmount", actualAmount);
    if (depositToCashAccountId && depositToCashAccountId !== "none") {
      formData.set("depositToCashAccountId", depositToCashAccountId);
    }

    const result = await markIncomeReceivedAction(formData);

    if (result.success) {
      toast.success("Pendapatan telah berhasil direalisasikan!");
      setIsLoading(false);
      setIsOpen(false);
      if (onReceived) onReceived();
    } else {
      const errMsg = "error" in result ? result.error : "Gagal merealisasikan pendapatan";
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
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
          title="Tandai Sudah Diterima"
        >
          <CheckCircle2 className="h-3 w-3" />
          Realisasikan
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#E4E8EF] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 my-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Realisasikan Pendapatan Pasif</h3>
                  <p className="text-xs text-[#64748B]">{instrumentName || "Pendapatan Investasi"}</p>
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

            {expectedAmount && (
              <div className="mt-4 p-3 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Estimasi Sebelumnya:</span>
                <span className="font-mono font-bold text-[#1E293B]">
                  {formatCurrency(expectedAmount, currency)}
                </span>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Nominal Bersih Riil Diterima ({currency})
                </label>
                <Input
                  type="number"
                  step="any"
                  name="actualAmount"
                  value={actualAmount}
                  onChange={(e) => setActualAmount(e.target.value)}
                  required
                  placeholder="Contoh: 1500000"
                  className="h-10 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Setor ke Rekening Kas / RDN
                  </label>
                  <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                    <Wallet className="h-3 w-3" /> Opsional
                  </span>
                </div>
                <Select value={depositToCashAccountId} onValueChange={setDepositToCashAccountId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih rekening kas penerima" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak menyetor (Pencatatan laporan saja)</SelectItem>
                    {cashAccounts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.institution})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-[#64748B] block">
                  Jika dipilih, saldo kas di rekening bank/RDN Anda akan langsung bertambah.
                </span>
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
                  disabled={isLoading || !actualAmount}
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
                      Konfirmasi Realisasi
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
