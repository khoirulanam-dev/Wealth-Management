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
  MoreHorizontal,
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
          {/* Backdrop */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
          />

          {/* Slide-Up Card Drawer */}
          <div className="fixed bottom-20 inset-x-3 max-w-md mx-auto z-50 rounded-2xl bg-white border border-[#E4E8EF] shadow-2xl p-4 lg:hidden animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF1F5]">
              <div>
                <h3 className="text-sm font-bold text-[#1E293B]">Menu &amp; Fitur Lainnya</h3>
                <p className="text-[11px] text-[#64748B]">Akses cepat instrumen pasar dan sistem</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#1E293B] hover:bg-slate-100 transition-colors"
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
                      "flex items-center justify-between p-2.5 rounded-xl transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-[#1E293B] hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                          isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-[#64748B]"
                        )}
                      >
                        <Icon className="h-4 w-4" />
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
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar dari Akun (Logout)</span>
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Modern Floating Dock Bottom Nav */}
      <div className="fixed bottom-3 inset-x-3 max-w-md mx-auto z-40 lg:hidden pointer-events-none">
        <nav className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-1.5 flex items-center justify-around">
          {primaryNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative flex-1 text-center select-none",
                  isActive
                    ? "text-blue-600 bg-blue-50/90 font-bold shadow-2xs"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50 font-medium"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5", isActive ? "stroke-[2.25]" : "stroke-[1.75]")} />
                <span className="text-[10px] tracking-tight leading-none mt-1">
                  {item.name}
                </span>
                {isActive && (
                  <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-blue-600" />
                )}
              </Link>
            );
          })}

          {/* 6th Item: Menu Trigger */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={cn(
              "flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative flex-1 text-center select-none",
              isMenuOpen || isMenuSectionActive
                ? "text-blue-600 bg-blue-50/90 font-bold shadow-2xs"
                : "text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50 font-medium"
            )}
          >
            <MoreHorizontal
              className={cn(
                "h-4.5 w-4.5",
                isMenuOpen || isMenuSectionActive ? "stroke-[2.25]" : "stroke-[1.75]"
              )}
            />
            <span className="text-[10px] tracking-tight leading-none mt-1">
              Menu
            </span>
            {(isMenuOpen || isMenuSectionActive) && (
              <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-blue-600" />
            )}
          </button>
        </nav>
      </div>
    </>
  );
}
