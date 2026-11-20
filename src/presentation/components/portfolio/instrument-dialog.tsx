"use client";

import { useState } from "react";
import { Plus, LineChart, AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { createInstrumentAction } from "@/app/actions/portfolio-actions";

export function InstrumentDialog({ onInstrumentCreated }: { onInstrumentCreated?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assetType, setAssetType] = useState("stock");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createInstrumentAction(formData);

    if (result.success) {
      setIsLoading(false);
      setIsOpen(false);
      if (onInstrumentCreated) onInstrumentCreated();
    } else {
      setError(result.error || "Gagal membuat instrumen");
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
                <select
                  name="assetType"
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-[#E4E8EF] bg-white px-3 py-2 text-sm text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <option value="stock">Saham (Stocks)</option>
                  <option value="mutual_fund">Reksa Dana (Mutual Fund)</option>
                  <option value="gold">Emas Batangan / Fisik (Gold)</option>
                  <option value="bond">Obligasi / Surat Berharga Negara</option>
                  <option value="deposit">Deposito Berjangka</option>
                </select>
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
                  <select
                    name="unit"
                    defaultValue={
                      assetType === "stock"
                        ? "share"
                        : assetType === "gold"
                        ? "gram"
                        : assetType === "mutual_fund"
                        ? "unit"
                        : "nominal"
                    }
                    className="flex h-10 w-full rounded-lg border border-[#E4E8EF] bg-white px-3 py-2 text-sm text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <option value="share">Lembar Saham (Shares)</option>
                    <option value="unit">Unit Penyertaan</option>
                    <option value="gram">Gram (Emas)</option>
                    <option value="nominal">Nominal Rupiah</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Mata Uang
                  </label>
                  <select
                    name="currency"
                    defaultValue="IDR"
                    className="flex h-10 w-full rounded-lg border border-[#E4E8EF] bg-white px-3 py-2 text-sm text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <option value="IDR">IDR (Rupiah)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
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
