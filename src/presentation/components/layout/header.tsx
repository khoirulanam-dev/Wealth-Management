"use client";

import { LogOut, Plus } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Badge } from "@/presentation/components/ui/badge";
import { logoutAction } from "@/app/actions/auth-actions";

interface HeaderProps {
  title?: string;
  currency?: string;
}

export function Header({ title = "Overview", currency = "IDR" }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/60 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Currency context indicator */}
        <Badge variant="outline" className="h-7 px-2.5 font-mono text-xs">
          Currency: <span className="ml-1 font-bold text-foreground">{currency}</span>
        </Badge>

        {/* Global Quick Add Action */}
        <Button size="sm" className="gap-1.5 h-8">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add Record</span>
        </Button>

        {/* Logout Action */}
        <form action={logoutAction}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
