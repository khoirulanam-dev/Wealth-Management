"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RotateCcw,
  LayoutDashboard,
  Activity,
  CheckCircle2,
} from "lucide-react";
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
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg rounded-3xl border border-[#E4E8EF] bg-white/95 backdrop-blur-xl p-8 sm:p-12 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)] space-y-6">
        {/* Top Floating Badge & Icon */}
        <div className="relative inline-block">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-sm mx-auto">
            <AlertTriangle className="h-10 w-10 stroke-[1.75]" />
          </div>
          <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold tracking-wider shadow-xs">
            500
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-rose-600 uppercase tracking-widest block">
            SERVER ERROR · HTTP 500 / 502
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E293B]">
            Terjadi Gangguan Server
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
            Sistem mendeteksi kendala saat mengeksekusi komputasi atau menghubungi basis data Neon. Tenang, <strong className="text-slate-700">data keuangan Anda tetap aman dan terisolasi</strong>.
          </p>
        </div>

        {/* Error Digest Box */}
        {error.digest && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
              Diagnostik Sesi (Digest ID)
            </span>
            <code className="text-xs font-mono font-bold text-slate-700 break-all block">
              {error.digest}
            </code>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-11 px-5 rounded-xl shadow-md shadow-blue-600/20 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Coba Muat Ulang</span>
          </Button>

          <Link href="/overview" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full gap-2 text-xs h-11 px-5 border-[#E4E8EF] text-[#1E293B] hover:bg-slate-50 font-semibold rounded-xl"
            >
              <LayoutDashboard className="h-4 w-4 text-blue-600" />
              <span>Kembali ke Beranda</span>
            </Button>
          </Link>
        </div>

        {/* Health Check Link */}
        <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-500">
          <Link
            href="/api/health"
            target="_blank"
            className="flex items-center gap-1.5 text-blue-600 hover:underline font-medium text-[11px]"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Periksa Status Server (/api/health)</span>
          </Link>
        </div>

        {/* Architecture Security Badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#94A3B8] pt-2 border-t border-[#EEF1F5]">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>WEALTH OS · Zero Data Loss Architecture</span>
        </div>
      </div>
    </div>
  );
}
