"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

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
      <body className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md rounded-2xl border border-[#E4E8EF] bg-white p-8 text-center shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 mx-auto mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <span className="font-mono text-xs font-bold text-red-600 uppercase tracking-widest block mb-1">
            CRITICAL SYSTEM ERROR · 500
          </span>
          <h1 className="text-xl font-bold text-[#1E293B]">Kegagalan Root Aplikasi</h1>
          <p className="text-xs text-[#64748B] mt-2 mb-6">
            Terjadi masalah kritis pada komponen dasar. Silakan muat ulang halaman.
          </p>
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Muat Ulang Sistem
          </button>
        </div>
      </body>
    </html>
  );
}

