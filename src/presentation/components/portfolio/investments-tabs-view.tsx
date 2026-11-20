"use client";

import { useState } from "react";
import { HoldingsTable, HoldingItem } from "./holdings-table";
import { AccountsTable, AccountItem } from "./accounts-table";
import { InstrumentsTable, InstrumentItem } from "./instruments-table";
import { Briefcase, Building2, LineChart } from "lucide-react";

interface InvestmentsTabsViewProps {
  holdings: HoldingItem[];
  accounts: AccountItem[];
  instruments: InstrumentItem[];
}

export function InvestmentsTabsView({
  holdings,
  accounts,
  instruments,
}: InvestmentsTabsViewProps) {
  const [activeTab, setActiveTab] = useState<"holdings" | "accounts" | "instruments">("holdings");

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 border-b border-[#E4E8EF] pb-px">
        <button
          onClick={() => setActiveTab("holdings")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px ${
            activeTab === "holdings"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Posisi Investasi (Holdings)</span>
          <span className="font-mono text-[11px] text-[#94A3B8]">({holdings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("accounts")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px ${
            activeTab === "accounts"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Akun Sekuritas & Bank</span>
          <span className="font-mono text-[11px] text-[#94A3B8]">({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("instruments")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px ${
            activeTab === "instruments"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <LineChart className="h-4 w-4" />
          <span>Katalog Instrumen</span>
          <span className="font-mono text-[11px] text-[#94A3B8]">({instruments.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "holdings" && (
        <div className="animate-in fade-in duration-150">
          <HoldingsTable
            holdings={holdings}
            accounts={accounts}
            instruments={instruments}
          />
        </div>
      )}

      {activeTab === "accounts" && (
        <div className="animate-in fade-in duration-150">
          <AccountsTable accounts={accounts} />
        </div>
      )}

      {activeTab === "instruments" && (
        <div className="animate-in fade-in duration-150">
          <InstrumentsTable instruments={instruments} />
        </div>
      )}
    </div>
  );
}

