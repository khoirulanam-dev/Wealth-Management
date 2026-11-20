import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { ToastProvider } from "@/presentation/components/ui/toast";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  currency?: string;
}

export function AppShell({ children, title, currency }: AppShellProps) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[#F0F4F8]">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <Header title={title} currency={currency} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
        <MobileNav />
      </div>
    </ToastProvider>
  );
}
