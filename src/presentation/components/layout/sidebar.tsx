"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  CreditCard,
  PiggyBank,
  History,
  Eye,
  BarChart3,
  RefreshCw,
  Settings,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth-actions";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeType?: "pro" | "hot" | "new";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "RINGKASAN",
    items: [
      { name: "Overview", href: "/overview", icon: LayoutDashboard },
    ],
  },
  {
    title: "PORTOFOLIO",
    items: [
      { name: "Investasi", href: "/investments", icon: TrendingUp },
      { name: "Kas & Simpanan", href: "/cash", icon: Wallet },
      { name: "Liabilitas & Utang", href: "/liabilities", icon: CreditCard },
      { name: "Dividen & Income", href: "/income", icon: PiggyBank },
    ],
  },
  {
    title: "AKTIVITAS & PASAR",
    items: [
      { name: "Transaksi", href: "/transactions", icon: History },
      { name: "Watchlist", href: "/watchlist", icon: Eye },
      { name: "Market Data", href: "/market-data", icon: RefreshCw },
    ],
  },
  {
    title: "ANALITIK & SISTEM",
    items: [
      { name: "Analitik & Laporan", href: "/analytics", icon: BarChart3 },
      { name: "Pengaturan", href: "/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  user?: SessionUser | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const displayName = user?.name || (user?.email ? user.email.split("@")[0] : "Investor");
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="hidden lg:flex w-[248px] flex-col border-r border-[#E4E8EF] bg-white sticky top-0 h-screen overflow-y-auto">
      {/* Brand Header (Adminator Signature Brand) */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#EEF1F5]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
          <ShieldCheck className="h-4.5 w-4.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-[#1E293B]">WEALTH OS</span>
          <span className="text-xs font-mono text-[#94A3B8] tracking-wider uppercase">Wealth Management</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-4 space-y-5">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 text-xs font-mono font-semibold uppercase tracking-widest text-[#94A3B8]">
              {section.title}
            </div>
            <nav className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "text-blue-600 bg-blue-50 font-semibold shadow-[inset_3px_0_0_#2563EB]"
                        : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC]"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-600" : "text-[#94A3B8]")} />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Workspace Footer Profile */}
      <div className="p-3 border-t border-[#EEF1F5] mt-auto pb-6">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] hover:border-slate-300 hover:bg-slate-50 transition-all group shadow-2xs">
          <Link href="/settings" className="flex items-center gap-2.5 min-w-0 flex-1" title="Buka Pengaturan Profil">
            <div className="relative shrink-0">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={displayName}
                  width={32}
                  height={32}
                  unoptimized
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {userInitial}
                </div>
              )}
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-[#1E293B] truncate group-hover:text-blue-600 transition-colors">
                {displayName}
              </span>
              <span className="text-[11px] text-[#64748B] truncate">
                {user?.email || "Private Vault"}
              </span>
            </div>
          </Link>
          <form action={logoutAction} className="shrink-0 pl-1">
            <button
              type="submit"
              title="Keluar dari akun (Logout)"
              className="h-7 w-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
