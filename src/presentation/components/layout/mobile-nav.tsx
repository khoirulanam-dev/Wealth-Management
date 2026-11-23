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

      {/* Modern Curved Floating Dock with Prominent Center Porto Button */}
      <div className="fixed bottom-3 inset-x-3 max-w-md mx-auto z-40 lg:hidden pointer-events-none">
        <nav className="pointer-events-auto relative bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_16px_36px_-6px_rgba(15,23,42,0.18),0_4px_16px_rgba(0,0,0,0.06)] rounded-[28px] px-2 py-2 flex items-center justify-between ring-1 ring-black/[0.04]">
          {/* Subtle top reflection accent glow */}
          <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none" />

          {/* 1. Beranda */}
          <Link
            href="/overview"
            onClick={() => setIsMenuOpen(false)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-center select-none group"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                isOverviewActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-[#64748B] group-hover:text-[#1E293B]"
              )}
            >
              <LayoutDashboard
                className={cn(
                  "h-5 w-5",
                  isOverviewActive ? "stroke-[2.25]" : "stroke-[1.75]"
                )}
              />
            </div>
            <span
              className={cn(
                "text-[11px] tracking-tight leading-none mt-1 transition-colors",
                isOverviewActive ? "font-bold text-blue-600" : "font-medium text-[#64748B]"
              )}
            >
              Beranda
            </span>
            {isOverviewActive && (
              <span className="h-1 w-1 rounded-full bg-blue-600 mt-0.5" />
            )}
          </Link>

          {/* 2. Kas */}
          <Link
            href="/cash"
            onClick={() => setIsMenuOpen(false)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-center select-none group"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                isCashActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-[#64748B] group-hover:text-[#1E293B]"
              )}
            >
              <Wallet
                className={cn(
                  "h-5 w-5",
                  isCashActive ? "stroke-[2.25]" : "stroke-[1.75]"
                )}
              />
            </div>
            <span
              className={cn(
                "text-[11px] tracking-tight leading-none mt-1 transition-colors",
                isCashActive ? "font-bold text-blue-600" : "font-medium text-[#64748B]"
              )}
            >
              Kas
            </span>
            {isCashActive && (
              <span className="h-1 w-1 rounded-full bg-blue-600 mt-0.5" />
            )}
          </Link>

          {/* 3. CENTER HERO: Porto (Investasi) - Menonjol ke Atas */}
          <Link
            href="/investments"
            onClick={() => setIsMenuOpen(false)}
            className="relative -mt-7 flex flex-col items-center justify-center flex-1 text-center select-none group z-10"
          >
            {/* Elevated Protruding Circular Button */}
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 via-blue-600 to-indigo-600 text-white border-[3.5px] border-white transition-all duration-200 active:scale-95",
                isPortoActive
                  ? "shadow-[0_10px_25px_-3px_rgba(37,99,235,0.6)] scale-105 ring-2 ring-blue-500/30"
                  : "shadow-[0_8px_20px_-3px_rgba(37,99,235,0.45)] group-hover:scale-105"
              )}
            >
              <TrendingUp className="h-6 w-6 stroke-[2.25] text-white" />
            </div>
            <span
              className={cn(
                "text-[11px] tracking-tight leading-none mt-1 transition-colors",
                isPortoActive ? "font-bold text-blue-600" : "font-semibold text-[#1E293B]"
              )}
            >
              Porto
            </span>
            {isPortoActive && (
              <span className="h-1 w-1 rounded-full bg-blue-600 mt-0.5" />
            )}
          </Link>

          {/* 4. Utang (Liabilitas) */}
          <Link
            href="/liabilities"
            onClick={() => setIsMenuOpen(false)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-center select-none group"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                isLiabilitiesActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-[#64748B] group-hover:text-[#1E293B]"
              )}
            >
              <CreditCard
                className={cn(
                  "h-5 w-5",
                  isLiabilitiesActive ? "stroke-[2.25]" : "stroke-[1.75]"
                )}
              />
            </div>
            <span
              className={cn(
                "text-[11px] tracking-tight leading-none mt-1 transition-colors",
                isLiabilitiesActive ? "font-bold text-blue-600" : "font-medium text-[#64748B]"
              )}
            >
              Utang
            </span>
            {isLiabilitiesActive && (
              <span className="h-1 w-1 rounded-full bg-blue-600 mt-0.5" />
            )}
          </Link>

          {/* 5. Menu (Drawer Trigger) */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-center select-none group"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                isMenuOpen || isMenuSectionActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-[#64748B] group-hover:text-[#1E293B]"
              )}
            >
              <Grid
                className={cn(
                  "h-5 w-5",
                  isMenuOpen || isMenuSectionActive ? "stroke-[2.25]" : "stroke-[1.75]"
                )}
              />
            </div>
            <span
              className={cn(
                "text-[11px] tracking-tight leading-none mt-1 transition-colors",
                isMenuOpen || isMenuSectionActive
                  ? "font-bold text-blue-600"
                  : "font-medium text-[#64748B]"
              )}
            >
              Menu
            </span>
            {(isMenuOpen || isMenuSectionActive) && (
              <span className="h-1 w-1 rounded-full bg-blue-600 mt-0.5" />
            )}
          </button>
        </nav>
      </div>
    </>
  );
}
