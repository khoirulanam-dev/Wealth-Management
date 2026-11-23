"use client";

import { useState } from "react";
import { ArrowRightLeft, AlertCircle, Loader2, X } from "lucide-react";
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
import { recordInternalTransferAction } from "@/app/actions/cash-actions";

interface CashAccountOption {
  id: string;
  name: string;
  institution: string;
  currentBalance: string;
}

interface InternalTransferDialogProps {
  accounts: CashAccountOption[];
  onTransferSuccess?: () => void;
  triggerButton?: React.ReactNode;
}

export function InternalTransferDialog({
  accounts,
  onTransferSuccess,
  triggerButton,
}: InternalTransferDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [transferDate, setTransferDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (fromAccountId === toAccountId) {
      setError("Rekening asal dan tujuan transfer tidak boleh sama.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("fromCashAccountId", fromAccountId);
    formData.append("toCashAccountId", toAccountId);
    formData.append("amount", amount);
    formData.append("transferDate", transferDate);
    formData.append("note", note);

    const result = await recordInternalTransferAction(formData);

    if (result.success) {
      toast.success(
        "Transfer internal berpasangan berhasil!",
        "Total saldo kas dan net worth tetap seimbang (net-to-zero)."
      );
      setIsLoading(false);
      setIsOpen(false);
      setAmount("");
      setNote("");
      if (onTransferSuccess) onTransferSuccess();
    } else {
      const errMsg = result.error || "Gagal melakukan transfer internal";
      setError(errMsg);
      toast.error(errMsg);
      setIsLoading(false);
    }
  }

  if (accounts.length < 2) return null;

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
          <ArrowRightLeft className="h-4 w-4 text-purple-600" />
          Transfer Antar Rekening
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl sm:max-w-2xl rounded-2xl border border-[#E4E8EF] bg-white p-6 sm:p-7 shadow-xl animate-in fade-in zoom-in-95 duration-150 my-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Transfer Internal Kas</h3>
                  <p className="text-xs text-[#64748B]">Pemindahan dana antar rekening pribadi (Net-to-Zero)</p>
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
                  Dari Rekening Asal (Sumber)
                </label>
                <Select value={fromAccountId} onValueChange={setFromAccountId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih rekening asal" />
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Ke Rekening Tujuan
                </label>
                <Select value={toAccountId} onValueChange={setToAccountId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih rekening tujuan" />
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Jumlah Transfer (Rp)
                  </label>
                  <Input
                    type="number"
                    step="any"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="500000"
                    className="h-10 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Tanggal Transfer
                  </label>
                  <Input
                    type="date"
                    required
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Keterangan / Catatan
                </label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Isi saldo e-wallet GoPay dari BCA"
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
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Memproses...
                    </>
                  ) : (
                    "Kirim Transfer Internal"
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
