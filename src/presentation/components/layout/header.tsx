"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, User } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { logoutAction } from "@/app/actions/auth-actions";
import { SessionUser } from "@/lib/auth";

interface HeaderProps {
  title?: string;
  currency?: string;
  user?: SessionUser | null;
}

export function Header({ title = "Ringkasan Portofolio", currency = "IDR", user }: HeaderProps) {
  const displayName = user?.name || (user?.email ? user.email.split("@")[0] : "Profil");
  const userInitial = displayName.charAt(0).toUpperCase();
  return (
    <header className="h-14 sm:h-[60px] flex items-center justify-between border-b border-black/[0.06] bg-white/80 px-4 sm:px-6 backdrop-blur-xl sticky top-0 z-30 transition-all">
      {/* Left: Brand Badge on Mobile & Tablet + Breadcrumb / Title */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 pr-2">
        {/* Mobile & Tablet Brand Icon (when sidebar is hidden < lg) */}
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 lg:hidden items-center justify-center rounded-xl sm:rounded-2xl bg-[#007AFF] text-white shadow-xs font-black text-sm sm:text-base tracking-tight shrink-0">
          W
        </div>

        {/* Desktop Breadcrumb (when sidebar is visible >= lg) */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-[#8E8E93] shrink-0">
          <span className="font-semibold">WEALTH OS</span>
          <span>/</span>
        </div>

        <h1 className="text-sm sm:text-base font-bold text-[#1C1C1E] truncate">
          {title}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Currency context indicator: Visible on desktop */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/[0.04] border border-black/[0.05] text-xs text-[#636366]">
          <span>Mata Uang:</span>
          <span className="font-semibold font-mono text-[#1C1C1E]">{currency}</span>
        </div>

        {/* User Profile Pill */}
        <Link
          href="/settings"
          className="flex items-center gap-2 h-8 px-2 sm:px-2.5 rounded-full border border-black/[0.06] bg-white/70 hover:bg-white text-[#1C1C1E] transition-all active:scale-95 shadow-2xs"
          title="Pengaturan Profil Akun"
        >
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={displayName}
              width={24}
              height={24}
              unoptimized
              className="h-6 w-6 rounded-full object-cover ring-1 ring-black/10"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#007AFF] text-white text-[11px] font-bold shadow-xs">
              {user ? userInitial : <User className="h-3.5 w-3.5" />}
            </div>
          )}
          <span className="text-xs font-semibold hidden sm:inline truncate max-w-[140px]">
            {displayName}
          </span>
        </Link>

        {/* Logout Action */}
        <form action={logoutAction}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-full active:scale-90"
            title="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
