import { RefreshCw } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

export default function MarketDataPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E8EF]">
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-600 block mb-0.5">
            VALUASI & KUOTASI
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Pusat Data Pasar (Market Data)</h1>
          <p className="text-sm text-[#64748B]">
            Pembaruan harga instrumen yang dipicu oleh pengguna secara manual, riwayat quote immutable, dan koreksi harga.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button size="sm" className="gap-2 h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <RefreshCw className="h-4 w-4" />
            Perbarui Kuotasi
          </Button>
        </div>
      </div>

      {/* Main Adminator Card */}
      <div className="adm-card p-6">
        <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1E293B]">Manajemen Kuotasi Harga</h2>
              <p className="text-xs text-[#94A3B8]">Aplikasi tetap berfungsi penuh tanpa ketergantungan API pihak ketiga</p>
            </div>
          </div>
        </div>

        <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E4E8EF]">
          <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <RefreshCw className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-[#1E293B]">Belum Ada Kuotasi Terdaftar</h3>
          <p className="text-xs text-[#64748B] max-w-sm mt-1 leading-relaxed">
            Orkestrasi pembaruan harga manual, penyimpanan sumber data, dan koreksi nilai instrumen dijadwalkan pada Milestone 5.
          </p>
        </div>
      </div>
    </div>
  );
}
