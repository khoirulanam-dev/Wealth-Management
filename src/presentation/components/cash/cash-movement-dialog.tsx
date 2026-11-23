"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, AlertCircle, Loader2, X } from "lucide-react";
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
import { recordCashMovementAction } from "@/app/actions/cash-actions";

interface CashAccountOption {
  id: string;
  name: string;
  institution: string;
  currentBalance: string;
}

interface CashMovementDialogProps {
  accounts: CashAccountOption[];
  onMovementRecorded?: () => void;
  triggerButton?: React.ReactNode;
}

export function CashMovementDialog({
  accounts,
  onMovementRecorded,
  triggerButton,
}: CashMovementDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [movementDate, setMovementDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const { toast } = useToast();

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("cashAccountId", selectedAccountId);
    formData.append("type", type);
    formData.append("amount", amount);
    formData.append("movementDate", movementDate);
    formData.append("note", note);

    const result = await recordCashMovementAction(formData);

    if (result.success) {
      toast.success(
        type === "deposit"
          ? "Setoran kas berhasil dicatat!"
          : "Penarikan kas berhasil dicatat!"
      );
      setIsLoading(false);
      setIsOpen(false);
      setAmount("");
      setNote("");
      if (onMovementRecorded) onMovementRecorded();
    } else {
      const errMsg = result.error || "Gagal mencatat mutasi kas";
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
          <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
          Setor / Tarik Kas
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl border border-[#E4E8EF] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 my-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    type === "deposit" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  }`}
                >
                  {type === "deposit" ? (
                    <ArrowDownLeft className="h-5 w-5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">
                    {type === "deposit" ? "Setor Saldo Kas (Deposit)" : "Tarik Saldo Kas (Withdrawal)"}
                  </h3>
                  <p className="text-xs text-[#64748B]">Pencatatan mutasi kas langsung ke rekening</p>
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
              {/* Type Switcher */}
              <div className="grid grid-cols-2 p-1 bg-[#F1F5F9] rounded-xl">
                <button
                  type="button"
                  onClick={() => setType("deposit")}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                    type === "deposit"
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-[#64748B] hover:text-[#1E293B]"
                  }`}
                >
                  <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                  Setor (Masuk)
                </button>
                <button
                  type="button"
                  onClick={() => setType("withdrawal")}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                    type === "withdrawal"
                      ? "bg-white text-red-700 shadow-sm"
                      : "text-[#64748B] hover:text-[#1E293B]"
                  }`}
                >
                  <ArrowUpRight className="h-4 w-4 text-red-600" />
                  Tarik (Keluar)
                </button>
              </div>

              {/* Account Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Pilih Rekening Kas
                </label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih rekening" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name} ({acc.institution})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedAccount && (
                  <p className="text-xs text-[#64748B] pt-0.5">
                    Saldo saat ini: <span className="font-mono font-semibold text-[#1E293B]">Rp {parseFloat(selectedAccount.currentBalance).toLocaleString("id-ID")}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Nominal (Rp)
                  </label>
                  <Input
                    type="number"
                    step="any"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1000000"
                    className="h-10 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Tanggal Mutasi
                  </label>
                  <Input
                    type="date"
                    required
                    value={movementDate}
                    onChange={(e) => setMovementDate(e.target.value)}
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
                  placeholder="Contoh: Gaji bulanan, hasil penarikan dividen, dll"
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
                  className={`font-medium text-white ${
                    type === "deposit"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : type === "deposit" ? (
                    "Simpan Setoran"
                  ) : (
                    "Simpan Penarikan"
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

