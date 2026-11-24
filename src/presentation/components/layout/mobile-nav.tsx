"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth-actions";
import { SessionUser } from "@/lib/auth";

interface MobileNavProps {
  user?: SessionUser | null;
}

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

export function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const displayName = user?.name || (user?.email ? user.email.split("@")[0] : "Investor");
  const userInitial = displayName.charAt(0).toUpperCase();

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
          {/* Frosted Soft Backdrop */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-[2px] transition-all lg:hidden animate-in fade-in-0 duration-200"
          />

          {/* Clean Bright Solid Card Drawer */}
          <div className="fixed bottom-[84px] inset-x-3 max-w-md mx-auto z-50 rounded-[28px] bg-white border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.22)] p-4 sm:p-5 lg:hidden animate-in fade-in-0 slide-in-from-bottom-5 duration-250 ease-out">
            {/* Top Sheet Handle */}
            <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-3" />

            {/* Profile Bar in Drawer Header */}
            <div className="flex items-center justify-between pb-3 mb-1 border-b border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={displayName}
                    width={36}
                    height={36}
                    unoptimized
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs shadow-xs shrink-0">
                    {user ? userInitial : <UserIcon className="h-4 w-4" />}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block">{displayName}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-[10px] font-semibold text-blue-600 border border-blue-100">
                      Akun
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 truncate block">{user?.email || "Menu & Navigasi Lengkap"}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Tutup Menu"
                className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Menu Items List */}
            <div className="space-y-1 my-2 max-h-[50vh] overflow-y-auto pr-0.5">
              {menuDrawerItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all",
                      isActive
                        ? "bg-blue-50 border border-blue-200/80 text-blue-700 font-semibold shadow-xs"
                        : "text-slate-800 hover:bg-slate-50 active:bg-slate-100/80 border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl shrink-0 transition-colors",
                          isActive
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-blue-50 text-blue-600 border border-blue-100/60"
                        )}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <span className={cn("text-xs font-semibold block truncate", isActive ? "text-blue-700" : "text-slate-800")}>
                          {item.name}
                        </span>
                        <span className={cn("text-[11px] block truncate", isActive ? "text-blue-500" : "text-slate-500")}>
                          {item.description}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 shrink-0 transition-transform", isActive ? "text-blue-600 translate-x-0.5" : "text-slate-400")} />
                  </Link>
                );
              })}
            </div>

            {/* Logout shortcut in Drawer */}
            <div className="pt-2 border-t border-slate-100">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100 active:bg-rose-200/80 rounded-xl transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar dari Akun</span>
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Modern Scooped Bottom Navigation Bar */}
      <div className="fixed bottom-3 inset-x-4 max-w-md mx-auto z-40 lg:hidden pointer-events-none">
        <div className="pointer-events-auto relative h-[64px] w-full">
          {/* Layer 0: Seamless Scooped White Bar with Soft Modern Elevation Shadow */}
          <div className="absolute inset-0 flex items-stretch h-full w-full filter drop-shadow-[0_10px_25px_rgba(15,23,42,0.10)]">
            {/* Left Pill Half */}
            <div className="flex-1 bg-white rounded-l-[32px] h-full" />

            {/* Center Scoop Notch (Ultra-Smooth Cubic Bezier Cradle) */}
            <div className="relative w-[76px] h-full shrink-0 -mx-[0.5px]">
              <svg
                viewBox="0 0 76 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full block"
              >
                <path
                  d="M 0 0 C 14 0 17 8 22 18 C 26 27 31 38 38 38 C 45 38 50 27 54 18 C 59 8 62 0 76 0 L 76 64 L 0 64 Z"
                  fill="#FFFFFF"
                />
              </svg>
            </div>

            {/* Right Pill Half */}
            <div className="flex-1 bg-white rounded-r-[32px] h-full" />
          </div>

          {/* Layer 1: True 5-Column Grid with Perfectly Centered Icons */}
          <div className="relative z-10 grid grid-cols-5 h-full w-full items-center">
            {/* 1. Beranda */}
            <Link
              href="/overview"
              onClick={() => setIsMenuOpen(false)}
              title="Beranda"
              className="flex flex-col items-center justify-center h-full group select-none py-1 active:scale-90 transition-transform duration-150"
            >
              <LayoutDashboard
                className={cn(
                  "h-[26px] w-[26px] transition-colors",
                  isOverviewActive
                    ? "text-[#007AFF] stroke-[2.25]"
                    : "text-slate-400 group-hover:text-slate-600 stroke-[1.85]"
                )}
              />
              <div className="h-1.5 w-1.5 flex items-center justify-center mt-1">
                {isOverviewActive ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#007AFF]" />
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
              className="flex flex-col items-center justify-center h-full group select-none py-1 active:scale-90 transition-transform duration-150"
            >
              <Wallet
                className={cn(
                  "h-[26px] w-[26px] transition-colors",
                  isCashActive
                    ? "text-[#007AFF] stroke-[2.25]"
                    : "text-slate-400 group-hover:text-slate-600 stroke-[1.85]"
                )}
              />
              <div className="h-1.5 w-1.5 flex items-center justify-center mt-1">
                {isCashActive ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#007AFF]" />
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
                className="absolute -top-4.5 flex items-center justify-center select-none active:scale-90 transition-transform duration-150 group"
              >
                <div
                  className={cn(
                    "flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#007AFF] text-white border-[3.5px] border-white shadow-md shadow-[#007AFF]/35 transition-all duration-200",
                    isPortoActive
                      ? "scale-105 shadow-lg shadow-[#007AFF]/50 ring-2 ring-[#007AFF]/30"
                      : "group-hover:scale-105"
                  )}
                >
                  <TrendingUp className="h-[26px] w-[26px] stroke-[2.5] text-white" />
                </div>
              </Link>
            </div>

            {/* 4. Utang (Liabilitas) */}
            <Link
              href="/liabilities"
              onClick={() => setIsMenuOpen(false)}
              title="Liabilitas & Utang"
              className="flex flex-col items-center justify-center h-full group select-none py-1 active:scale-90 transition-transform duration-150"
            >
              <CreditCard
                className={cn(
                  "h-[26px] w-[26px] transition-colors",
                  isLiabilitiesActive
                    ? "text-[#007AFF] stroke-[2.25]"
                    : "text-slate-400 group-hover:text-slate-600 stroke-[1.85]"
                )}
              />
              <div className="h-1.5 w-1.5 flex items-center justify-center mt-1">
                {isLiabilitiesActive ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#007AFF]" />
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
              className="flex flex-col items-center justify-center h-full group select-none py-1 active:scale-90 transition-transform duration-150"
            >
              <Grid
                className={cn(
                  "h-[26px] w-[26px] transition-colors",
                  isMenuOpen || isMenuSectionActive
                    ? "text-[#007AFF] stroke-[2.25]"
                    : "text-slate-400 group-hover:text-slate-600 stroke-[1.85]"
                )}
              />
              <div className="h-1.5 w-1.5 flex items-center justify-center mt-1">
                {(isMenuOpen || isMenuSectionActive) ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#007AFF]" />
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
