"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  CreditCard,
  PiggyBank,
  Grid,
  History,
  Eye,
  RefreshCw,
  BarChart3,
  Settings,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth-actions";

const menuDrawerItems = [
  {
    name: "Dividen & Passive Income",
    description: "Realisasi dividen, kupon & proyeksi",
    href: "/income",
    icon: PiggyBank,
  },
  {
    name: "Riwayat Transaksi",
    description: "Catatan transaksi beli, jual & mutasi",
    href: "/transactions",
    icon: History,
  },
  {
    name: "Daftar Pantauan (Watchlist)",
    description: "Pantau pergerakan harga tanpa modal",
    href: "/watchlist",
    icon: Eye,
  },
  {
    name: "Pusat Data Pasar",
    description: "Kuotasi harga real-time pihak ke-3",
    href: "/market-data",
    icon: RefreshCw,
  },
  {
    name: "Analitik & Laporan",
    description: "Laporan pertumbuhan kekayaan & alokasi",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Pengaturan Akun",
    description: "Preferensi mata uang & profil",
    href: "/settings",
    icon: Settings,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check route statuses
  const isOverviewActive = pathname === "/overview";
  const isCashActive = pathname === "/cash" || pathname.startsWith("/cash/");
  const isPortoActive = pathname === "/investments" || pathname.startsWith("/investments/");
  const isLiabilitiesActive = pathname === "/liabilities" || pathname.startsWith("/liabilities/");

  const isMenuSectionActive = menuDrawerItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <>
      {/* Slide-Up Menu Drawer & Backdrop */}
      {isMenuOpen && (
        <>
          {/* Frosted Backdrop */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden animate-in fade-in duration-200"
          />

          {/* Slide-Up Card Drawer */}
          <div className="fixed bottom-26 inset-x-3 max-w-md mx-auto z-50 rounded-3xl bg-white/98 backdrop-blur-2xl border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] p-5 lg:hidden animate-in slide-in-from-bottom-4 duration-200">
            {/* Top Sheet Handle */}
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 border-b border-[#EEF1F5]">
              <div>
                <h3 className="text-sm font-bold text-[#1E293B]">Menu &amp; Fitur Lengkap</h3>
                <p className="text-[11px] text-[#64748B]">Akses cepat instrumen pasar dan sistem</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#1E293B] hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="divide-y divide-[#EEF1F5] my-2 max-h-[50vh] overflow-y-auto">
              {menuDrawerItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-2xl transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-[#1E293B] hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl shrink-0 shadow-xs",
                          isActive
                            ? "bg-blue-600 text-white shadow-blue-600/30"
                            : "bg-slate-100 text-[#64748B]"
                        )}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold block">{item.name}</span>
                        <span className="text-[11px] text-[#94A3B8] block">{item.description}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                  </Link>
                );
              })}
            </div>

            {/* Logout shortcut in Drawer */}
            <div className="pt-2 border-t border-[#EEF1F5]">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar dari Akun (Logout)</span>
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Modern Scooped Bottom Navigation Bar */}
      <div className="fixed bottom-3 inset-x-4 max-w-md mx-auto z-40 lg:hidden pointer-events-none">
        <div className="pointer-events-auto relative h-[64px] w-full">
          {/* Layer 0: Seamless Scooped White Bar with Subtle Elevation Shadow */}
          <div className="absolute inset-0 flex items-stretch h-full w-full filter drop-shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
            {/* Left Pill Half */}
            <div className="flex-1 bg-white rounded-l-[32px] h-full" />

            {/* Center Scoop Notch (Seamless Fixed SVG Cradle) */}
            <div className="relative w-[72px] h-full shrink-0 -mx-[0.5px]">
              <svg
                viewBox="0 0 72 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full block"
              >
                <path
                  d="M 0 0 L 10 0 C 18 0 23 8 27 18 C 30 26 33 38 36 38 C 39 38 42 26 45 18 C 49 8 54 0 62 0 L 72 0 L 72 64 L 0 64 Z"
                  fill="#FFFFFF"
                />
              </svg>
            </div>

            {/* Right Pill Half */}
            <div className="flex-1 bg-white rounded-r-[32px] h-full" />
          </div>

          {/* Layer 1: True 5-Column Grid with Perfectly Centered Icons */}
          <div className="relative z-10 grid grid-cols-5 h-full w-full">
            {/* 1. Beranda */}
            <Link
              href="/overview"
              onClick={() => setIsMenuOpen(false)}
              title="Beranda"
              className="flex flex-col items-center justify-center h-full group select-none"
            >
              <LayoutDashboard
                className={cn(
                  "h-[25px] w-[25px] transition-colors",
                  isOverviewActive
                    ? "text-blue-600 stroke-[2.25]"
                    : "text-slate-400 group-hover:text-slate-600 stroke-[1.85]"
                )}
              />
              <div className="h-1.5 w-1.5 flex items-center justify-center mt-1">
                {isOverviewActive ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                ) : (
                  <span className="h-1.5 w-1.5 opacity-0" />
                )}
              </div>
            </Link>

            {/* 2. Kas */}
            <Link
              href="/cash"
              onClick={() => setIsMenuOpen(false)}
              title="Kas & Simpanan"
              className="flex flex-col items-center justify-center h-full group select-none"
            >
              <Wallet
                className={cn(
                  "h-[25px] w-[25px] transition-colors",
                  isCashActive
                    ? "text-blue-600 stroke-[2.25]"
                    : "text-slate-400 group-hover:text-slate-600 stroke-[1.85]"
                )}
              />
              <div className="h-1.5 w-1.5 flex items-center justify-center mt-1">
                {isCashActive ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                ) : (
                  <span className="h-1.5 w-1.5 opacity-0" />
                )}
              </div>
            </Link>

            {/* 3. CENTER HERO: Porto (Elevated Floating Circle Button Nestled in Scoop) */}
            <div className="relative flex items-center justify-center h-full">
              <Link
                href="/investments"
                onClick={() => setIsMenuOpen(false)}
                title="Portofolio Investasi"
                className="absolute -top-4 flex items-center justify-center select-none active:scale-95 transition-transform group"
              >
                <div
                  className={cn(
                    "flex h-[52px] w-[52px] items-center justify-center rounded-full bg-blue-600 text-white border-[3px] border-white shadow-md shadow-blue-600/30 transition-all duration-200",
                    isPortoActive
                      ? "scale-105 shadow-lg shadow-blue-600/45 ring-2 ring-blue-500/30"
                      : "group-hover:scale-105"
                  )}
                >
                  <TrendingUp className="h-6 w-6 stroke-[2.5] text-white" />
                </div>
              </Link>
            </div>

            {/* 4. Utang (Liabilitas) */}
            <Link
              href="/liabilities"
              onClick={() => setIsMenuOpen(false)}
              title="Liabilitas & Utang"
              className="flex flex-col items-center justify-center h-full group select-none"
            >
              <CreditCard
                className={cn(
                  "h-[25px] w-[25px] transition-colors",
                  isLiabilitiesActive
                    ? "text-blue-600 stroke-[2.25]"
                    : "text-slate-400 group-hover:text-slate-600 stroke-[1.85]"
                )}
              />
              <div className="h-1.5 w-1.5 flex items-center justify-center mt-1">
                {isLiabilitiesActive ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                ) : (
                  <span className="h-1.5 w-1.5 opacity-0" />
                )}
              </div>
            </Link>

            {/* 5. Menu Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              title="Menu Lengkap"
              className="flex flex-col items-center justify-center h-full group select-none"
            >
              <Grid
                className={cn(
                  "h-[25px] w-[25px] transition-colors",
                  isMenuOpen || isMenuSectionActive
                    ? "text-blue-600 stroke-[2.25]"
                    : "text-slate-400 group-hover:text-slate-600 stroke-[1.85]"
                )}
              />
              <div className="h-1.5 w-1.5 flex items-center justify-center mt-1">
                {(isMenuOpen || isMenuSectionActive) ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                ) : (
                  <span className="h-1.5 w-1.5 opacity-0" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
