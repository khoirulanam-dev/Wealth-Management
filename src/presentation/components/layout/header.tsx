"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, User, ShieldCheck } from "lucide-react";
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
    <header className="h-14 sm:h-[60px] flex items-center justify-between border-b border-[#E4E8EF] bg-white/95 px-4 sm:px-6 backdrop-blur-md sticky top-0 z-30">
      {/* Left: Brand Badge on Mobile + Breadcrumb / Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
        {/* Mobile Shield Icon */}
        <div className="flex h-7 w-7 sm:hidden items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs shrink-0">
          <ShieldCheck className="h-4 w-4" />
        </div>

        {/* Desktop Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#94A3B8] shrink-0">
          <span>WEALTH OS</span>
          <span>/</span>
        </div>

        <h1 className="text-sm sm:text-sm font-bold text-[#1E293B] truncate">
          {title}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Currency context indicator: Hidden on mobile to avoid cramped wrapping */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E4E8EF] text-xs text-[#64748B]">
          <span>Mata Uang:</span>
          <span className="font-semibold font-mono text-[#1E293B]">{currency}</span>
        </div>

        {/* User Profile */}
        <Link
          href="/settings"
          className="flex items-center gap-2 h-8 px-2 sm:px-2.5 rounded-lg border border-[#E4E8EF] bg-[#F8FAFC] hover:bg-slate-100 text-[#1E293B] transition-colors"
          title="Pengaturan Profil Akun"
        >
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={displayName}
              width={20}
              height={20}
              unoptimized
              className="h-5 w-5 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">
              {user ? userInitial : <User className="h-3 w-3" />}
            </div>
          )}
          <span className="text-xs font-semibold hidden sm:inline truncate max-w-[120px]">
            {displayName}
          </span>
        </Link>

        {/* Logout Action */}
        <form action={logoutAction}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#64748B] hover:text-rose-600 hover:bg-rose-50"
            title="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
