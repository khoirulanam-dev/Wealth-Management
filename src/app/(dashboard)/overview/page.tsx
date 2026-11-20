import Link from "next/link";
import {
  TrendingUp,
  Wallet,
  CreditCard,
  PiggyBank,
  ShieldCheck,
  ArrowUpRight,
  Plus,
  Download,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/decimal";
import { Button } from "@/presentation/components/ui/button";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Adminator Hero Section */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div className="space-y-1">
          <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
            Jumat · 20 November 2026
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E293B]">
            Selamat datang kembali, <span className="text-blue-600">Owner</span>
          </h1>
          <p className="text-sm text-[#64748B] max-w-2xl leading-relaxed">
            Konsolidasi menyeluruh posisi aset finansial, portofolio investasi, saldo kas likuid, dan jadwal liabilitas.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="outline" size="sm" className="gap-2 h-9 border-[#E4E8EF] bg-white text-[#1E293B] hover:bg-[#F8FAFC]">
            <Download className="h-4 w-4 text-[#64748B]" />
            Ekspor
          </Button>
          <Button size="sm" className="gap-2 h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="h-4 w-4" />
            Transaksi Baru
          </Button>
        </div>
      </section>

      {/* Adminator 4-Card KPI Grid */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Net Worth (Emerald Theme) */}
        <article className="adm-card p-5 flex flex-col justify-between gap-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-[#64748B]">Kekayaan Bersih</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ArrowUpRight className="h-3 w-3" />
              Net Worth
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight tabular-nums text-[#1E293B]">
              {formatCurrency(0, "IDR")}
            </div>
          </div>
          <div className="pt-3 border-t border-dashed border-[#EEF1F5] text-xs text-[#94A3B8] flex items-center justify-between">
            <span>Aset - Liabilitas</span>
            <span className="font-mono text-[#1E293B] font-semibold">100% Likuid</span>
          </div>
        </article>

        {/* KPI 2: Investments (Blue Theme) */}
        <article className="adm-card p-5 flex flex-col justify-between gap-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-[#64748B]">Nilai Investasi</span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              Portofolio
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight tabular-nums text-[#1E293B]">
              {formatCurrency(0, "IDR")}
            </div>
          </div>
          <div className="pt-3 border-t border-dashed border-[#EEF1F5] text-xs text-[#94A3B8] flex items-center justify-between">
            <span>Saham, RDPU, Emas</span>
            <span className="font-mono text-[#1E293B] font-semibold">0 Aset</span>
          </div>
        </article>

        {/* KPI 3: Cash & Savings (Purple Theme) */}
        <article className="adm-card p-5 flex flex-col justify-between gap-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-[#64748B]">Kas & Simpanan</span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-600 border border-purple-200">
              Likuid
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight tabular-nums text-[#1E293B]">
              {formatCurrency(0, "IDR")}
            </div>
          </div>
          <div className="pt-3 border-t border-dashed border-[#EEF1F5] text-xs text-[#94A3B8] flex items-center justify-between">
            <span>Bank & Dana Darurat</span>
            <span className="font-mono text-[#1E293B] font-semibold">0 Akun</span>
          </div>
        </article>

        {/* KPI 4: Liabilities (Danger Red Theme) */}
        <article className="adm-card p-5 flex flex-col justify-between gap-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-[#64748B]">Total Liabilitas</span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
              Kewajiban
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight tabular-nums text-[#1E293B]">
              {formatCurrency(0, "IDR")}
            </div>
          </div>
          <div className="pt-3 border-t border-dashed border-[#EEF1F5] text-xs text-[#94A3B8] flex items-center justify-between">
            <span>PayLater & Pinjaman</span>
            <span className="font-mono text-[#1E293B] font-semibold">Bebas Utang</span>
          </div>
        </article>
      </section>

      {/* Adminator Panel Grid (Charts & Allocation) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart Panel (8 Columns) */}
        <div className="lg:col-span-8 adm-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4 mb-6">
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-600 block mb-0.5">
                HISTORIS TERVERIFIKASI
              </span>
              <h2 className="text-base font-bold text-[#1E293B]">Riwayat Kekayaan Bersih</h2>
            </div>
            <Link
              href="/analytics"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              Lihat Analitik
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="min-h-[260px] flex flex-col items-center justify-center text-center p-6 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E4E8EF]">
            <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-[#1E293B]">Belum Ada Snapshot Historis</h3>
            <p className="text-xs text-[#64748B] max-w-sm mt-1 leading-relaxed">
              Catat posisi awal atau transaksi pertama pada Milestone 2 untuk mulai membentuk kurva net worth harian secara otomatis.
            </p>
          </div>
        </div>

        {/* Side Panel: Asset Allocation (4 Columns) */}
        <div className="lg:col-span-4 adm-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#EEF1F5] pb-4 mb-6">
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-purple-600 block mb-0.5">
                DISTRIBUSI KELAS ASET
              </span>
              <h2 className="text-base font-bold text-[#1E293B]">Alokasi Portofolio</h2>
            </div>
          </div>

          <div className="min-h-[260px] flex flex-col items-center justify-center text-center p-6 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E4E8EF]">
            <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-[#1E293B]">Belum Ada Aset Terdaftar</h3>
            <p className="text-xs text-[#64748B] max-w-xs mt-1 leading-relaxed">
              Diagram proporsi kelas aset (saham, reksa dana, kas, emas) akan muncul secara otomatis.
            </p>
          </div>
        </div>
      </section>

      {/* Supporting Bottom Row: Passive Income & Quick Highlights */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="adm-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#64748B]">Dividen & Bunga Diterima</span>
            <div className="text-2xl font-bold tabular-nums text-[#1E293B]">{formatCurrency(0, "IDR")}</div>
            <p className="text-xs text-[#94A3B8]">Total pendapatan riil tahun berjalan</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PiggyBank className="h-6 w-6" />
          </div>
        </div>

        <div className="adm-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#64748B]">Dana Darurat Terkumpul</span>
            <div className="text-2xl font-bold tabular-nums text-[#1E293B]">{formatCurrency(0, "IDR")}</div>
            <p className="text-xs text-[#94A3B8]">Alokasi likuid cadangan darurat</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="adm-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#64748B]">Instrumen Pantauan</span>
            <div className="text-2xl font-bold tabular-nums text-[#1E293B]">0 Ticker</div>
            <p className="text-xs text-[#94A3B8]">Watchlist terisolasi dari Net Worth</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="h-6 w-6" />
          </div>
        </div>
      </section>
    </div>
  );
}
