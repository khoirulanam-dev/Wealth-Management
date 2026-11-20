"use client";

import { useState } from "react";
import { Plus, LineChart, AlertCircle, Loader2, X } from "lucide-react";
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
import { createInstrumentAction } from "@/app/actions/portfolio-actions";

export function InstrumentDialog({ onInstrumentCreated }: { onInstrumentCreated?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assetType, setAssetType] = useState("stock");
  const [unit, setUnit] = useState("share");
  const [currency, setCurrency] = useState("IDR");
  const { toast } = useToast();

  const handleAssetTypeChange = (val: string) => {
    setAssetType(val);
    if (val === "stock") setUnit("share");
    else if (val === "gold") setUnit("gram");
    else if (val === "mutual_fund") setUnit("unit");
    else setUnit("nominal");
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("assetType", assetType);
    formData.set("unit", unit);
    formData.set("currency", currency);

    const result = await createInstrumentAction(formData);

    if (result.success) {
      toast.success("Instrumen investasi berhasil ditambahkan!");
      setIsLoading(false);
      setIsOpen(false);
      if (onInstrumentCreated) onInstrumentCreated();
    } else {
      const errMsg = result.error || "Gagal membuat instrumen";
      setError(errMsg);
      toast.error(errMsg);
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
        <LineChart className="h-4 w-4 text-indigo-600" />
        Tambah Instrumen / Saham
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-[#E4E8EF] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <LineChart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Tambah Instrumen Investasi</h3>
                  <p className="text-xs text-[#64748B]">Saham IDX/US, Reksadana, Emas Fisik, Obligasi</p>
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
                  Kelas Aset
                </label>
                <Select value={assetType} onValueChange={handleAssetTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kelas aset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Saham (Stocks)</SelectItem>
                    <SelectItem value="mutual_fund">Reksa Dana (Mutual Fund)</SelectItem>
                    <SelectItem value="gold">Emas Batangan / Fisik (Gold)</SelectItem>
                    <SelectItem value="bond">Obligasi / SBN</SelectItem>
                    <SelectItem value="deposit">Deposito Berjangka</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Ticker / Kode
                  </label>
                  <Input
                    name="symbol"
                    placeholder={
                      assetType === "stock"
                        ? "BBCA, BBRI, TLKM"
                        : assetType === "gold"
                        ? "ANTAM"
                        : "KODE"
                    }
                    className="h-10 text-sm font-mono uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Bursa / Pasar
                  </label>
                  <Input
                    name="market"
                    defaultValue={assetType === "stock" ? "IDX" : "LOKAL"}
                    className="h-10 text-sm uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Nama Lengkap Instrumen
                </label>
                <Input
                  name="name"
                  required
                  placeholder={
                    assetType === "stock"
                      ? "Bank Central Asia Tbk"
                      : assetType === "mutual_fund"
                      ? "Sucorinvest Equity Fund"
                      : assetType === "gold"
                      ? "Emas Batangan Logam Mulia"
                      : "Nama aset investasi"
                  }
                  className="h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Satuan Unit
                  </label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="share">Lembar Saham (Shares)</SelectItem>
                      <SelectItem value="unit">Unit Penyertaan</SelectItem>
                      <SelectItem value="gram">Gram (Emas)</SelectItem>
                      <SelectItem value="nominal">Nominal Rupiah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Mata Uang
                  </label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih mata uang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Simpan Instrumen
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
