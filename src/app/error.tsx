"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-[#E4E8EF] bg-white p-8 sm:p-10 text-center shadow-card">
        {/* Visual Badge */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 mx-auto mb-6">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <span className="font-mono text-xs font-bold text-red-600 uppercase tracking-widest block mb-1">
          KENDALA SISTEM · 500 / 502
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">
          Terjadi Gangguan Server
        </h1>
        <p className="text-xs text-[#64748B] mt-2 mb-6 leading-relaxed max-w-sm mx-auto">
          Sistem mendeteksi kegagalan saat menghubungi database atau merender komponen. Tenang, data finansial Anda tetap aman dan terisolasi.
        </p>

        {error.digest && (
          <div className="mb-6 rounded-lg bg-slate-50 border border-[#E4E8EF] p-2.5 text-xs font-mono text-[#64748B]">
            Digest ID: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 shadow-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Coba Muat Ulang
          </Button>
          <Link href="/overview" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full gap-2 text-xs h-10 border-[#E4E8EF] text-[#1E293B] hover:bg-slate-50 font-medium"
            >
              <Home className="h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-[#EEF1F5] text-xs text-[#94A3B8] font-mono">
          WEALTH OS · Zero Data Loss Architecture
        </div>
      </div>
    </div>
  );
}

