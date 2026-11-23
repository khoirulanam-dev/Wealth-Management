import { PiggyBank, Plus, Calendar } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

export default function IncomePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E8EF]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 block mb-0.5">
            PENDAPATAN PASIF
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Dividen & Passive Income</h1>
          <p className="text-sm text-[#64748B]">
            Pencatatan pendapatan dividen saham, kupon obligasi, dan bagi hasil reksa dana secara terpisah antara realisasi dan estimasi.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" className="gap-2 h-9 border-[#E4E8EF] bg-white text-[#1E293B] hover:bg-[#F8FAFC]">
            <Calendar className="h-4 w-4 text-[#64748B]" />
            Kalender Dividen
          </Button>
          <Button size="sm" className="gap-2 h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="h-4 w-4" />
            Catat Pendapatan
          </Button>
        </div>
      </div>

      {/* Main Adminator Card */}
      <div className="adm-card p-6">
        <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <PiggyBank className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-[#1E293B]">Riwayat Dividen & Kupon</h2>
              <p className="text-xs text-[#94A3B8]">Pemisahan tegas: pendapatan riil diterima tidak bercampur dengan proyeksi forecast</p>
            </div>
          </div>
        </div>

        <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E4E8EF]">
          <PiggyBank className="h-8 w-8 text-[#94A3B8] mb-3" strokeWidth={1.5} />
          <h3 className="text-sm font-bold text-[#1E293B]">Belum Ada Pendapatan Dicatat</h3>
          <p className="text-xs text-[#64748B] max-w-sm mt-1 leading-relaxed">
            Pencatatan riil dividen diterima, kalender hasil investasi, dan yield on cost siap digunakan.
          </p>
        </div>
      </div>
    </div>
  );
}
