"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, CheckCircle2 } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global system error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="relative w-full max-w-lg rounded-3xl border border-[#E4E8EF] bg-white p-8 sm:p-12 text-center shadow-xl space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-sm mx-auto">
            <AlertTriangle className="h-8 w-8 stroke-[1.75]" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-rose-600 uppercase tracking-widest block">
              CRITICAL ROOT ERROR · 500
            </span>
            <h1 className="text-2xl font-extrabold text-[#1E293B]">Kegagalan Root Aplikasi</h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-sm mx-auto leading-relaxed">
              Terjadi gangguan kritis saat merender shell utama aplikasi. Silakan muat ulang sistem.
            </p>
          </div>

          <button
            type="button"
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Muat Ulang Sistem</span>
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#94A3B8] pt-2 border-t border-[#EEF1F5]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>WEALTH OS · Fault-Tolerant Engine</span>
          </div>
        </div>
      </body>
    </html>
  );
}
