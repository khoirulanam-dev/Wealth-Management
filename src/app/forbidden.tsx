import Link from "next/link";
import {
  ShieldAlert,
  ArrowLeft,
  Lock,
  KeyRound,
  FileText,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg rounded-3xl border border-[#E4E8EF] bg-white/95 backdrop-blur-xl p-8 sm:p-12 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)] space-y-6">
        {/* Top Floating Badge & Icon */}
        <div className="relative inline-block">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 shadow-sm mx-auto">
            <ShieldAlert className="h-10 w-10 stroke-[1.75]" />
          </div>
          <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-mono text-[10px] font-bold tracking-wider shadow-xs">
            403
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-amber-600 uppercase tracking-widest block">
            ACCESS FORBIDDEN · HTTP 403
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E293B]">
            Akses Ditolak
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
            Sistem mendeteksi bahwa akun atau sesi saat ini tidak memiliki otorisasi untuk mengakses partisi atau entitas data privat ini.
          </p>
        </div>

        {/* Security Isolation Card */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <Lock className="h-3.5 w-3.5 text-amber-600" />
            <span>Boundary Keamanan Single-User Aktif</span>
          </div>
          <p className="text-[11px] text-amber-800/80 leading-relaxed">
            Seluruh data portofolio, rekening kas, dan jadwal liabilitas dilindungi oleh batas otentikasi ketat. Upaya akses tanpa wewenang dicegah secara otomatis.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/overview" className="w-full sm:w-auto">
            <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-11 px-5 rounded-xl shadow-md shadow-blue-600/20 transition-all">
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Dashboard</span>
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full gap-2 text-xs h-11 px-5 border-[#E4E8EF] text-[#1E293B] hover:bg-slate-50 font-semibold rounded-xl"
            >
              <KeyRound className="h-4 w-4 text-slate-500" />
              <span>Ganti Akun (Login)</span>
            </Button>
          </Link>
        </div>

        {/* Audit Footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#94A3B8] pt-2">
          <FileText className="h-3.5 w-3.5 text-slate-400" />
          <span>WEALTH OS · Security Event Logged</span>
        </div>
      </div>
    </div>
  );
}
