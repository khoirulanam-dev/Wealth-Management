"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { logoutAction } from "@/app/actions/auth-actions";

interface HeaderProps {
  title?: string;
  currency?: string;
}

export function Header({ title = "Ringkasan Portofolio", currency = "IDR" }: HeaderProps) {
  return (
    <header className="h-[60px] flex items-center justify-between border-b border-[#E4E8EF] bg-white/95 px-6 backdrop-blur-md sticky top-0 z-30">
      {/* Left: Breadcrumbs / Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <span>WEALTH OS</span>
          <span>/</span>
        </div>
        <h1 className="text-sm font-bold text-[#1E293B]">{title}</h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Currency context indicator */}
        <div className="flex items-center gap-1 text-xs text-[#64748B]">
          <span>Mata Uang:</span>
          <span className="font-semibold font-mono text-[#1E293B]">{currency}</span>
        </div>

        {/* User Profile */}
        <Link
          href="/settings"
          className="flex items-center gap-2 h-8 px-2.5 rounded-lg border border-[#E4E8EF] bg-[#F8FAFC] hover:bg-slate-100 text-[#1E293B] transition-colors"
          title="Pengaturan Profil Akun"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
            <User className="h-3 w-3" />
          </div>
          <span className="text-xs font-semibold hidden sm:inline">Profil</span>
        </Link>

        {/* Logout Action */}
        <form action={logoutAction}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC]"
            title="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
