"use client";

import { formatCurrency } from "@/lib/decimal";
import { DollarSign } from "lucide-react";

interface ContributionsVsGrowthProps {
  totalCapitalInvested: string;
  totalMarketGain: string;
  gainPercentage: number;
  totalUnrealizedPL: string;
  totalRealizedIncome: string;
  currency?: string;
  className?: string;
}

export function ContributionsVsGrowth({
  totalCapitalInvested,
  totalMarketGain,
  gainPercentage,
  totalUnrealizedPL,
  totalRealizedIncome,
  currency = "IDR",
  className = "",
}: ContributionsVsGrowthProps) {
  const capitalNum = parseFloat(totalCapitalInvested);
  const gainNum = parseFloat(totalMarketGain);
  const isProfit = gainNum >= 0;

  const totalPortfolio = capitalNum + gainNum;
  const capitalShare = totalPortfolio > 0 ? (capitalNum / totalPortfolio) * 100 : 100;
  const gainShare = totalPortfolio > 0 ? (Math.abs(gainNum) / totalPortfolio) * 100 : 0;

  return (
    <div className={`space-y-5 ${className}`}>
      {/* 2-Metric Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left: Total Capital Contributed */}
        <div className="p-4 rounded-xl bg-slate-50 border border-[#E4E8EF] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Total Modal Pokok (Setoran)</span>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold font-mono text-[#1E293B]">
            {formatCurrency(totalCapitalInvested, currency)}
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Uang riil yang Anda setorkan ke portofolio & kas
          </p>
        </div>

        {/* Right: Net Market Return */}
        <div className="p-4 rounded-xl bg-slate-50 border border-[#E4E8EF] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Hasil Pertumbuhan Pasar (Net Gain)</span>
            <span
              className={`font-mono font-bold flex items-center ${
                isProfit ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {isProfit ? "+" : ""}
              {gainPercentage.toFixed(2)}%
            </span>
          </div>
          <div
            className={`text-xl font-bold font-mono ${
              isProfit ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {isProfit ? "+" : ""}
            {formatCurrency(totalMarketGain, currency)}
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Keuntungan murni (capital gain + dividen diterima)
          </p>
        </div>
      </div>

      {/* Visual Bar Ratio */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-[#64748B]">
          <span>Komposisi Nilai Portofolio</span>
          <span className="font-mono">
            Modal: {capitalShare.toFixed(1)}% | Pertumbuhan: {gainShare.toFixed(1)}%
          </span>
        </div>
        <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${Math.min(capitalShare, 100)}%` }}
            title={`Modal Pokok: ${capitalShare.toFixed(1)}%`}
          />
          {gainNum > 0 && (
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(gainShare, 100)}%` }}
              title={`Keuntungan Pasar: ${gainShare.toFixed(1)}%`}
            />
          )}
        </div>
      </div>

      {/* Breakdown Details */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#EEF1F5] text-xs">
        <div>
          <span className="text-[#94A3B8] block">Unrealized Capital Gain:</span>
          <span
            className={`font-mono font-bold ${
              parseFloat(totalUnrealizedPL) >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {parseFloat(totalUnrealizedPL) >= 0 ? "+" : ""}
            {formatCurrency(totalUnrealizedPL, currency)}
          </span>
        </div>
        <div>
          <span className="text-[#94A3B8] block">Dividen / Bunga Diterima:</span>
          <span className="font-mono font-bold text-emerald-600">
            +{formatCurrency(totalRealizedIncome, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
