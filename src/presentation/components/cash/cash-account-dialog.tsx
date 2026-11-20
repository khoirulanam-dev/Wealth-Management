"use client";

import { useState } from "react";
import { Plus, Wallet, AlertCircle, Loader2, X } from "lucide-react";
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
import { createCashAccountAction } from "@/app/actions/cash-actions";

export function CashAccountDialog({ onAccountCreated }: { onAccountCreated?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [accountType, setAccountType] = useState("bank");
  const [isEmergencyFund, setIsEmergencyFund] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("accountType", accountType);
    formData.set("isEmergencyFund", isEmergencyFund ? "true" : "false");

    const result = await createCashAccountAction(formData);

    if (result.success) {
      toast.success("Rekening kas berhasil ditambahkan!");
      setIsLoading(false);
      setIsOpen(false);
      setIsEmergencyFund(false);
      if (onAccountCreated) onAccountCreated();
    } else {
      const errMsg = result.error || "Gagal membuat rekening kas";
      setError(errMsg);
      toast.error(errMsg);
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Tambah Rekening Kas
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl border border-[#E4E8EF] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 my-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Tambah Rekening Kas &amp; Simpanan</h3>
                  <p className="text-xs text-[#64748B]">Rekening bank, e-wallet, atau kas fisik tunai</p>
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
                  Nama Rekening
                </label>
                <Input
                  name="name"
                  required
                  placeholder="Contoh: BCA Tabungan Utama, GoPay Harian"
                  className="h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Institusi / Bank
                  </label>
                  <Input
                    name="institution"
                    required
                    placeholder="BCA, Mandiri, GoPay, Tunai"
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Jenis Akun
                  </label>
                  <Select value={accountType} onValueChange={setAccountType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Rekening Bank</SelectItem>
                      <SelectItem value="e_wallet">Dompet Digital (E-Wallet)</SelectItem>
                      <SelectItem value="cash">Kas Tunai / Fisik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Saldo Awal (Rp)
                  </label>
                  <Input
                    name="openingBalance"
                    type="number"
                    step="any"
                    required
                    defaultValue="0"
                    placeholder="0"
                    className="h-10 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Tanggal Saldo Awal
                  </label>
                  <Input
                    name="openingBalanceDate"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              {/* Emergency Fund Checkbox */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E4E8EF] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isEmergencyFund}
                    onChange={(e) => setIsEmergencyFund(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-[#1E293B]">
                    Alokasikan sebagai Dana Darurat (Emergency Fund)
                  </span>
                </label>

                {isEmergencyFund && (
                  <div className="pt-2 animate-in fade-in duration-150">
                    <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                      Target Dana Darurat untuk Rekening Ini (Rp)
                    </label>
                    <Input
                      name="emergencyFundTarget"
                      type="number"
                      step="any"
                      placeholder="Contoh: 30000000"
                      className="h-9 text-xs font-mono bg-white"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Catatan Tambahan (Opsional)
                </label>
                <Input
                  name="notes"
                  placeholder="Contoh: Rekening tabungan khusus biaya tak terduga"
                  className="h-9 text-xs"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Rekening Kas"
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
