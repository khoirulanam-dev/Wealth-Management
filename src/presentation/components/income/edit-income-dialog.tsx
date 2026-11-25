"use client";

import { useState } from "react";
import { Edit2, PiggyBank, AlertCircle, Loader2, X } from "lucide-react";
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
import { updateIncomeAction } from "@/app/actions/income-actions";
import { IncomeItemDetail } from "@/application/use-cases/income/income-service";

interface EditIncomeDialogProps {
  item: IncomeItemDetail;
  triggerButton?: React.ReactNode;
  onUpdated?: () => void;
}

export function EditIncomeDialog({
  item,
  triggerButton,
  onUpdated,
}: EditIncomeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState(item.type || "dividend");
  const [status, setStatus] = useState(item.status || "pending");
  const [expectedAmount, setExpectedAmount] = useState(
    item.expectedAmount ? String(parseFloat(item.expectedAmount)) : ""
  );
  const [actualAmount, setActualAmount] = useState(
    item.actualAmount ? String(parseFloat(item.actualAmount)) : ""
  );
  const [exDate, setExDate] = useState(
    item.exDate ? new Date(item.exDate).toISOString().split("T")[0] : ""
  );
  const [paymentDate, setPaymentDate] = useState(
    item.paymentDate ? new Date(item.paymentDate).toISOString().split("T")[0] : ""
  );
  const [notes, setNotes] = useState(item.note || "");
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("incomeId", item.id);
    formData.append("type", type);
    formData.append("status", status);
    formData.append("expectedAmount", expectedAmount);
    formData.append("actualAmount", status === "received" ? (actualAmount || expectedAmount) : "");
    formData.append("eventDate", exDate);
    formData.append("receivedDate", paymentDate);
    formData.append("notes", notes);

    const result = await updateIncomeAction(formData);

    if (result.success) {
      toast.success("Catatan pendapatan berhasil diperbarui");
      setIsLoading(false);
      setIsOpen(false);
      if (onUpdated) onUpdated();
    } else {
      const errMsg = result.error || "Gagal memperbarui pendapatan";
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
          title="Edit Pendapatan"
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
                  <PiggyBank className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Edit Catatan Pendapatan</h3>
                  <p className="text-xs text-[#64748B]">
                    {item.instrumentName || item.instrumentSymbol || "Pendapatan Pasif"}
                  </p>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Jenis Pendapatan
                  </label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dividend">Dividen Saham</SelectItem>
                      <SelectItem value="coupon">Kupon SBN/Obligasi</SelectItem>
                      <SelectItem value="distribution">Bagi Hasil Reksa Dana</SelectItem>
                      <SelectItem value="interest">Bunga Deposito/Tabungan</SelectItem>
                      <SelectItem value="other">Pendapatan Lain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Status
                  </label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Menunggu Cair (Pending)</SelectItem>
                      <SelectItem value="received">Sudah Diterima (Received)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Estimasi Nominal (Rp)
                  </label>
                  <FormattedNumberInput
                    value={expectedAmount}
                    onValueChange={setExpectedAmount}
                    required
                    placeholder="Contoh: 1.500.000"
                    className="h-10 text-sm font-mono"
                  />
                </div>

                {status === "received" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                      Nominal Riil Diterima (Rp)
                    </label>
                    <FormattedNumberInput
                      value={actualAmount}
                      onValueChange={setActualAmount}
                      placeholder="Sama dengan estimasi jika tidak ada potongan"
                      className="h-10 text-sm font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Tanggal Ex-Date (Opsional)
                  </label>
                  <Input
                    type="date"
                    value={exDate}
                    onChange={(e) => setExDate(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Tanggal Pembayaran
                  </label>
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Catatan / Keterangan
                </label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan dividen atau kupon..."
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

