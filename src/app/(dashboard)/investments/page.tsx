import { TrendingUp, Plus, Filter } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

export default function InvestmentsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E8EF]">
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-600 block mb-0.5">
            PORTOFOLIO INSTRUMEN
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Portofolio Investasi</h1>
          <p className="text-sm text-[#64748B]">
            Pencatatan kepemilikan saham, reksa dana, emas, obligasi, dan aset investasi lainnya.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" className="gap-2 h-9 border-[#E4E8EF] bg-white text-[#1E293B] hover:bg-[#F8FAFC]">
            <Filter className="h-4 w-4 text-[#64748B]" />
            Filter
          </Button>
          <Button size="sm" className="gap-2 h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="h-4 w-4" />
            Tambah Investasi
          </Button>
        </div>
      </div>

      {/* Main Adminator Card */}
      <div className="adm-card p-6">
        <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1E293B]">Daftar Aset Portofolio (Holdings)</h2>
              <p className="text-xs text-[#94A3B8]">Dihitung berbasis Weighted Average Cost dan harga pasar terakhir</p>
            </div>
          </div>
        </div>

        <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E4E8EF]">
          <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-[#1E293B]">Belum Ada Posisi Investasi</h3>
          <p className="text-xs text-[#64748B] max-w-sm mt-1 leading-relaxed">
            Mesin pencatat transaksi saham, reksa dana, emas, dan obligasi dengan weighted-average cost akan aktif pada Milestone 2.
          </p>
        </div>
      </div>
    </div>
  );
}
