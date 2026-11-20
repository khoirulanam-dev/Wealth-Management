"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  CreditCard,
  PiggyBank,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileItems = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Invest", href: "/investments", icon: TrendingUp },
  { name: "Cash", href: "/cash", icon: Wallet },
  { name: "Liabilities", href: "/liabilities", icon: CreditCard },
  { name: "Income", href: "/income", icon: PiggyBank },
  { name: "More", href: "/settings", icon: MoreHorizontal },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t border-border bg-card/95 px-2 backdrop-blur-md lg:hidden">
      <div className="grid w-full grid-cols-6 items-center">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-1 text-xs font-medium transition-colors",
                isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
