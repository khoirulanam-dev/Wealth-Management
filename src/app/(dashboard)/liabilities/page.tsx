import { CreditCard, Plus } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

export default function LiabilitiesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E8EF]">
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-rose-600 block mb-0.5">
            MANAJEMEN KEWAJIBAN
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Liabilitas & Utang</h1>
          <p className="text-sm text-[#64748B]">
            Pencatatan PayLater, tagihan kartu kredit, cicilan pembelian, dan pinjaman aktif.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button size="sm" className="gap-2 h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="h-4 w-4" />
            Catat Liabilitas
          </Button>
        </div>
      </div>

      {/* Main Adminator Card */}
      <div className="adm-card p-6">
        <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <CreditCard className="h-5 w-5 text-rose-600" />
            <div>
              <h2 className="text-base font-bold text-[#1E293B]">Daftar Kewajiban & Tagihan</h2>
              <p className="text-xs text-[#94A3B8]">Saldo sisa berkurang berdasarkan pembayaran riil yang tercatat</p>
            </div>
          </div>
        </div>

        <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E4E8EF]">
          <CreditCard className="h-8 w-8 text-[#94A3B8] mb-3" strokeWidth={1.5} />
          <h3 className="text-sm font-bold text-[#1E293B]">Bebas dari Liabilitas</h3>
          <p className="text-xs text-[#64748B] max-w-sm mt-1 leading-relaxed">
            Pencatatan kewajiban, jadwal pembayaran cicilan, dan kalkulasi jatuh tempo utang siap dikonfigurasi.
          </p>
        </div>
      </div>
    </div>
  );
}
