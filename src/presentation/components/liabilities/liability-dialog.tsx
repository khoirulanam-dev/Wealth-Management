"use client";

import { useState } from "react";
import { Plus, CreditCard, AlertCircle, Loader2, X } from "lucide-react";
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
import { createLiabilityAction } from "@/app/actions/liability-actions";

const PRESET_CREDITORS = [
  { name: "Shopee PayLater", type: "paylater", creditor: "PT Commerce Finance (Shopee)" },
  { name: "GoPay Later", type: "paylater", creditor: "PT Findaya (GoTo Financial)" },
  { name: "Kredivo", type: "paylater", creditor: "PT FinAccel Finance Indonesia" },
  { name: "Kartu Kredit BCA", type: "credit_card", creditor: "Bank Central Asia (BCA)" },
  { name: "Kartu Kredit Mandiri", type: "credit_card", creditor: "Bank Mandiri" },
  { name: "KPR Bank Mandiri Griya", type: "bank_loan", creditor: "Bank Mandiri" },
  { name: "KPR BCA", type: "bank_loan", creditor: "Bank Central Asia (BCA)" },
  { name: "Pinjaman Pribadi / Rekan", type: "informal", creditor: "Pribadi" },
];

export function LiabilityDialog({ onLiabilityCreated }: { onLiabilityCreated?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState("paylater");
  const [creditor, setCreditor] = useState("");
  const [originalAmount, setOriginalAmount] = useState("");
  const [outstandingBalance, setOutstandingBalance] = useState("");
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [installmentCount, setInstallmentCount] = useState("");
  const installmentFrequency = "monthly";
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");

  const { toast } = useToast();

  function applyPreset(preset: typeof PRESET_CREDITORS[0]) {
    setName(preset.name);
    setType(preset.type);
    setCreditor(preset.creditor);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("type", type);
    formData.set("creditor", creditor);
    formData.set("originalAmount", originalAmount);
    formData.set("outstandingBalance", outstandingBalance || originalAmount);
    formData.set("startDate", startDate);
    if (dueDate) formData.set("dueDate", dueDate);
    if (installmentAmount) formData.set("installmentAmount", installmentAmount);
    formData.set("installmentFrequency", installmentFrequency);
    if (installmentCount) formData.set("installmentCount", installmentCount);
    if (note) formData.set("note", note);

    const result = await createLiabilityAction(formData);

    if (result.success) {
      toast.success("Liabilitas & utang berhasil dicatat!");
      setIsLoading(false);
      setIsOpen(false);
      // Reset form
      setName("");
      setCreditor("");
      setOriginalAmount("");
      setOutstandingBalance("");
      setInstallmentAmount("");
      setInstallmentCount("");
      setDueDate("");
      setNote("");
      if (onLiabilityCreated) onLiabilityCreated();
    } else {
      const errMsg = result.error || "Gagal mencatat liabilitas";
      setError(errMsg);
      toast.error(errMsg);
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto gap-2 bg-[#007AFF] hover:bg-[#0066D6] active:scale-[0.98] text-white font-semibold text-xs h-10 sm:h-9.5 px-3.5 rounded-xl shadow-xs shadow-[#007AFF]/25 transition-all justify-center whitespace-nowrap shrink-0"
      >
        <Plus className="h-4 w-4 stroke-[2.5]" />
        <span>Catat Liabilitas</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[#E4E8EF] bg-white p-6 sm:p-7 shadow-xl animate-in fade-in zoom-in-95 duration-150 my-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Catat Kewajiban / Liabilitas</h3>
                  <p className="text-xs text-[#64748B]">PayLater, kartu kredit, cicilan pembelian, atau pinjaman</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-slate-100 hover:text-[#1E293B] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                Pilihan Cepat (Indonesia)
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_CREDITORS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
                  >
                    +{p.name}
                  </button>
                ))}
              </div>
            </div>

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
                    Kategori Kewajiban
                  </label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih jenis utang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paylater">PayLater (SPayLater, GoPay, dll.)</SelectItem>
                      <SelectItem value="credit_card">Kartu Kredit (Credit Card)</SelectItem>
                      <SelectItem value="installment">Cicilan Pembelian Barang</SelectItem>
                      <SelectItem value="bank_loan">Pinjaman Bank / KTA / KPR</SelectItem>
                      <SelectItem value="personal_loan">Pinjaman Finansial Lainnya</SelectItem>
                      <SelectItem value="informal">Pinjaman Pribadi / Rekan</SelectItem>
                      <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Pemberi Pinjaman / Kreditor
                  </label>
                  <Input
                    name="creditor"
                    value={creditor}
                    onChange={(e) => setCreditor(e.target.value)}
                    required
                    placeholder="Contoh: Shopee, Bank BCA, Kredivo"
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Nama Liabilitas / Keterangan Tagihan
                </label>
                <Input
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Contoh: SPayLater Laptop Asus, Tagihan BCA Visa"
                  className="h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Total Pokok Pinjaman (Rp)
                  </label>
                  <FormattedNumberInput
                    name="originalAmount"
                    value={originalAmount}
                    onValueChange={(val) => {
                      setOriginalAmount(val);
                      if (!outstandingBalance) {
                        setOutstandingBalance(val);
                      }
                    }}
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
                    name="outstandingBalance"
                    value={outstandingBalance}
                    onValueChange={setOutstandingBalance}
                    placeholder="Sama dengan total jika baru"
                    className="h-10 text-sm font-mono"
                  />
                  <span className="text-xs text-[#94A3B8] block">
                    Kosongkan jika utang baru dimulai
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Cicilan per Bulan (Rp) (Opsional)
                  </label>
                  <FormattedNumberInput
                    name="installmentAmount"
                    value={installmentAmount}
                    onValueChange={setInstallmentAmount}
                    placeholder="Contoh: 1.250.000"
                    className="h-10 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Tenor (Jumlah Bulan)
                  </label>
                  <Input
                    type="number"
                    name="installmentCount"
                    value={installmentCount}
                    onChange={(e) => setInstallmentCount(e.target.value)}
                    placeholder="Contoh: 6, 12, 24"
                    className="h-10 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Tanggal Mulai Pinjaman
                  </label>
                  <Input
                    type="date"
                    name="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Jatuh Tempo Berikutnya
                  </label>
                  <Input
                    type="date"
                    name="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Catatan Tambahan (Opsional)
                </label>
                <Input
                  name="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Bunga 0% tenor 6 bulan, autodebet dari BCA"
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
                      Simpan Liabilitas
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
