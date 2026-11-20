"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Ban, CheckCircle2, Loader2 } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/decimal";
import { voidTransactionAction } from "@/app/actions/portfolio-actions";

export interface TransactionItem {
  id: string;
  tradeDate: Date;
  type: string;
  status: string;
  quantity: string;
  unitPrice: string;
  grossAmount: string;
  currency: string;
  note: string | null;
  createdAt: Date;
  instrumentId: string;
  instrumentName: string;
  instrumentSymbol: string | null;
  assetType: string;
  unit: string;
  accountId: string;
  accountName: string;
  institution: string;
}

interface TransactionsTableProps {
  transactions: TransactionItem[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [voidingId, setVoidingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleVoid(id: string) {
    setVoidingId(id);
    await voidTransactionAction(id);
    setVoidingId(null);
    setConfirmId(null);
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E4E8EF] bg-white p-12 text-center shadow-card">
        <h3 className="text-base font-bold text-[#1E293B]">Belum Ada Riwayat Transaksi</h3>
        <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 leading-relaxed">
          Semua transaksi beli, jual, langganan reksa dana, dan penebusan yang Anda catat akan tercatat secara permanen di buku besar (ledger) ini.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E4E8EF] bg-white shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E4E8EF] bg-[#F8FAFC] text-[#64748B] font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Tanggal</th>
              <th className="py-3.5 px-4">Tipe Transaksi</th>
              <th className="py-3.5 px-4">Instrumen & Simbol</th>
              <th className="py-3.5 px-4">Akun / Sekuritas</th>
              <th className="py-3.5 px-4 text-right">Kuantitas</th>
              <th className="py-3.5 px-4 text-right">Harga Satuan</th>
              <th className="py-3.5 px-4 text-right">Nilai Kotor</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E8EF] text-[#1E293B]">
            {transactions.map((tx) => {
              const isBuy = ["buy", "subscription", "deposit_open", "bond_buy"].includes(tx.type.toLowerCase());
              const isVoided = tx.status === "voided";
              const formattedDate = new Date(tx.tradeDate).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <tr
                  key={tx.id}
                  className={`transition-colors ${
                    isVoided ? "bg-slate-50/60 opacity-60" : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* Date */}
                  <td className="py-3.5 px-4 font-mono text-[#64748B] whitespace-nowrap">
                    {formattedDate}
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isBuy
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {isBuy ? (
                        <ArrowDownRight className="h-3 w-3" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3" />
                      )}
                      {tx.type}
                    </span>
                  </td>

                  {/* Instrument */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1E293B] font-mono text-sm">
                        {tx.instrumentSymbol || tx.instrumentName}
                      </span>
                      <span className="text-[11px] text-[#64748B] truncate max-w-[150px]">
                        {tx.instrumentName}
                      </span>
                    </div>
                  </td>

                  {/* Account */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-[#1E293B] block">{tx.accountName}</span>
                    <span className="text-[10px] text-[#64748B]">{tx.institution}</span>
                  </td>

                  {/* Quantity */}
                  <td className="py-3.5 px-4 text-right font-mono font-medium">
                    {formatNumber(parseFloat(tx.quantity))} {tx.unit}
                  </td>

                  {/* Unit Price */}
                  <td className="py-3.5 px-4 text-right font-mono text-[#64748B]">
                    {formatCurrency(tx.unitPrice)}
                  </td>

                  {/* Gross Amount */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#1E293B]">
                    {formatCurrency(tx.grossAmount)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    {isVoided ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        <Ban className="h-3 w-3" />
                        Dibatalkan (Void)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Posted
                      </span>
                    )}
                  </td>

                  {/* Void Action */}
                  <td className="py-3.5 px-4 text-center">
                    {!isVoided && (
                      confirmId === tx.id ? (
                        <div className="flex items-center justify-center gap-1.5 animate-in fade-in duration-100">
                          <button
                            disabled={voidingId === tx.id}
                            onClick={() => handleVoid(tx.id)}
                            className="rounded bg-red-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-700"
                          >
                            {voidingId === tx.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Ya, Void"
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="rounded bg-slate-200 px-2 py-1 text-[10px] text-slate-700 hover:bg-slate-300"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(tx.id)}
                          title="Batalkan Transaksi (Void)"
                          className="rounded p-1 text-[#94A3B8] hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </button>
                      )
                    )}
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
