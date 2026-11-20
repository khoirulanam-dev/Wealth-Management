import { Wallet, Plus, ArrowRightLeft } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

export default function CashPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E8EF]">
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-purple-600 block mb-0.5">
            LIKUIDITAS & REKENING
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Kas & Simpanan</h1>
          <p className="text-sm text-[#64748B]">
            Manajemen saldo rekening bank, dompet digital (e-wallet), kas tunai, dan dana darurat.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" className="gap-2 h-9 border-[#E4E8EF] bg-white text-[#1E293B] hover:bg-[#F8FAFC]">
            <ArrowRightLeft className="h-4 w-4 text-[#64748B]" />
            Transfer Internal
          </Button>
          <Button size="sm" className="gap-2 h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="h-4 w-4" />
            Tambah Rekening
          </Button>
        </div>
      </div>

      {/* Main Adminator Card */}
      <div className="adm-card p-6">
        <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Wallet className="h-5 w-5 text-purple-600" />
            <div>
              <h2 className="text-base font-bold text-[#1E293B]">Daftar Akun Kas & Tabungan</h2>
              <p className="text-xs text-[#94A3B8]">Transfer internal berpasangan net-to-zero dan rekonsiliasi berkala</p>
            </div>
          </div>
        </div>

        <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E4E8EF]">
          <Wallet className="h-8 w-8 text-[#94A3B8] mb-3" strokeWidth={1.5} />
          <h3 className="text-sm font-bold text-[#1E293B]">Belum Ada Akun Kas Terdaftar</h3>
          <p className="text-xs text-[#64748B] max-w-sm mt-1 leading-relaxed">
            Pencatatan saldo kas, mutasi transfer internal, dan alokasi dana darurat siap dikonfigurasi.
          </p>
        </div>
      </div>
    </div>
  );
}
