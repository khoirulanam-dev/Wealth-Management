import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  currency?: string;
}

export function AppShell({ children, title, currency }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} currency={currency} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

