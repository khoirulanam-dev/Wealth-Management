"use client";

import { useState } from "react";
import { Plus, Building2, AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { createAccountAction } from "@/app/actions/portfolio-actions";
import { useToast } from "@/presentation/components/ui/toast";

export function AccountDialog({ onAccountCreated }: { onAccountCreated?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accountType, setAccountType] = useState("broker");
  const [currency, setCurrency] = useState("IDR");

  const toast = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("accountType", accountType);
    formData.set("currency", currency);

    const result = await createAccountAction(formData);

    if (result.success) {
      setIsLoading(false);
      setIsOpen(false);
      const name = formData.get("name") as string;
      toast.success("Akun finansial berhasil ditambahkan!", `${name} telah tersimpan dan siap digunakan.`);
      if (onAccountCreated) onAccountCreated();
    } else {
      setError(result.error || "Gagal membuat akun");
      toast.error("Gagal menambahkan akun", result.error);
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2 border-[#E4E8EF] text-[#1E293B] hover:bg-slate-50 font-medium"
      >
        <Building2 className="h-4 w-4 text-blue-600" />
        Tambah Akun Sekuritas/Bank
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-[#E4E8EF] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Tambah Akun Finansial</h3>
                  <p className="text-xs text-[#64748B]">Sekuritas, platform reksa dana, bank, atau emas</p>
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Nama Akun / Portofolio
                </label>
                <Input
                  name="name"
                  required
                  placeholder="Contoh: Stockbit Utama, Bibit Pensiun, Rekening BCA"
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Institusi / Broker
                </label>
                <Input
                  name="institution"
                  required
                  placeholder="Contoh: Sinarmas Sekuritas, Mandiri Sekuritas, BCA"
                  className="h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Tipe Platform
                  </label>
                  <Select value={accountType} onValueChange={setAccountType}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="broker">Sekuritas Saham</SelectItem>
                      <SelectItem value="mutual_fund_platform">Platform Reksa Dana</SelectItem>
                      <SelectItem value="gold_platform">Platform Emas</SelectItem>
                      <SelectItem value="bank">Rekening Bank</SelectItem>
                      <SelectItem value="e_wallet">Dompet Digital</SelectItem>
                      <SelectItem value="manual">Penyimpanan Fisik / Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Mata Uang
                  </label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Pilih mata uang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Catatan (Opsional)
                </label>
                <Input
                  name="notes"
                  placeholder="Nomor RDN / rekening atau catatan strategi"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Simpan Akun
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
