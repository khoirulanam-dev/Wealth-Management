import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-[#E4E8EF] bg-white p-8 sm:p-10 text-center shadow-card">
        {/* Visual Badge */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto mb-6">
          <Compass className="h-7 w-7" />
        </div>

        <span className="font-mono text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">
          ERROR 404
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-xs text-[#64748B] mt-2 mb-8 leading-relaxed max-w-sm mx-auto">
          Alamat atau tautan yang Anda akses tidak tersedia, telah diubah jalurnya, atau diproteksi oleh otentikasi privat.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/overview" className="w-full sm:w-auto">
            <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 shadow-sm">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Button>
          </Link>
          <Link href="/investments" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full text-xs h-10 border-[#E4E8EF] text-[#1E293B] hover:bg-slate-50 font-medium">
              Lihat Portofolio
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-[#EEF1F5] text-[11px] text-[#94A3B8] font-mono">
          WEALTH OS · Private Financial Architecture
        </div>
      </div>
    </div>
  );
}
