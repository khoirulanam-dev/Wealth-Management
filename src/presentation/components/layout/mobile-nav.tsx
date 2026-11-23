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

const primaryNavItems = [
  { name: "Beranda", href: "/overview", icon: LayoutDashboard },
  { name: "Porto", href: "/investments", icon: TrendingUp },
  { name: "Kas", href: "/cash", icon: Wallet },
  { name: "Utang", href: "/liabilities", icon: CreditCard },
  { name: "Dividen", href: "/income", icon: PiggyBank },
];

const menuDrawerItems = [
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
    description: "Preferensi mata uang & keamanan profil",
    href: "/settings",
    icon: Settings,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if current route is within the "Menu" drawer items
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

          {/* Slide-Up Card Drawer with Curved Border */}
          <div className="fixed bottom-24 inset-x-3 max-w-md mx-auto z-50 rounded-3xl bg-white/98 backdrop-blur-2xl border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] p-5 lg:hidden animate-in slide-in-from-bottom-4 duration-200">
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

            <div className="divide-y divide-[#EEF1F5] my-2">
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

      {/* Modern Curved Floating Capsule Dock */}
      <div className="fixed bottom-3 inset-x-3 max-w-md mx-auto z-40 lg:hidden pointer-events-none">
        <nav className="pointer-events-auto relative overflow-hidden bg-white/92 backdrop-blur-2xl border border-slate-200/90 shadow-[0_16px_36px_-6px_rgba(15,23,42,0.18),0_4px_16px_rgba(0,0,0,0.06)] rounded-[26px] p-1.5 flex items-center justify-between ring-1 ring-black/[0.04]">
          {/* Subtle top reflection accent glow */}
          <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none" />

          {primaryNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="group flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 flex-1 text-center select-none"
              >
                {/* Modern Icon Container */}
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/35 scale-105"
                      : "text-[#64748B] group-hover:text-[#1E293B] group-hover:bg-slate-100/70"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "stroke-[2.25]" : "stroke-[1.75]")} />
                </div>

                {/* Text Label */}
                <span
                  className={cn(
                    "text-[10px] tracking-tight leading-none mt-1 transition-colors",
                    isActive
                      ? "font-bold text-blue-600"
                      : "font-medium text-[#64748B] group-hover:text-[#1E293B]"
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* 6th Item: Menu Trigger */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="group flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 flex-1 text-center select-none"
          >
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200",
                isMenuOpen || isMenuSectionActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/35 scale-105"
                  : "text-[#64748B] group-hover:text-[#1E293B] group-hover:bg-slate-100/70"
              )}
            >
              <Grid
                className={cn(
                  "h-4 w-4",
                  isMenuOpen || isMenuSectionActive ? "stroke-[2.25]" : "stroke-[1.75]"
                )}
              />
            </div>
            <span
              className={cn(
                "text-[10px] tracking-tight leading-none mt-1 transition-colors",
                isMenuOpen || isMenuSectionActive
                  ? "font-bold text-blue-600"
                  : "font-medium text-[#64748B] group-hover:text-[#1E293B]"
              )}
            >
              Menu
            </span>
          </button>
        </nav>
      </div>
    </>
  );
}
