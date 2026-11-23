"use client";

import { TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight, Wallet, Edit3 } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/decimal";
import { RecordTransactionDialog } from "./record-transaction-dialog";
import { ManualValuationDialog } from "./manual-valuation-dialog";

export interface HoldingItem {
  positionId: string;
  instrumentId: string;
  instrumentName: string;
  instrumentSymbol: string | null;
  assetType: string;
  unit: string;
  market: string | null;
  accountId: string;
  accountName: string;
  institution: string;
  quantity: string;
  averageCostPerUnit: string;
  totalCostBasis: string;
  currentPrice: string;
  marketValue: string;
  unrealizedPL: string;
  unrealizedPLPercentage: string;
  updatedAt: Date;
}

interface HoldingsTableProps {
  holdings: HoldingItem[];
  accounts: { id: string; name: string; institution: string }[];
  instruments: { id: string; name: string; symbol: string | null; assetType: string; unit: string }[];
}

export function HoldingsTable({ holdings, accounts, instruments }: HoldingsTableProps) {
  if (holdings.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E4E8EF] bg-white p-12 text-center shadow-card">
        <Wallet className="h-8 w-8 text-[#94A3B8] mx-auto mb-3" strokeWidth={1.5} />
        <h3 className="text-base font-bold text-[#1E293B]">Portofolio Investasi Masih Kosong</h3>
        <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1 mb-6 leading-relaxed">
          {accounts.length > 0
            ? `${accounts.length} akun finansial telah terdaftar (${accounts.map((a) => `${a.name} - ${a.institution}`).slice(0, 2).join(", ")}). Catat transaksi pembelian saham atau instrumen pertama Anda untuk mulai membentuk portofolio.`
            : "Mulai catat transaksi pembelian saham, unit reksa dana, atau emas fisik Anda untuk menghitung biaya rata-rata (weighted-average cost) dan nilai pasar portofolio secara otomatis."}
        </p>
        <div className="flex justify-center gap-3">
          <RecordTransactionDialog
            accounts={accounts}
            instruments={instruments}
            triggerButton={
              <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
                <ArrowDownRight className="h-4 w-4" />
                Catat Pembelian Pertama
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E4E8EF] bg-white shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E4E8EF] bg-[#F8FAFC] text-[#64748B] font-semibold uppercase tracking-wider text-xs">
              <th className="py-3.5 px-4">Instrumen & Simbol</th>
              <th className="py-3.5 px-4">Akun / Sekuritas</th>
              <th className="py-3.5 px-4 text-right">Kuantitas</th>
              <th className="py-3.5 px-4 text-right">Biaya Rata-rata</th>
              <th className="py-3.5 px-4 text-right">Harga Terakhir</th>
              <th className="py-3.5 px-4 text-right">Nilai Pasar</th>
              <th className="py-3.5 px-4 text-right">Unrealized P/L</th>
              <th className="py-3.5 px-4 text-center">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E8EF] text-[#1E293B]">
            {holdings.map((item) => {
              const qtyNum = parseFloat(item.quantity);
              const unplNum = parseFloat(item.unrealizedPL);
              const unplPct = parseFloat(item.unrealizedPLPercentage);
              const isProfit = unplNum >= 0;
              const isStock = item.assetType === "stock";
              const lots = isStock ? qtyNum / 100 : 0;

              return (
                <tr key={item.positionId} className="hover:bg-slate-50/80 transition-colors">
                  {/* Instrument & Symbol */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#F1F5F9] text-[#1E293B] font-semibold text-xs font-mono">
                        {item.instrumentSymbol?.substring(0, 4) || item.instrumentName.substring(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1E293B] font-mono text-sm">
                            {item.instrumentSymbol || item.instrumentName}
                          </span>
                          <span className="text-xs text-[#94A3B8]">
                            {item.assetType === "stock"
                              ? "Saham"
                              : item.assetType === "mutual_fund"
                              ? "Reksa Dana"
                              : item.assetType === "gold"
                              ? "Emas"
                              : item.assetType}
                          </span>
                        </div>
                        <span className="text-xs text-[#64748B] block truncate max-w-[200px]">
                          {item.instrumentName}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Account / Institution */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-[#1E293B] block">{item.accountName}</span>
                    <span className="text-xs text-[#64748B]">{item.institution}</span>
                  </td>

                  {/* Quantity */}
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span className="font-bold text-sm block">
                      {item.assetType === "mutual_fund"
                        ? formatNumber(qtyNum, 4)
                        : item.assetType === "gold"
                        ? formatNumber(qtyNum, 2)
                        : formatNumber(qtyNum)}
                    </span>
                    <span className="text-xs text-[#64748B]">
                      {isStock
                        ? `${formatNumber(lots)} lot (${formatNumber(qtyNum)} lbr)`
                        : item.assetType === "mutual_fund"
                        ? "Unit (UP)"
                        : item.assetType === "gold"
                        ? "gram"
                        : item.assetType === "bond"
                        ? "unit"
                        : item.unit}
                    </span>
                  </td>

                  {/* Average Cost */}
                  <td className="py-3.5 px-4 text-right font-mono text-sm text-[#475569]">
                    {formatCurrency(item.averageCostPerUnit)}
                  </td>

                  {/* Current Price */}
                  <td className="py-3.5 px-4 text-right font-mono text-sm font-semibold text-[#1E293B]">
                    {formatCurrency(item.currentPrice)}
                  </td>

                  {/* Market Value */}
                  <td className="py-3.5 px-4 text-right font-mono text-sm font-bold text-[#1E293B]">
                    {formatCurrency(item.marketValue)}
                  </td>

                  {/* Unrealized P/L */}
                  <td className="py-3.5 px-4 text-right font-mono">
                    <div className="flex flex-col items-end">
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-sm ${
                          isProfit ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {isProfit ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {isProfit ? "+" : ""}
                        {formatCurrency(item.unrealizedPL)}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          isProfit ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {isProfit ? "+" : ""}
                        {unplPct.toFixed(2)}%
                      </span>
                    </div>
                  </td>

                  {/* Action Menu */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <RecordTransactionDialog
                        accounts={accounts}
                        instruments={instruments}
                        defaultType="buy"
                        defaultAccountId={item.accountId}
                        defaultInstrumentId={item.instrumentId}
                        triggerButton={
                          <button
                            title="Beli Tambahan"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          >
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          </button>
                        }
                      />
                      <RecordTransactionDialog
                        accounts={accounts}
                        instruments={instruments}
                        defaultType="sell"
                        defaultAccountId={item.accountId}
                        defaultInstrumentId={item.instrumentId}
                        triggerButton={
                          <button
                            title="Jual / Realisasi P/L"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        }
                      />
                      <ManualValuationDialog
                        instrumentId={item.instrumentId}
                        instrumentName={item.instrumentName}
                        symbol={item.instrumentSymbol}
                        currentPrice={item.currentPrice}
                        triggerButton={
                          <button
                            title="Override Harga Manual"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-[#64748B] hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        }
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
