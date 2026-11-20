"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, ArrowDownRight, ArrowUpRight, AlertCircle, Loader2, X, Calculator, Info } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { recordTransactionAction, previewTransactionAction } from "@/app/actions/portfolio-actions";
import { formatCurrency, formatNumber } from "@/lib/decimal";

interface AccountOption {
  id: string;
  name: string;
  institution: string;
}

interface InstrumentOption {
  id: string;
  name: string;
  symbol: string | null;
  assetType: string;
  unit: string;
}

interface RecordTransactionDialogProps {
  accounts: AccountOption[];
  instruments: InstrumentOption[];
  defaultType?: "buy" | "sell";
  defaultInstrumentId?: string;
  defaultAccountId?: string;
  triggerButton?: React.ReactNode;
  onSuccess?: () => void;
}

export function RecordTransactionDialog({
  accounts,
  instruments,
  defaultType = "buy",
  defaultInstrumentId,
  defaultAccountId,
  triggerButton,
  onSuccess,
}: RecordTransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [selectedAccount, setSelectedAccount] = useState(defaultAccountId || accounts[0]?.id || "");
  const [isNewInstrument, setIsNewInstrument] = useState(instruments.length === 0);
  const [selectedInstrument, setSelectedInstrument] = useState(
    defaultInstrumentId || instruments[0]?.id || (instruments.length > 0 ? instruments[0].id : "NEW")
  );
  const [newSymbol, setNewSymbol] = useState("");
  const [newName, setNewName] = useState("");
  const [newAssetType, setNewAssetType] = useState("stock");

  const [type, setType] = useState<"buy" | "sell">(defaultType);
  const [tradeDate, setTradeDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [isLotMode, setIsLotMode] = useState(true); // For stocks: 1 lot = 100 shares
  const [note, setNote] = useState("");

  // Preview state
  const [, startTransition] = useTransition();
  const [preview, setPreview] = useState<{
    isValid: boolean;
    error?: string;
    grossAmount?: string;
    currentQuantity?: string;
    currentAverageCost?: string;
    projectedQuantity?: string;
    projectedAverageCost?: string;
    projectedTotalCostBasis?: string;
    projectedRealizedPL?: string;
  } | null>(null);

  const activeInstrument = instruments.find((i) => i.id === selectedInstrument);
  const isStock = isNewInstrument ? newAssetType === "stock" : activeInstrument?.assetType === "stock";

  // Effective share quantity for calculations
  const effectiveQuantity = isStock && isLotMode && quantity
    ? (parseFloat(quantity) * 100).toString()
    : quantity;

  // Real-time preview effect
  useEffect(() => {
    const instId = isNewInstrument ? "NEW" : selectedInstrument;
    if (!selectedAccount || !instId || !effectiveQuantity || !unitPrice) {
      setPreview(null);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const result = await previewTransactionAction(
          instId,
          selectedAccount,
          type,
          effectiveQuantity,
          unitPrice
        );
        setPreview(result);
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedAccount, selectedInstrument, isNewInstrument, type, effectiveQuantity, unitPrice]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("accountId", selectedAccount);
    formData.append("type", type);
    formData.append("tradeDate", tradeDate);
    formData.append("quantity", effectiveQuantity);
    formData.append("unitPrice", unitPrice);
    formData.append("note", note);

    if (isNewInstrument) {
      formData.append("instrumentId", "NEW");
      formData.append("newSymbol", newSymbol);
      formData.append("newName", newName || newSymbol);
      formData.append("newAssetType", newAssetType);
    } else {
      formData.append("instrumentId", selectedInstrument);
    }

    const result = await recordTransactionAction(formData);

    if (result.success) {
      setIsSubmitting(false);
      setIsOpen(false);
      setQuantity("");
      setUnitPrice("");
      setNote("");
      setNewSymbol("");
      setNewName("");
      if (onSuccess) onSuccess();
    } else {
      setError(result.error || "Gagal mencatat transaksi");
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
          {triggerButton}
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm h-9 text-xs"
        >
          <Plus className="h-4 w-4" />
          Catat Transaksi
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#E4E8EF] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    type === "buy" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  }`}
                >
                  {type === "buy" ? (
                    <ArrowDownRight className="h-5 w-5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Catat Transaksi Investasi</h3>
                  <p className="text-xs text-[#64748B]">Beli atau jual instrumen dengan kalkulasi presisi</p>
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

            {accounts.length === 0 ? (
              <div className="mt-6 text-center py-6 border border-dashed border-[#CBD5E1] rounded-xl bg-slate-50 p-4">
                <Info className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-[#1E293B]">Akun Sekuritas/Bank Belum Ada</h4>
                <p className="text-xs text-[#64748B] max-w-xs mx-auto mt-1">
                  Harap tambahkan minimal 1 Akun Sekuritas atau Bank terlebih dahulu sebelum mencatat transaksi.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                    Tutup
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {/* Buy / Sell Tab Switcher */}
                <div className="grid grid-cols-2 p-1 bg-[#F1F5F9] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setType("buy")}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                      type === "buy"
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-[#64748B] hover:text-[#1E293B]"
                    }`}
                  >
                    <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                    Beli / Langganan (Buy)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("sell")}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                      type === "sell"
                        ? "bg-white text-red-700 shadow-sm"
                        : "text-[#64748B] hover:text-[#1E293B]"
                    }`}
                  >
                    <ArrowUpRight className="h-4 w-4 text-red-600" />
                    Jual / Tebus (Sell)
                  </button>
                </div>

                {/* Account Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Pilih Akun / Sekuritas
                  </label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-lg border border-[#E4E8EF] bg-white px-3 py-2 text-sm text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.institution})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Instrument Section: Select from list or Quick Type */}
                <div className="space-y-2 p-3 bg-[#F8FAFC] rounded-xl border border-[#E4E8EF]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                      Instrumen Investasi
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsNewInstrument(!isNewInstrument)}
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      {isNewInstrument ? "← Pilih dari Daftar" : "+ Ketik Saham/Aset Baru"}
                    </button>
                  </div>

                  {!isNewInstrument && instruments.length > 0 ? (
                    <select
                      value={selectedInstrument}
                      onChange={(e) => {
                        if (e.target.value === "NEW") {
                          setIsNewInstrument(true);
                        } else {
                          setSelectedInstrument(e.target.value);
                        }
                      }}
                      required
                      className="flex h-10 w-full rounded-lg border border-[#E4E8EF] bg-white px-3 py-2 text-sm text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 font-mono"
                    >
                      {instruments.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.symbol ? `${inst.symbol} - ` : ""}
                          {inst.name}
                        </option>
                      ))}
                      <option value="NEW">+ Tambah Saham/Aset Lain...</option>
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[11px] text-[#64748B] block mb-1">Ticker / Kode</span>
                          <Input
                            placeholder="Contoh: BBCA, BBRI, ANTAM"
                            value={newSymbol}
                            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                            required={isNewInstrument}
                            className="h-9 text-xs font-mono uppercase bg-white"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] text-[#64748B] block mb-1">Kelas Aset</span>
                          <select
                            value={newAssetType}
                            onChange={(e) => setNewAssetType(e.target.value)}
                            className="flex h-9 w-full rounded-lg border border-[#E4E8EF] bg-white px-2 py-1 text-xs text-[#1E293B]"
                          >
                            <option value="stock">Saham (Stocks)</option>
                            <option value="mutual_fund">Reksa Dana</option>
                            <option value="gold">Emas Batangan</option>
                            <option value="bond">Obligasi</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#64748B] block mb-1">Nama Perusahaan / Aset</span>
                        <Input
                          placeholder="Contoh: Bank Central Asia Tbk"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="h-9 text-xs bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Trade Date & Lot Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                      Tanggal Transaksi
                    </label>
                    <Input
                      type="date"
                      value={tradeDate}
                      onChange={(e) => setTradeDate(e.target.value)}
                      required
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                        Kuantitas {isStock ? (isLotMode ? "(Lot)" : "(Lembar)") : `(${activeInstrument?.unit || "Unit"})`}
                      </label>
                      {isStock && (
                        <button
                          type="button"
                          onClick={() => setIsLotMode(!isLotMode)}
                          className="text-[11px] font-semibold text-blue-600 hover:underline select-none"
                        >
                          Ubah ke {isLotMode ? "Lembar Saham" : "Lot (100 lbr)"}
                        </button>
                      )}
                    </div>
                    <Input
                      type="number"
                      step="any"
                      min="0.000001"
                      placeholder={isStock ? (isLotMode ? "10 (lot)" : "1000 (lembar)") : "10"}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                      className="h-10 text-sm font-mono"
                    />
                    {isStock && isLotMode && quantity && (
                      <p className="text-[11px] text-[#64748B]">
                        Setara dengan: <strong>{formatNumber(parseFloat(quantity) * 100)}</strong> lembar saham
                      </p>
                    )}
                  </div>
                </div>

                {/* Unit Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Harga Satuan (Rp)
                  </label>
                  <Input
                    type="number"
                    step="any"
                    min="0.01"
                    placeholder="Contoh: 9500"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    required
                    className="h-10 text-sm font-mono"
                  />
                </div>

                {/* Real-time Calculation Preview Card */}
                {preview && (
                  <div
                    className={`rounded-xl border p-4 text-xs transition-all ${
                      preview.isValid
                        ? "border-blue-200 bg-blue-50/50 text-[#1E293B]"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-2">
                      <Calculator className="h-4 w-4 text-blue-600" />
                      <span>Preview Kalkulasi Transaksi</span>
                    </div>

                    {!preview.isValid ? (
                      <p className="text-red-600 font-medium">{preview.error}</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Nilai Transaksi</span>
                          <span className="font-bold font-mono text-sm text-[#1E293B]">
                            {formatCurrency(preview.grossAmount || "0")}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Kuantitas Akhir</span>
                          <span className="font-bold font-mono text-sm text-[#1E293B]">
                            {formatNumber(preview.projectedQuantity || "0")}{" "}
                            {isStock ? "lembar" : activeInstrument?.unit || "unit"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Rata-rata Biaya Baru</span>
                          <span className="font-bold font-mono text-sm text-blue-600">
                            {formatCurrency(preview.projectedAverageCost || "0")}
                          </span>
                        </div>
                        {type === "sell" && (
                          <div className="col-span-2 sm:col-span-3 border-t border-blue-200/60 pt-2 flex items-center justify-between">
                            <span className="text-[#64748B]">Proyeksi Realized P/L:</span>
                            <span
                              className={`font-bold font-mono text-sm ${
                                parseFloat(preview.projectedRealizedPL || "0") >= 0
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              {parseFloat(preview.projectedRealizedPL || "0") >= 0 ? "+" : ""}
                              {formatCurrency(preview.projectedRealizedPL || "0")}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Catatan (Opsional)
                  </label>
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Contoh: Alokasi dividen kuartal 1, DCA bulanan"
                    className="h-10 text-sm"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E8EF]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || (preview !== null && !preview.isValid)}
                    className={`font-semibold text-white ${
                      type === "buy" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        {type === "buy" ? "Posting Pembelian" : "Posting Penjualan"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
