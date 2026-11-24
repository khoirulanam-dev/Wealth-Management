"use client";

import { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useToast } from "@/presentation/components/ui/toast";
import {
  getTemplateAction,
  validateImportFileAction,
  executeImportAction,
} from "@/app/actions/import-export-actions";
import { ImportType, ValidationResult } from "@/application/use-cases/import-export/import-export-service";

interface ImportDialogProps {
  triggerButton?: React.ReactNode;
  defaultType?: ImportType;
  onImportSuccess?: () => void;
}

export function ImportDialog({
  triggerButton,
  defaultType = "transactions",
  onImportSuccess,
}: ImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [importType, setImportType] = useState<ImportType>(defaultType);
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function handleDownloadTemplate() {
    const res = await getTemplateAction(importType);
    if (res.success && "content" in res && res.content) {
      const blob = new Blob([res.content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = res.filename;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      toast.error(res.error || "Gagal mengunduh template");
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setValidation(null);

    setIsValidating(true);
    const formData = new FormData();
    formData.append("file", selected);
    formData.append("type", importType);

    const res = await validateImportFileAction(formData);
    if (res.success && "validRows" in res) {
      const valResult = res as unknown as ValidationResult;
      setValidation(valResult);
      if (res.validRows.length === 0 && res.invalidRows.length > 0) {
        toast.error("File tidak memiliki baris data valid");
      } else {
        toast.success(`Ditemukan ${res.validRows.length} baris valid siap diimpor`);
      }
    } else {
      toast.error(res.error || "Gagal memvalidasi file");
    }
    setIsValidating(false);
  }

  async function handleExecuteImport() {
    if (!validation || validation.validRows.length === 0) return;
    setIsImporting(true);

    const res = await executeImportAction(
      importType,
      JSON.stringify(validation.validRows)
    );

    if (res.success && "importedCount" in res) {
      toast.success(`Berhasil mengimpor ${res.importedCount} data baru!`);
      setIsOpen(false);
      setFile(null);
      setValidation(null);
      if (onImportSuccess) onImportSuccess();
    } else {
      toast.error(res.error || "Gagal menyimpan data import");
    }
    setIsImporting(false);
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
          <Upload className="h-3.5 w-3.5 text-[#007AFF] shrink-0" />
          <span className="truncate">Impor Data</span>
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-[#E4E8EF] p-6 sm:p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">
                    Impor Data Massal (CSV / Excel)
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Unggah catatan transaksi, kas, utang, atau dividen sekaligus
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

            {/* Step 1: Select Module Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1E293B] uppercase tracking-wider block">
                Pilih Kategori Data
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "transactions", label: "Transaksi" },
                  { id: "cash", label: "Rekening Kas" },
                  { id: "liabilities", label: "Utang / Liabilitas" },
                  { id: "income", label: "Dividen & Income" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setImportType(item.id as ImportType);
                      setFile(null);
                      setValidation(null);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                      importType === item.id
                        ? "border-blue-600 bg-blue-50 text-blue-600 shadow-xs"
                        : "border-[#E4E8EF] bg-[#F8FAFC] text-[#64748B] hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Download Prompt */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E4E8EF] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-xs text-[#64748B]">
                  Gunakan format kolom yang sesuai agar data tervalidasi dengan benar.
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E4E8EF] text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh Template CSV</span>
              </button>
            </div>

            {/* Step 2: File Upload Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#CBD5E1] hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#F8FAFC]/50 hover:bg-blue-50/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileSelected}
                className="hidden"
              />
              <Upload className="h-8 w-8 text-[#94A3B8] mx-auto mb-2" strokeWidth={1.5} />
              <div className="text-sm font-semibold text-[#1E293B]">
                {file ? file.name : "Pilih file CSV atau Excel (.xlsx)"}
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">
                {file
                  ? `${(file.size / 1024).toFixed(1)} KB · Klik untuk mengganti file`
                  : "Klik untuk memilih file dari komputer Anda"}
              </p>
            </div>

            {/* Step 3: Live Validation Result Preview */}
            {isValidating && (
              <div className="p-4 text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>Memvalidasi baris data...</span>
              </div>
            )}

            {validation && (
              <div className="space-y-3">
                {/* Summary Badges */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    {validation.validRows.length} Baris Valid
                  </span>

                  {validation.invalidRows.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 font-semibold border border-red-200">
                      <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                      {validation.invalidRows.length} Baris Bermasalah
                    </span>
                  )}
                </div>

                {/* Error Rows Table if any */}
                {validation.invalidRows.length > 0 && (
                  <div className="rounded-xl border border-red-200 bg-red-50/50 p-3 max-h-40 overflow-y-auto space-y-2 text-xs">
                    <span className="font-semibold text-red-800 block">
                      Catatan Perbaikan Baris:
                    </span>
                    {validation.invalidRows.map((errRow) => (
                      <div key={errRow.rowNumber} className="border-b border-red-100 pb-1.5 last:border-0">
                        <span className="font-mono font-bold text-red-700">
                          Baris {errRow.rowNumber}:
                        </span>{" "}
                        <span className="text-red-600">{errRow.errors.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                onClick={handleExecuteImport}
                disabled={!validation || validation.validRows.length === 0 || isImporting}
                className="h-10 px-5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Konfirmasi &amp; Simpan Data ({validation?.validRows.length || 0})</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
