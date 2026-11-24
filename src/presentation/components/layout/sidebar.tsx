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
    <aside className="hidden lg:flex w-[252px] flex-col border-r border-black/[0.06] bg-[#FBFBFD]/95 backdrop-blur-2xl sticky top-0 h-screen overflow-y-auto">
      {/* macOS Window Traffic Lights Controls */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-1">
        <span className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 shadow-2xs hover:opacity-85 transition-opacity" />
        <span className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 shadow-2xs hover:opacity-85 transition-opacity" />
        <span className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 shadow-2xs hover:opacity-85 transition-opacity" />
      </div>

      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-black/[0.04]">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#007AFF] text-white shadow-xs font-black text-sm tracking-tighter">
          W
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-[#1C1C1E]">WEALTH OS</span>
          <span className="text-[10px] font-mono text-[#8E8E93] tracking-wider uppercase">Wealth Management</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-3 space-y-4">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#8E8E93]">
              {section.title}
            </div>
            <nav className="space-y-0.5 pt-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-[0.98]",
                      isActive
                        ? "text-[#007AFF] bg-[#007AFF]/10 font-semibold shadow-2xs"
                        : "text-[#636366] hover:text-[#1C1C1E] hover:bg-black/[0.03]"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-[#007AFF]" : "text-[#8E8E93]")} />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Workspace Footer Profile */}
      <div className="p-3 border-t border-black/[0.04] mt-auto pb-5">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 border border-black/[0.05] hover:border-black/[0.1] hover:bg-white transition-all group shadow-2xs">
          <Link href="/settings" className="flex items-center gap-2.5 min-w-0 flex-1 active:scale-95 transition-transform" title="Buka Pengaturan Profil">
            <div className="relative shrink-0">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={displayName}
                  width={32}
                  height={32}
                  unoptimized
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-black/10"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {userInitial}
                </div>
              )}
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#34C759] ring-2 ring-white" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-[#1C1C1E] truncate group-hover:text-[#007AFF] transition-colors">
                {displayName}
              </span>
              <span className="text-[10px] text-[#8E8E93] truncate">
                {user?.email || "Private Vault"}
              </span>
            </div>
          </Link>
          <form action={logoutAction} className="shrink-0 pl-1">
            <button
              type="submit"
              title="Keluar dari akun"
              className="h-7 w-7 rounded-lg flex items-center justify-center text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors active:scale-90"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
