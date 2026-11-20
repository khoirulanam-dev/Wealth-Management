"use client";

import { LogOut, Plus, RefreshCw } from "lucide-react";
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
        {/* Market Data Mode Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
          <RefreshCw className="h-3 w-3 text-[#94A3B8]" />
          <span>Manual Quotes</span>
        </div>

        {/* Currency context indicator */}
        <div className="flex items-center gap-1 text-xs text-[#64748B]">
          <span>Mata Uang:</span>
          <span className="font-semibold font-mono text-[#1E293B]">{currency}</span>
        </div>

        {/* Global Quick Add Action */}
        <Button size="sm" className="gap-1.5 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Catat Transaksi</span>
        </Button>

        {/* Logout Action */}
        <form action={logoutAction}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC]" title="Keluar">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
