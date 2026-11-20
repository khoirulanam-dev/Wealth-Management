import { BarChart3, Download } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E8EF]">
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-purple-600 block mb-0.5">
            LAPORAN KINERJA
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Analitik & Laporan Portofolio</h1>
          <p className="text-sm text-[#64748B]">
            Analisis pertumbuhan kekayaan bersih, pemisahan setoran modal versus keuntungan pasar riil, dan alokasi aset.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" className="gap-2 h-9 border-[#E4E8EF] bg-white text-[#1E293B] hover:bg-[#F8FAFC]">
            <Download className="h-4 w-4 text-[#64748B]" />
            Unduh Laporan PNG
          </Button>
        </div>
      </div>

      {/* Main Adminator Card */}
      <div className="adm-card p-6">
        <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1E293B]">Intelijen Portofolio</h2>
              <p className="text-xs text-[#94A3B8]">Kalkulasi akurat membedakan penambahan modal baru dari pertumbuhan pasar</p>
            </div>
          </div>
        </div>

        <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E4E8EF]">
          <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-[#1E293B]">Modul Analitik Belum Aktif</h3>
          <p className="text-xs text-[#64748B] max-w-sm mt-1 leading-relaxed">
            Kurva pertumbuhan net worth, grafik alokasi aset Recharts, dan fitur ekspor gambar laporan akan diimplementasikan pada Milestone 7 & 8.
          </p>
        </div>
      </div>
    </div>
  );
}
