"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle,
  Loader2,
  X,
  Calculator,
  Info,
} from "lucide-react";
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
  const { toast } = useToast();

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

  // Mutual Fund specific helper: input by total Rupiah vs Unit Penyertaan
  const [mfInputMode, setMfInputMode] = useState<"unit" | "nominal">("unit");
  const [mfNominal, setMfNominal] = useState("");

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
  const currentAssetType = isNewInstrument ? newAssetType : (activeInstrument?.assetType || "stock");
  const isStock = currentAssetType === "stock";
  const isMutualFund = currentAssetType === "mutual_fund";
  const isGold = currentAssetType === "gold";
  const isBond = currentAssetType === "bond";

  // Effective share quantity for calculations
  const effectiveQuantity = isStock && isLotMode && quantity
    ? (parseFloat(quantity) * 100).toString()
    : quantity;

  // Handle Mutual Fund nominal calculation: Unit = Nominal / NAB
  const handleMfNominalChange = (nomStr: string) => {
    setMfNominal(nomStr);
    const nom = parseFloat(nomStr);
    const nab = parseFloat(unitPrice);
    if (!isNaN(nom) && !isNaN(nab) && nab > 0) {
      setQuantity((nom / nab).toFixed(4));
    } else if (!nomStr) {
      setQuantity("");
    }
  };

  const handleUnitPriceChange = (priceStr: string) => {
    setUnitPrice(priceStr);
    if (isMutualFund && mfInputMode === "nominal" && mfNominal) {
      const nom = parseFloat(mfNominal);
      const nab = parseFloat(priceStr);
      if (!isNaN(nom) && !isNaN(nab) && nab > 0) {
        setQuantity((nom / nab).toFixed(4));
      }
    }
  };

  // Quick Chips categorized by asset type
  const quickChipsByAsset: Record<string, { sym: string; name: string; price?: number }[]> = {
    stock: [
      { sym: "BBCA", name: "Bank Central Asia Tbk" },
      { sym: "BBRI", name: "Bank Rakyat Indonesia (Persero) Tbk" },
      { sym: "BMRI", name: "Bank Mandiri (Persero) Tbk" },
      { sym: "TLKM", name: "Telkom Indonesia (Persero) Tbk" },
      { sym: "ASII", name: "Astra International Tbk" },
      { sym: "GOTO", name: "GoTo Gojek Tokopedia Tbk" },
      { sym: "ICBP", name: "Indofood CBP Sukses Makmur Tbk" },
    ],
    mutual_fund: [
      { sym: "SMMF", name: "Sucorinvest Money Market Fund", price: 2154.68 },
      { sym: "BDKM", name: "Batavia Dana Kas Maxima", price: 1724.32 },
      { sym: "MIPU", name: "Mandiri Investa Pasar Uang", price: 1682.45 },
      { sym: "SDPP", name: "Schroder Dana Prestasi Plus", price: 3548.20 },
      { sym: "BNI30", name: "BNI-AM Indeks IDX30", price: 1124.50 },
      { sym: "SSF", name: "Sucorinvest Stable Fund", price: 1324.75 },
      { sym: "MOU", name: "Manulife Obligasi Unggulan Kelas A", price: 2894.10 },
    ],
    gold: [
      { sym: "ANTAM", name: "Emas Batangan Antam Logam Mulia", price: 1450000 },
      { sym: "UBS", name: "Emas Batangan UBS Gold", price: 1435000 },
      { sym: "PEGADAIAN", name: "Tabungan Emas Pegadaian", price: 1440000 },
      { sym: "GALERI24", name: "Emas Batangan Galeri 24", price: 1445000 },
    ],
    bond: [
      { sym: "ORI026", name: "Obligasi Negara Ritel Seri ORI026", price: 1000000 },
      { sym: "SR021", name: "Sukuk Ritel Seri SR021", price: 1000000 },
      { sym: "SBR013", name: "Savings Bond Ritel Seri SBR013", price: 1000000 },
      { sym: "FR0091", name: "Surat Utang Negara Seri FR0091", price: 1000000 },
      { sym: "PBS032", name: "Project Based Sukuk Seri PBS032", price: 1000000 },
    ],
    crypto: [
      { sym: "BTC", name: "Bitcoin" },
      { sym: "ETH", name: "Ethereum" },
      { sym: "SOL", name: "Solana" },
      { sym: "USDT", name: "Tether USD" },
    ],
  };

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
      // Pass proper default unit
      let unit = "share";
      if (newAssetType === "mutual_fund") unit = "unit";
      else if (newAssetType === "gold") unit = "gram";
      else if (newAssetType === "bond") unit = "nominal";
      else if (newAssetType === "crypto") unit = "coin";
      formData.append("unit", unit);
    } else {
      formData.append("instrumentId", selectedInstrument);
    }

    const result = await recordTransactionAction(formData);

    if (result.success) {
      toast.success("Transaksi investasi berhasil dicatat ke portfolio!");
      setIsSubmitting(false);
      setIsOpen(false);
      setQuantity("");
      setUnitPrice("");
      setNote("");
      setNewSymbol("");
      setNewName("");
      setMfNominal("");
      if (onSuccess) onSuccess();
    } else {
      const errMsg = result.error || "Gagal mencatat transaksi";
      setError(errMsg);
      toast.error(errMsg);
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer w-full sm:w-auto">
          {triggerButton}
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto gap-2 bg-[#007AFF] hover:bg-[#0066D6] active:scale-[0.98] text-white font-semibold shadow-xs shadow-[#007AFF]/25 h-10 sm:h-9.5 px-3.5 text-xs rounded-xl transition-all justify-center whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Catat Transaksi</span>
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl sm:max-w-3xl rounded-[24px] border border-black/[0.08] bg-white p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
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
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih akun sekuritas / bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} ({acc.institution})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      {isNewInstrument ? "← Pilih dari Daftar" : "+ Tambah Instrumen Baru"}
                    </button>
                  </div>

                  {!isNewInstrument && instruments.length > 0 ? (
                    <Select
                      value={selectedInstrument}
                      onValueChange={(val) => {
                        if (val === "NEW") {
                          setIsNewInstrument(true);
                        } else {
                          setSelectedInstrument(val);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full font-mono">
                        <SelectValue placeholder="Pilih instrumen" />
                      </SelectTrigger>
                      <SelectContent>
                        {instruments.map((inst) => (
                          <SelectItem key={inst.id} value={inst.id}>
                            {inst.symbol ? `${inst.symbol} - ` : ""}
                            {inst.name} ({inst.assetType === "mutual_fund" ? "Reksa Dana" : inst.assetType === "gold" ? "Emas" : inst.assetType === "bond" ? "Obligasi" : "Saham"})
                          </SelectItem>
                        ))}
                        <SelectItem value="NEW">+ Tambah Saham/Reksa Dana/Aset Lain...</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="space-y-2.5">
                      {/* Asset Class Selector First */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-xs font-semibold text-[#64748B] block mb-1">Kelas Aset</span>
                          <Select
                            value={newAssetType}
                            onValueChange={(val) => {
                              setNewAssetType(val);
                              // Reset quick chips and price if changing class
                              setNewSymbol("");
                              setNewName("");
                              setQuantity("");
                              setUnitPrice("");
                              setMfNominal("");
                            }}
                          >
                            <SelectTrigger className="h-9 text-xs bg-white font-medium">
                              <SelectValue placeholder="Pilih aset" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="stock">Saham (Stocks)</SelectItem>
                              <SelectItem value="mutual_fund">Reksa Dana (Mutual Fund)</SelectItem>
                              <SelectItem value="gold">Emas Fisik / Logam Mulia</SelectItem>
                              <SelectItem value="bond">Obligasi / SBN (Bonds)</SelectItem>
                              <SelectItem value="crypto">Aset Kripto (Crypto)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <span className="text-xs font-semibold text-[#64748B] block mb-1">
                            {isStock
                              ? "Ticker Saham"
                              : isMutualFund
                              ? "Kode / Singkatan"
                              : isGold
                              ? "Brand / Produsen"
                              : isBond
                              ? "Seri Obligasi / SBN"
                              : "Simbol Koin"}
                          </span>
                          <Input
                            placeholder={
                              isStock
                                ? "Contoh: BBCA, BBRI"
                                : isMutualFund
                                ? "Contoh: SMMF, BDKM"
                                : isGold
                                ? "Contoh: ANTAM, UBS"
                                : isBond
                                ? "Contoh: ORI026, SR021"
                                : "Contoh: BTC, ETH"
                            }
                            value={newSymbol}
                            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                            required={isNewInstrument}
                            className="h-9 text-xs font-mono uppercase bg-white"
                          />
                        </div>
                      </div>

                      {/* Name of Asset */}
                      <div>
                        <span className="text-xs font-semibold text-[#64748B] block mb-1">
                          {isStock
                            ? "Nama Perusahaan"
                            : isMutualFund
                            ? "Nama Produk Reksa Dana (Lengkap)"
                            : isGold
                            ? "Nama Aset Emas"
                            : isBond
                            ? "Nama Surat Utang / Seri SBN"
                            : "Nama Aset Kripto"}
                        </span>
                        <Input
                          placeholder={
                            isStock
                              ? "Contoh: Bank Central Asia Tbk"
                              : isMutualFund
                              ? "Contoh: Sucorinvest Money Market Fund"
                              : isGold
                              ? "Contoh: Emas Batangan Antam Logam Mulia"
                              : isBond
                              ? "Contoh: Obligasi Negara Ritel Seri ORI026"
                              : "Contoh: Bitcoin"
                          }
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="h-9 text-xs bg-white"
                        />
                      </div>

                      {/* Dynamic Quick Chips according to selected asset class */}
                      {quickChipsByAsset[newAssetType] && (
                        <div className="space-y-1 pt-1">
                          <span className="text-xs text-[#94A3B8] block">
                            Pilihan Cepat {isMutualFund ? "Reksa Dana Populer" : isGold ? "Emas" : isBond ? "SBN" : isStock ? "Saham LQ45" : "Kripto"}:
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {quickChipsByAsset[newAssetType].map((c) => (
                              <button
                                key={c.sym}
                                type="button"
                                onClick={() => {
                                  setNewSymbol(c.sym);
                                  setNewName(c.name);
                                  if (c.price) {
                                    setUnitPrice(c.price.toString());
                                    if (isMutualFund && mfInputMode === "nominal" && mfNominal) {
                                      const nom = parseFloat(mfNominal);
                                      if (!isNaN(nom) && c.price > 0) {
                                        setQuantity((nom / c.price).toFixed(4));
                                      }
                                    }
                                  }
                                }}
                                className="rounded border border-[#CBD5E1] bg-white px-2 py-0.5 text-xs font-medium text-[#475569] hover:border-blue-500 hover:text-blue-600 transition-colors"
                              >
                                +{c.sym}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Trade Date & Quantity Section */}
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
                        {isStock
                          ? `Kuantitas ${isLotMode ? "(Lot)" : "(Lembar)"}`
                          : isMutualFund
                          ? "Unit Penyertaan (UP)"
                          : isGold
                          ? "Berat (Gram)"
                          : isBond
                          ? "Kuantitas (Unit @ 1 Juta)"
                          : "Kuantitas (Koin)"}
                      </label>
                      {isStock && (
                        <button
                          type="button"
                          onClick={() => setIsLotMode(!isLotMode)}
                          className="text-xs font-semibold text-blue-600 hover:underline select-none"
                        >
                          Ubah ke {isLotMode ? "Lembar Saham" : "Lot (100 lbr)"}
                        </button>
                      )}
                      {isMutualFund && (
                        <button
                          type="button"
                          onClick={() => {
                            const newMode = mfInputMode === "unit" ? "nominal" : "unit";
                            setMfInputMode(newMode);
                          }}
                          className="text-xs font-semibold text-blue-600 hover:underline select-none"
                        >
                          {mfInputMode === "unit" ? "Beli via Nominal (Rp)" : "Input Unit Langsung"}
                        </button>
                      )}
                    </div>

                    {isMutualFund && mfInputMode === "nominal" ? (
                      <div className="space-y-1">
                        <Input
                          type="number"
                          step="any"
                          min="1000"
                          placeholder="Ketik Nominal Pembelian (misal: 1000000)"
                          value={mfNominal}
                          onChange={(e) => handleMfNominalChange(e.target.value)}
                          className="h-10 text-sm font-mono"
                        />
                        {quantity && (
                          <p className="text-xs text-emerald-600 font-mono">
                            Setara dengan: <strong>{quantity}</strong> Unit Penyertaan (UP)
                          </p>
                        )}
                      </div>
                    ) : (
                      <Input
                        type="number"
                        step="any"
                        min="0.000001"
                        placeholder={
                          isStock
                            ? isLotMode
                              ? "Contoh: 10 (lot)"
                              : "Contoh: 1000 (lembar)"
                            : isMutualFund
                            ? "Contoh: 1250.4567 UP"
                            : isGold
                            ? "Contoh: 10 (gram) atau 0.5"
                            : isBond
                            ? "Contoh: 5 unit (= Rp 5.000.000)"
                            : "Contoh: 0.05"
                        }
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        className="h-10 text-sm font-mono"
                      />
                    )}

                    {isStock && isLotMode && quantity && (
                      <p className="text-xs text-[#64748B]">
                        Setara dengan: <strong>{formatNumber(parseFloat(quantity) * 100)}</strong> lembar saham
                      </p>
                    )}
                  </div>
                </div>

                {/* Unit Price (Price / NAB / Gold Price / Par) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                      {isStock
                        ? "Harga per Lembar (Rp)"
                        : isMutualFund
                        ? "NAB per Unit - Nilai Aktiva Bersih (Rp)"
                        : isGold
                        ? "Harga Emas per Gram (Rp/gr)"
                        : isBond
                        ? "Harga Satuan per Unit (Rp)"
                        : "Harga per Koin (Rp)"}
                    </label>
                  </div>
                  <Input
                    type="number"
                    step="any"
                    min="0.01"
                    placeholder={
                      isStock
                        ? "Contoh: 9500"
                        : isMutualFund
                        ? "Contoh: 2154.68"
                        : isGold
                        ? "Contoh: 1450000"
                        : isBond
                        ? "Contoh: 1000000"
                        : "Contoh: 1450000000"
                    }
                    value={unitPrice}
                    onChange={(e) => handleUnitPriceChange(e.target.value)}
                    required
                    className="h-10 text-sm font-mono"
                  />
                  {isMutualFund && (
                    <p className="text-xs text-[#94A3B8]">
                      NAB (Nilai Aktiva Bersih) adalah harga per unit penyertaan reksa dana saat transaksi.
                    </p>
                  )}
                  {isGold && (
                    <p className="text-xs text-[#94A3B8]">
                      Harga jual/beli fisik per gram saat tanggal transaksi.
                    </p>
                  )}
                  {isBond && (
                    <p className="text-xs text-[#94A3B8]">
                      Standar nominal 1 unit SBN pemerintah adalah Rp 1.000.000 (100% Par).
                    </p>
                  )}
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

                    {preview.isValid ? (
                      <div className="space-y-1.5 font-mono">
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Total Nilai Transaksi:</span>
                          <span className="font-bold text-sm text-[#1E293B]">
                            {formatCurrency(preview.grossAmount || "0")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Saldo Unit Saat Ini:</span>
                          <span>
                            {preview.currentQuantity}{" "}
                            {isStock ? "lbr" : isMutualFund ? "UP" : isGold ? "gr" : "unit"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Proyeksi Saldo Setelah Transaksi:</span>
                          <span className="font-semibold text-blue-600">
                            {preview.projectedQuantity}{" "}
                            {isStock ? "lbr" : isMutualFund ? "UP" : isGold ? "gr" : "unit"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Biaya Rata-Rata Baru (Avg Cost):</span>
                          <span>{formatCurrency(preview.projectedAverageCost || "0")}</span>
                        </div>
                        {type === "sell" && (
                          <div className="flex justify-between pt-1 border-t border-dashed border-blue-200 font-bold">
                            <span>Estimasi Realized P/L:</span>
                            <span
                              className={
                                parseFloat(preview.projectedRealizedPL || "0") >= 0
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }
                            >
                              {formatCurrency(preview.projectedRealizedPL || "0")}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-red-600">{preview.error}</p>
                    )}
                  </div>
                )}

                {/* Notes (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Catatan (Opsional)
                  </label>
                  <Input
                    placeholder="Contoh: Alokasi gaji bulanan, DCA rutin, rebalancing"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-[#EEF1F5]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="h-9 text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || (preview !== null && !preview.isValid)}
                    className={`h-9 text-xs gap-1.5 font-semibold text-white ${
                      type === "buy"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Menyimpan...
                      </>
                    ) : type === "buy" ? (
                      "Posting Pembelian"
                    ) : (
                      "Posting Penjualan"
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
