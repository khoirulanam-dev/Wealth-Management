"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useToast } from "@/presentation/components/ui/toast";
import { exportDataAction } from "@/app/actions/import-export-actions";

interface ExportDialogProps {
  triggerButton?: React.ReactNode;
}

export function ExportDialog({ triggerButton }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<
    "all" | "transactions" | "holdings" | "cash" | "liabilities" | "income"
  >("all");
  const [format, setFormat] = useState<"csv" | "xlsx">("xlsx");
  const [isExporting, setIsExporting] = useState(false);

  const { toast } = useToast();

  async function handleExport() {
    setIsExporting(true);
    const res = await exportDataAction(selectedModule, format);

    if (res.success && res.dataBase64) {
      // Decode base64 to Blob and trigger download
      const byteCharacters = atob(res.dataBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: res.mimeType });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = res.filename || `export_${selectedModule}.${format}`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`File ${res.filename} berhasil diunduh`);
      setIsOpen(false);
    } else {
      toast.error(res.error || "Gagal mengekspor data");
    }
    setIsExporting(false);
  }

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)}>{triggerButton}</div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto h-10 sm:h-9.5 gap-1.5 sm:gap-2 px-3 border border-black/[0.08] bg-white text-xs font-semibold sm:font-medium text-[#1C1C1E] hover:bg-black/[0.03] active:scale-[0.98] rounded-xl shadow-2xs transition-all justify-center whitespace-nowrap shrink-0"
        >
          <Download className="h-3.5 w-3.5 text-[#8E8E93] shrink-0" />
          <span className="truncate">Ekspor Data</span>
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-xl rounded-2xl bg-white border border-[#E4E8EF] p-6 sm:p-7 shadow-2xl z-10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Ekspor Data Finansial</h3>
                  <p className="text-xs text-[#64748B]">
                    Unduh cadangan data portofolio ke format CSV atau Excel (.xlsx)
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

            {/* Select Dataset Module */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1E293B] uppercase tracking-wider block">
                Pilih Modul Data
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "all", label: "Semua Data (Full Backup)", desc: "Transaksi, holdings, kas, utang & dividen" },
                  { id: "transactions", label: "Riwayat Transaksi", desc: "Semua log beli & jual aset" },
                  { id: "holdings", label: "Posisi Kepemilikan", desc: "Aset aktif & weighted-average cost" },
                  { id: "cash", label: "Kas & Simpanan", desc: "Rekening bank & dana darurat" },
                  { id: "liabilities", label: "Utang & Liabilitas", desc: "Kewajiban & sisa pokok pinjaman" },
                  { id: "income", label: "Dividen & Income", desc: "Realisasi pasif & jadwal dividen" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedModule(item.id as typeof selectedModule)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedModule === item.id
                        ? "border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-1 ring-blue-600"
                        : "border-[#E4E8EF] bg-[#F8FAFC] text-[#64748B] hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-xs font-bold block text-[#1E293B]">{item.label}</span>
                    <span className="text-[11px] text-[#94A3B8] block mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Select File Format */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1E293B] uppercase tracking-wider block">
                Format File
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat("xlsx")}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    format === "xlsx"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-1 ring-emerald-600"
                      : "border-[#E4E8EF] bg-white text-[#64748B] hover:bg-slate-50"
                  }`}
                >
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div className="text-left">
                    <span className="text-xs font-bold block text-[#1E293B]">Microsoft Excel (.xlsx)</span>
                    <span className="text-[10px] text-[#94A3B8]">Mendukung multi-sheet terstruktur</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat("csv")}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    format === "csv"
                      ? "border-blue-600 bg-blue-50 text-blue-900 shadow-xs ring-1 ring-blue-600"
                      : "border-[#E4E8EF] bg-white text-[#64748B] hover:bg-slate-50"
                  }`}
                >
                  <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                  <div className="text-left">
                    <span className="text-xs font-bold block text-[#1E293B]">Format CSV (.csv)</span>
                    <span className="text-[10px] text-[#94A3B8]">Standar universal teks koma</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Formula Injection Security Notice */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-[#E4E8EF] text-xs text-[#64748B]">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Proteksi Formula Injection (CWE-1236) aktif: sel karakter berbahaya dinetralisir secara otomatis.
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEF1F5]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-10 px-4 text-xs font-semibold"
              >
                Batal
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleExport}
                disabled={isExporting}
                className="h-10 px-5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    <span>Mengekspor Data...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-1.5" />
                    <span>Unduh {format.toUpperCase()}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

