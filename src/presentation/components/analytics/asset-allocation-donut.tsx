"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/decimal";
import { Layers } from "lucide-react";

interface AllocationItem {
  name: string;
  assetType: string;
  value: string;
  percentage: number;
  color?: string;
}

interface AssetAllocationDonutProps {
  data: AllocationItem[];
  currency?: string;
  className?: string;
}

const DEFAULT_COLORS = [
  "#2563EB", // Blue - Stock
  "#10B981", // Emerald - Mutual Fund
  "#8B5CF6", // Purple - Cash
  "#F59E0B", // Amber - Gold
  "#F97316", // Orange - Crypto
  "#6366F1", // Indigo - Bond
  "#06B6D4", // Cyan
  "#64748B", // Slate
];

export function AssetAllocationDonut({
  data,
  currency = "IDR",
  className = "",
}: AssetAllocationDonutProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="min-h-[260px] flex flex-col items-center justify-center text-center p-6 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E4E8EF]">
        <Layers className="h-7 w-7 text-[#94A3B8] mb-2.5" strokeWidth={1.5} />
        <h3 className="text-sm font-bold text-[#1E293B]">Belum Ada Aset Terdaftar</h3>
        <p className="text-xs text-[#64748B] max-w-xs mt-1 leading-relaxed">
          Diagram alokasi aset akan muncul secara otomatis setelah Anda mencatat aset atau transaksi pertama.
        </p>
      </div>
    );
  }

  const chartData = data.map((item, idx) => ({
    name: item.name,
    value: parseFloat(item.value),
    percentage: item.percentage,
    color: item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
  }));

  const totalValue = chartData.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Donut Chart with Centered Total */}
      <div className="relative h-[220px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-xl border border-[#E4E8EF] bg-white p-2.5 shadow-lg text-xs space-y-1">
                    <div className="font-semibold text-[#1E293B] flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full inline-block"
                        style={{ backgroundColor: d.color }}
                      />
                      {d.name}
                    </div>
                    <div className="font-mono text-[#64748B]">
                      {formatCurrency(d.value, currency)} ({d.percentage.toFixed(1)}%)
                    </div>
                  </div>
                );
              }}
            />
            <Pie
              data={chartData}
              innerRadius={65}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  style={{
                    transform: hoveredIndex === index ? "scale(1.04)" : "scale(1)",
                    transformOrigin: "center center",
                    transition: "transform 0.2s ease-out",
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
            Total Aset
          </span>
          <span className="text-sm font-bold font-mono text-[#1E293B] max-w-[120px] truncate">
            {formatCurrency(totalValue, currency)}
          </span>
        </div>
      </div>

      {/* Legend Grid */}
      <div className="space-y-2 pt-1 border-t border-[#EEF1F5]">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-[#1E293B] truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 font-mono shrink-0">
              <span className="text-[#64748B]">{item.percentage.toFixed(1)}%</span>
              <span className="font-semibold text-[#1E293B]">
                {formatCurrency(item.value, currency)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

