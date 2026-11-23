"use client";

import { useState } from "react";
import { History, X, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/decimal";

interface ValuationHistoryRecord {
  id: string;
  price: string;
  currency: string;
  effectiveAt: Date;
  sourceType: string;
  sourceName: string;
  isManualOverride: boolean;
  note?: string | null;
}

interface ValuationHistoryDialogProps {
  instrumentId: string;
  instrumentName: string;
  symbol?: string | null;
  history?: ValuationHistoryRecord[];
  fetchHistoryAction?: () => Promise<ValuationHistoryRecord[]>;
  triggerButton?: React.ReactNode;
}

export function ValuationHistoryDialog({
  instrumentName,
  symbol,
  history: initialHistory,
  fetchHistoryAction,
  triggerButton,
}: ValuationHistoryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<ValuationHistoryRecord[]>(initialHistory || []);
  const [isLoading, setIsLoading] = useState(false);

  async function handleOpen() {
    setIsOpen(true);
    if (fetchHistoryAction && (!history || history.length === 0)) {
      setIsLoading(true);
      try {
        const data = await fetchHistoryAction();
        setHistory(data);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <>
      {triggerButton ? (
        <span onClick={handleOpen}>{triggerButton}</span>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="rounded p-1 text-[#94A3B8] hover:bg-slate-100 hover:text-[#1E293B] transition-colors"
          title="Lihat Riwayat Valuasi"
        >
          <History className="h-4 w-4" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl sm:max-w-2xl rounded-2xl border border-[#E4E8EF] bg-white p-6 sm:p-7 shadow-xl animate-in fade-in zoom-in-95 duration-150 my-6 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8EF]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Riwayat Valuasi & Kuotasi Harga</h3>
                  <p className="text-xs text-[#64748B]">
                    {instrumentName} {symbol ? `(${symbol})` : ""} &bull; Jejak Audit Finansial
                  </p>
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

            {/* Content List */}
            <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-3">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-2" />
                  <span className="text-xs text-[#64748B]">Memuat jejak audit valuasi...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#94A3B8]">
                  Belum ada catatan riwayat valuasi untuk instrumen ini.
                </div>
              ) : (
                <div className="divide-y divide-[#E4E8EF] rounded-xl border border-[#E4E8EF] bg-white overflow-hidden">
                  {history.map((record, idx) => (
                    <div
                      key={record.id || idx}
                      className="p-3.5 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1E293B] font-mono">
                            {formatCurrency(record.price, record.currency || "IDR")}
                          </span>
                          {record.isManualOverride ? (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                              <ShieldCheck className="h-3 w-3" />
                              Manual Override
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                              <CheckCircle2 className="h-3 w-3" />
                              {record.sourceName || "Pasar"}
                            </span>
                          )}
                        </div>
                        {record.note && (
                          <p className="text-xs text-[#64748B] italic">
                            Alasan: &quot;{record.note}&quot;
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[#64748B] block font-mono">
                          {formatDate(record.effectiveAt)}
                        </span>
                        <span className="text-xs text-[#94A3B8] block">
                          {record.sourceType === "manual" ? "Entri Pengguna" : "API Real-Time"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[#E4E8EF] flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#E4E8EF] text-xs font-semibold text-[#1E293B] hover:bg-[#F8FAFC]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
