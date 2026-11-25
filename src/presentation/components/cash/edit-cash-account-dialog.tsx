"use client";

import { useState } from "react";
import { Edit2, Wallet, AlertCircle, Loader2, X } from "lucide-react";
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
import { updateCashAccountAction } from "@/app/actions/cash-actions";
import { CashAccountItem } from "./cash-accounts-table";

interface EditCashAccountDialogProps {
  account: CashAccountItem;
  triggerButton?: React.ReactNode;
  onUpdated?: () => void;
}

export function EditCashAccountDialog({
  account,
  triggerButton,
  onUpdated,
}: EditCashAccountDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(account.name);
  const [institution, setInstitution] = useState(account.institution);
  const [accountType, setAccountType] = useState(account.accountType || "bank");
  const [isEmergencyFund, setIsEmergencyFund] = useState(account.isEmergencyFund || false);
  const [emergencyFundTarget, setEmergencyFundTarget] = useState(
    account.emergencyFundTarget ? String(parseFloat(account.emergencyFundTarget)) : ""
  );
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("cashAccountId", account.id);
    formData.append("name", name);
    formData.append("institution", institution);
    formData.append("accountType", accountType);
    formData.append("isEmergencyFund", String(isEmergencyFund));
    formData.append("emergencyFundTarget", isEmergencyFund ? emergencyFundTarget : "");

    const result = await updateCashAccountAction(formData);

    if (result.success) {
      toast.success("Rekening kas berhasil diperbarui");
      setIsLoading(false);
      setIsOpen(false);
      if (onUpdated) onUpdated();
    } else {
      const errMsg = result.error || "Gagal memperbarui rekening kas";
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
          onClick={() => setIsOpen(true)}
          className="rounded p-1 text-[#94A3B8] hover:bg-blue-50 hover:text-blue-600 transition-colors"
          title="Edit Rekening"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/[0.04] backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl border border-[#E4E8EF] bg-white p-6 sm:p-7 shadow-xl animate-in fade-in zoom-in-95 duration-150 my-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Edit Rekening Kas</h3>
                  <p className="text-xs text-[#64748B]">Perbarui rincian atau alokasi dana darurat</p>
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
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: BCA Tabungan Utama"
                  className="h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Institusi / Bank
                  </label>
                  <Input
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="BCA, Mandiri, GoPay"
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
                    <label className="text-xs font-semibold text-[#64748B] block mb-1">
                      Target Dana Darurat untuk Rekening Ini (Rp)
                    </label>
                    <FormattedNumberInput
                      value={emergencyFundTarget}
                      onValueChange={setEmergencyFundTarget}
                      placeholder="Contoh: 30.000.000"
                      className="h-9 text-xs font-mono bg-white"
                    />
                  </div>
                )}
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
                    "Simpan Perubahan"
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

