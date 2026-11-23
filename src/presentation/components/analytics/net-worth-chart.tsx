"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/decimal";
import { TrendingUp } from "lucide-react";

interface SnapshotItem {
  id: string;
  date: string;
  displayDate: string;
  totalInvestments: number;
  totalCash: number;
  totalLiabilities: number;
  netWorth: number;
}

interface NetWorthChartProps {
  initialData: SnapshotItem[];
  currency?: string;
  className?: string;
}

export function NetWorthChart({
  initialData,
  currency = "IDR",
  className = "",
}: NetWorthChartProps) {
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "1y" | "all">("all");
  const [activeMetric, setActiveMetric] = useState<"netWorth" | "breakdown">("netWorth");

  // Filter data based on selected range
  const filteredData = (() => {
    if (!initialData || initialData.length === 0) return [];
    if (range === "all") return initialData;

    const now = new Date();
    let days = 365;
    if (range === "7d") days = 7;
    else if (range === "30d") days = 30;
    else if (range === "90d") days = 90;

    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return initialData.filter((item) => new Date(item.date) >= cutoff);
  })();

  if (filteredData.length === 0) {
    return (
      <div className="min-h-[260px] flex flex-col items-center justify-center text-center p-6 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E4E8EF]">
        <TrendingUp className="h-7 w-7 text-[#94A3B8] mb-2.5" strokeWidth={1.5} />
        <h3 className="text-sm font-bold text-[#1E293B]">Belum Ada Data Historis</h3>
        <p className="text-xs text-[#64748B] max-w-sm mt-1 leading-relaxed">
          Snapshot harian akan otomatis tersimpan saat Anda mencatat transaksi atau menekan tombol snapshot.
        </p>
      </div>
    );
  }

  const latest = filteredData[filteredData.length - 1];
  const earliest = filteredData[0];
  const netWorthDelta = latest.netWorth - earliest.netWorth;
  const netWorthDeltaPct = earliest.netWorth > 0
    ? (netWorthDelta / earliest.netWorth) * 100
    : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Controls: Metric Switcher & Time Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#EEF1F5]">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveMetric("netWorth")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeMetric === "netWorth"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            Kekayaan Bersih
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("breakdown")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeMetric === "breakdown"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            Investasi vs Kas
          </button>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1">
          {(
            [
              { id: "7d", label: "7H" },
              { id: "30d", label: "1B" },
              { id: "90d", label: "3B" },
              { id: "1y", label: "1T" },
              { id: "all", label: "Semua" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setRange(t.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                range === t.id
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-[#64748B] hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Snapshot Header Stats */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-[#94A3B8]">Nilai Terkini</span>
          <div className="text-2xl font-bold font-mono text-[#1E293B]">
            {formatCurrency(latest.netWorth, currency)}
          </div>
        </div>
        {filteredData.length > 1 && (
          <div className="text-right">
            <span className="text-xs text-[#94A3B8]">Pertumbuhan Rentang</span>
            <div
              className={`text-sm font-mono font-bold ${
                netWorthDelta >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {netWorthDelta >= 0 ? "+" : ""}
              {formatCurrency(netWorthDelta, currency)} ({netWorthDeltaPct >= 0 ? "+" : ""}
              {netWorthDeltaPct.toFixed(2)}%)
            </div>
          </div>
        )}
      </div>

      {/* Recharts Area Chart */}
      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="investGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F5" />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={{ stroke: "#E4E8EF" }}
              tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "monospace" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "monospace" }}
              tickFormatter={(v) => {
                if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}M`;
                if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}jt`;
                if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
                return `${v}`;
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload as SnapshotItem;
                return (
                  <div className="rounded-xl border border-[#E4E8EF] bg-white p-3 shadow-lg text-xs space-y-1.5 min-w-[180px]">
                    <div className="font-semibold text-[#1E293B] border-b border-[#EEF1F5] pb-1">
                      {d.displayDate} ({d.date})
                    </div>
                    <div className="flex justify-between items-center text-blue-600 font-medium">
                      <span>Kekayaan Bersih:</span>
                      <span className="font-mono font-bold">{formatCurrency(d.netWorth, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-600">
                      <span>Investasi:</span>
                      <span className="font-mono font-bold">{formatCurrency(d.totalInvestments, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center text-purple-600">
                      <span>Kas Likuid:</span>
                      <span className="font-mono font-bold">{formatCurrency(d.totalCash, currency)}</span>
                    </div>
                    {d.totalLiabilities > 0 && (
                      <div className="flex justify-between items-center text-rose-600">
                        <span>Utang:</span>
                        <span className="font-mono font-bold">-{formatCurrency(d.totalLiabilities, currency)}</span>
                      </div>
                    )}
                  </div>
                );
              }}
            />

            {activeMetric === "netWorth" ? (
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="#2563EB"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#netWorthGrad)"
              />
            ) : (
              <>
                <Area
                  type="monotone"
                  dataKey="totalInvestments"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#investGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="totalCash"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cashGrad)"
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
