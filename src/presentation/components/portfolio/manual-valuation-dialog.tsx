"use client";

import { useState } from "react";
import { Edit3, AlertCircle, Loader2, X, ShieldAlert } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { useToast } from "@/presentation/components/ui/toast";
import { recordManualValuationAction } from "@/app/actions/portfolio-actions";
import { formatCurrency } from "@/lib/decimal";

interface ManualValuationDialogProps {
  instrumentId: string;
  instrumentName: string;
  symbol?: string | null;
  currentPrice?: string | number | null;
  currency?: string;
  onValuationSaved?: () => void;
  triggerButton?: React.ReactNode;
}

export function ManualValuationDialog({
  instrumentId,
  instrumentName,
  symbol,
  currentPrice,
  currency = "IDR",
  onValuationSaved,
  triggerButton,
}: ManualValuationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [price, setPrice] = useState(
    currentPrice ? String(parseFloat(String(currentPrice))) : ""
  );
  const [effectiveAt, setEffectiveAt] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reason, setReason] = useState("");

  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("instrumentId", instrumentId);
    formData.set("price", price);
    formData.set("effectiveAt", effectiveAt);
    formData.set("reason", reason);

    const result = await recordManualValuationAction(formData);

    if (result.success) {
      toast.success(`Valuasi manual untuk ${symbol || instrumentName} berhasil disimpan!`);
      setIsLoading(false);
      setIsOpen(false);
      setReason("");
      if (onValuationSaved) onValuationSaved();
    } else {
      const errMsg = result.error || "Gagal menyimpan valuasi manual";
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
          className="rounded p-1 text-[#94A3B8] hover:bg-blue-50 hover:text-blue-600 transition-colors"
          title="Override Harga Manual"
        >
          <Edit3 className="h-4 w-4" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl sm:max-w-2xl rounded-2xl border border-[#E4E8EF] bg-white p-6 sm:p-7 shadow-xl animate-in fade-in zoom-in-95 duration-150 my-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Override Harga Manual (Audit)</h3>
                  <p className="text-xs text-[#64748B]">
                    {instrumentName} {symbol ? `(${symbol})` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-[#94A3B8] hover:bg-slate-100 hover:text-[#1E293B] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Audit Notice Box */}
            <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 leading-relaxed">
                <span className="font-semibold block">Catatan Audit Integritas Finansial:</span>
                Penyesuaian manual akan disimpan ke buku besar valuasi historis tanpa menghapus riwayat harga sebelumnya. Wajib menyertakan alasan yang jelas.
              </div>
            </div>

            {/* Price Preview */}
            {currentPrice && (
              <div className="mt-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E4E8EF] flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Harga Terakhir Tercatat:</span>
                <span className="font-mono font-bold text-[#1E293B]">
                  {formatCurrency(currentPrice, currency)}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Harga Baru ({currency})
                  </label>
                  <Input
                    type="number"
                    step="any"
                    name="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder="Contoh: 10250"
                    className="h-10 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Tanggal Efektif Valuasi
                  </label>
                  <Input
                    type="date"
                    name="effectiveAt"
                    value={effectiveAt}
                    onChange={(e) => setEffectiveAt(e.target.value)}
                    required
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Alasan Penyesuaian Harga (Wajib Audit)
                </label>
                <Input
                  name="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="Contoh: Koreksi harga penutupan resmi pasar, penyesuaian pasar sekunder"
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
                  disabled={isLoading || !reason.trim() || !price}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4" />
                      Simpan Valuasi
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

