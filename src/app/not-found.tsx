import Link from "next/link";
import {
  Compass,
  ArrowLeft,
  TrendingUp,
  LayoutDashboard,
  CheckCircle2,
  Search,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg rounded-3xl border border-[#E4E8EF] bg-white/95 backdrop-blur-xl p-8 sm:p-12 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)] space-y-6">
        {/* Top Floating Badge & Icon */}
        <div className="relative inline-block">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm mx-auto">
            <Compass className="h-10 w-10 animate-pulse stroke-[1.75]" />
          </div>
          <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold tracking-wider shadow-xs">
            404
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-blue-600 uppercase tracking-widest block">
            RESOURCE NOT FOUND · HTTP 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E293B]">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
            Alamat URL yang Anda tuju tidak tersedia, telah dipindahkan, atau berada di luar perimeter portofolio privat Anda.
          </p>
        </div>

        {/* Quick Link Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/overview" className="w-full sm:w-auto">
            <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-11 px-5 rounded-xl shadow-md shadow-blue-600/20 transition-all">
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Beranda</span>
            </Button>
          </Link>
          <Link href="/investments" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full gap-2 text-xs h-11 px-5 border-[#E4E8EF] text-[#1E293B] hover:bg-slate-50 font-semibold rounded-xl"
            >
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span>Portofolio</span>
            </Button>
          </Link>
        </div>

        {/* Helpful Shortcut Cards */}
        <div className="pt-4 border-t border-[#EEF1F5] grid grid-cols-2 gap-3 text-left">
          <Link
            href="/overview"
            className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-200 transition-colors group"
          >
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-blue-600 transition-colors">
                Dashboard
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-tight">
              Ringkasan kekayaan bersih &amp; kas
            </p>
          </Link>

          <Link
            href="/watchlist"
            className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-200 transition-colors group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Search className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-indigo-600 transition-colors">
                Watchlist
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-tight">
              Pantau harga saham &amp; aset pasar
            </p>
          </Link>
        </div>

        {/* Architecture Security Badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#94A3B8] pt-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>WEALTH OS · Private Financial Architecture</span>
        </div>
      </div>
    </div>
  );
}
