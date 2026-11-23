"use client";

import { useState } from "react";
import { LineChart, Pencil, Trash2, Loader2, X, AlertCircle } from "lucide-react";
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
import { updateInstrumentAction, deleteInstrumentAction } from "@/app/actions/portfolio-actions";
import { InstrumentDialog } from "./instrument-dialog";
import { AssetLogo } from "@/presentation/components/ui/asset-logo";

export interface InstrumentItem {
  id: string;
  name: string;
  symbol: string | null;
  assetType: string;
  market: string | null;
  currency: string;
  unit: string;
  createdAt: Date;
}

interface InstrumentsTableProps {
  instruments: InstrumentItem[];
}

export function InstrumentsTable({ instruments }: InstrumentsTableProps) {
  const [editingInstrument, setEditingInstrument] = useState<InstrumentItem | null>(null);
  const [editAssetType, setEditAssetType] = useState<string>("stock");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const openEditModal = (inst: InstrumentItem) => {
    setEditingInstrument(inst);
    setEditAssetType(inst.assetType);
    setError(null);
  };

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingInstrument) return;
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("assetType", editAssetType);

    const result = await updateInstrumentAction(editingInstrument.id, formData);

    if (result.success) {
      toast.success("Instrumen berhasil diperbarui!");
      setIsSubmitting(false);
      setEditingInstrument(null);
    } else {
      const errMsg = result.error || "Gagal memperbarui instrumen";
      setError(errMsg);
      toast.error(errMsg);
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await deleteInstrumentAction(id);
    if (result.success) {
      toast.success("Instrumen berhasil dihapus!");
    } else {
      toast.error(result.error || "Gagal menghapus instrumen");
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  }

  if (instruments.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E4E8EF] bg-white p-12 text-center shadow-card">
        <LineChart className="h-8 w-8 text-[#94A3B8] mx-auto mb-3" strokeWidth={1.5} />
        <h3 className="text-base font-bold text-[#1E293B]">Katalog Instrumen Masih Kosong</h3>
        <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1 mb-6 leading-relaxed">
          Tambahkan saham IDX (BBCA, BBRI), reksa dana, atau emas batangan yang Anda miliki atau pantau.
        </p>
        <div className="flex justify-center">
          <InstrumentDialog />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-[#E4E8EF] bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E4E8EF] bg-[#F8FAFC] text-[#64748B] font-semibold uppercase tracking-wider text-xs">
                <th className="py-3.5 px-4">Ticker / Simbol</th>
                <th className="py-3.5 px-4">Nama Instrumen</th>
                <th className="py-3.5 px-4">Kelas Aset</th>
                <th className="py-3.5 px-4 text-center">Bursa / Pasar</th>
                <th className="py-3.5 px-4 text-center">Satuan</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E8EF] text-[#1E293B]">
              {instruments.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <AssetLogo
                        symbol={inst.symbol}
                        name={inst.name}
                        assetType={inst.assetType}
                        market={inst.market}
                        size="md"
                      />
                      <div>
                        <span className="font-bold text-[#1E293B] font-mono text-sm block">
                          {inst.symbol || "-"}
                        </span>
                        <span className="text-xs text-[#94A3B8] font-mono">{inst.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#1E293B]">{inst.name}</td>
                  <td className="py-3.5 px-4 text-[#64748B]">
                    {inst.assetType === "stock"
                      ? "Saham (Equity)"
                      : inst.assetType === "mutual_fund"
                      ? "Reksa Dana"
                      : inst.assetType === "gold"
                      ? "Emas Fisik"
                      : inst.assetType === "bond"
                      ? "Obligasi"
                      : inst.assetType}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-[#64748B]">
                    {inst.market || "IDX"}
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium text-[#64748B]">
                    {inst.unit}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {confirmDeleteId === inst.id ? (
                        <div className="flex items-center gap-1 animate-in fade-in duration-100">
                          <button
                            disabled={deletingId === inst.id}
                            onClick={() => handleDelete(inst.id)}
                            className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white hover:bg-red-700"
                          >
                            {deletingId === inst.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Hapus"
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded bg-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-300"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => openEditModal(inst)}
                            title="Edit Instrumen"
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(inst.id)}
                            title="Hapus Instrumen"
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Instrument Modal */}
      {editingInstrument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl sm:max-w-2xl rounded-2xl border border-[#E4E8EF] bg-white p-6 sm:p-7 shadow-xl animate-in fade-in zoom-in-95 duration-150 my-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-bold text-[#1E293B]">Edit Instrumen</h3>
              </div>
              <button
                onClick={() => setEditingInstrument(null)}
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

            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Nama Instrumen
                </label>
                <Input
                  name="name"
                  defaultValue={editingInstrument.name}
                  required
                  className="h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Ticker / Kode
                  </label>
                  <Input
                    name="symbol"
                    defaultValue={editingInstrument.symbol || ""}
                    className="h-10 text-sm font-mono uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Bursa / Pasar
                  </label>
                  <Input
                    name="market"
                    defaultValue={editingInstrument.market || "IDX"}
                    className="h-10 text-sm uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Kelas Aset
                  </label>
                  <Select value={editAssetType} onValueChange={setEditAssetType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih kelas aset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock">Saham (Stocks)</SelectItem>
                      <SelectItem value="mutual_fund">Reksa Dana</SelectItem>
                      <SelectItem value="gold">Emas Fisik</SelectItem>
                      <SelectItem value="bond">Obligasi</SelectItem>
                      <SelectItem value="deposit">Deposito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Satuan
                  </label>
                  <Input
                    name="unit"
                    defaultValue={editingInstrument.unit}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E8EF]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingInstrument(null)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  {isSubmitting ? (
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

