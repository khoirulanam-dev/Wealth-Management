"use client";

import { useState } from "react";
import { Edit2, CreditCard, AlertCircle, Loader2, X } from "lucide-react";
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
import { updateLiabilityAction } from "@/app/actions/liability-actions";

interface LiabilityItem {
  id: string;
  name: string;
  type: string;
  creditor: string;
  originalAmount: string;
  outstandingBalance: string;
  currency: string;
  dueDate: Date | null;
  installmentAmount: string | null;
  status: string;
  note: string | null;
}

interface EditLiabilityDialogProps {
  liability: LiabilityItem;
  triggerButton?: React.ReactNode;
  onUpdated?: () => void;
}

export function EditLiabilityDialog({
  liability,
  triggerButton,
  onUpdated,
}: EditLiabilityDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(liability.name);
  const [type, setType] = useState(liability.type || "paylater");
  const [creditor, setCreditor] = useState(liability.creditor);
  const [originalAmount, setOriginalAmount] = useState(
    liability.originalAmount ? String(parseFloat(liability.originalAmount)) : ""
  );
  const [outstandingBalance, setOutstandingBalance] = useState(
    liability.outstandingBalance ? String(parseFloat(liability.outstandingBalance)) : ""
  );
  const [installmentAmount, setInstallmentAmount] = useState(
    liability.installmentAmount ? String(parseFloat(liability.installmentAmount)) : ""
  );
  const [dueDate, setDueDate] = useState(
    liability.dueDate ? new Date(liability.dueDate).toISOString().split("T")[0] : ""
  );
  const [note, setNote] = useState(liability.note || "");
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("liabilityId", liability.id);
    formData.append("name", name);
    formData.append("type", type);
    formData.append("creditor", creditor);
    formData.append("originalAmount", originalAmount);
    formData.append("outstandingBalance", outstandingBalance);
    formData.append("installmentAmount", installmentAmount);
    formData.append("dueDate", dueDate);
    formData.append("note", note);

    const result = await updateLiabilityAction(formData);

    if (result.success) {
      toast.success("Catatan liabilitas berhasil diperbarui");
      setIsLoading(false);
      setIsOpen(false);
      if (onUpdated) onUpdated();
    } else {
      const errMsg = result.error || "Gagal memperbarui liabilitas";
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
          title="Edit Liabilitas"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl border border-[#E4E8EF] bg-white p-6 sm:p-7 shadow-xl animate-in fade-in zoom-in-95 duration-150 my-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Edit Liabilitas / Kewajiban</h3>
                  <p className="text-xs text-[#64748B]">Perbarui rincian utang, sisa pokok, atau jadwal cicilan</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Kategori / Jenis
                  </label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paylater">PayLater (SPayLater, GoPay Later)</SelectItem>
                      <SelectItem value="credit_card">Kartu Kredit</SelectItem>
                      <SelectItem value="installment">Cicilan Barang Elektronik/Kendaraan</SelectItem>
                      <SelectItem value="bank_loan">Pinjaman Bank / KPR</SelectItem>
                      <SelectItem value="personal_loan">Pinjaman Finansial / P2P</SelectItem>
                      <SelectItem value="informal">Pinjaman Pribadi / Keluarga</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Penyedia / Kreditur
                  </label>
                  <Input
                    required
                    value={creditor}
                    onChange={(e) => setCreditor(e.target.value)}
                    placeholder="BCA, Shopee, Mandiri"
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Nama Liabilitas / Keterangan Tagihan
                </label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: SPayLater Laptop Asus"
                  className="h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Total Pokok Pinjaman (Rp)
                  </label>
                  <FormattedNumberInput
                    value={originalAmount}
                    onValueChange={setOriginalAmount}
                    required
                    placeholder="Contoh: 12.000.000"
                    className="h-10 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Sisa Pokok Saat Ini (Rp)
                  </label>
                  <FormattedNumberInput
                    value={outstandingBalance}
                    onValueChange={setOutstandingBalance}
                    placeholder="0"
                    className="h-10 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Cicilan per Bulan (Rp) (Opsional)
                  </label>
                  <FormattedNumberInput
                    value={installmentAmount}
                    onValueChange={setInstallmentAmount}
                    placeholder="Contoh: 1.250.000"
                    className="h-10 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Jatuh Tempo Pembayaran
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Catatan / Keterangan
                </label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Catatan tambahan liabilitas..."
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

