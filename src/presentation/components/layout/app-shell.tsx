import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { ToastProvider } from "@/presentation/components/ui/toast";
import { FinancialAdvisorChat } from "@/presentation/components/chat/financial-advisor-chat";
import { RealtimeSync } from "@/presentation/components/system/realtime-sync";
import { SessionUser } from "@/lib/auth";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  currency?: string;
  user?: SessionUser | null;
}

export function AppShell({ children, title, currency, user }: AppShellProps) {
  return (
    <ToastProvider>
      <RealtimeSync />
      <div className="flex min-h-screen bg-[#F2F2F7]">
        <Sidebar user={user} />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <Header title={title} currency={currency} user={user} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
        <MobileNav user={user} />
        <FinancialAdvisorChat user={user} />
      </div>
    </ToastProvider>
  );
}
