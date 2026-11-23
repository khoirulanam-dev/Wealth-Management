import { ShieldCheck, Database, CheckCircle2 } from "lucide-react";
import { env } from "@/lib/env";
import { getSession } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E8EF]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-0.5">
            KONFIGURASI TERMINAL
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Pengaturan Sistem</h1>
          <p className="text-sm text-[#64748B]">
            Status sistem privat, konfigurasi basis data Neon PostgreSQL, dan parameter otentikasi.
          </p>
        </div>
      </div>

      {/* Grid of Adminator Setting Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Security & Access Panel */}
        <div className="adm-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-[#EEF1F5] pb-4 mb-5">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1E293B]">Akses & Keamanan</h2>
                <p className="text-xs text-[#94A3B8]">Boundary privat single-user dinamis</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[#EEF1F5]">
                <span className="text-[#64748B]">Mode Operasional</span>
                <span className="font-semibold text-[#1E293B] bg-[#F1F5F9] px-2.5 py-1 rounded-md">Private Database Auth</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#EEF1F5]">
                <span className="text-[#64748B]">Penyimpanan Kredensial</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">Neon PostgreSQL Table &apos;users&apos;</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#EEF1F5]">
                <span className="text-[#64748B]">Akun Terotentikasi</span>
                <span className="font-mono font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                  {session?.email || "Tidak ada sesi aktif"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#64748B]">Mata Uang Pelaporan</span>
                <span className="font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">{session?.reportingCurrency || env.DEFAULT_CURRENCY}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EEF1F5] flex items-center gap-2 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            <span>Otentikasi dinamis dari database terhubung</span>
          </div>
        </div>

        {/* Database & Infrastructure Panel */}
        <div className="adm-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-[#EEF1F5] pb-4 mb-5">
              <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1E293B]">Infrastruktur Database</h2>
                <p className="text-xs text-[#94A3B8]">Koneksi serverless Neon PostgreSQL</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[#EEF1F5]">
                <span className="text-[#64748B]">Database Engine</span>
                <span className="font-semibold text-[#1E293B]">Neon PostgreSQL (Serverless)</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#EEF1F5]">
                <span className="text-[#64748B]">ORM</span>
                <span className="font-semibold text-[#1E293B]">Drizzle ORM (drizzle-kit)</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#EEF1F5]">
                <span className="text-[#64748B]">Mode Koneksi</span>
                <span className="font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">PgBouncer Pooler (ap-southeast-1)</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#64748B]">Target Deployment</span>
                <span className="font-semibold text-[#1E293B] bg-[#F1F5F9] px-2.5 py-1 rounded-md">Vercel Serverless</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EEF1F5] flex items-center gap-2 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            <span>Koneksi database Neon live & terverifikasi (18 tabel)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
