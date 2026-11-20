import { requireAuth } from "@/lib/auth";
import { db } from "@/infrastructure/db/client";
import { instruments, positions, valuations } from "@/infrastructure/db/schema";
import { eq, desc } from "drizzle-orm";
import { RefreshQuotesButton } from "@/presentation/components/portfolio/refresh-quotes-button";
import { MarketQuoteLookup } from "@/presentation/components/portfolio/market-quote-lookup";
import { MarketDataService } from "@/infrastructure/services/market-data-service";
import { formatCurrency } from "@/lib/decimal";
import { LineChart, Clock, ShieldCheck, Database, Search, Globe2, Radio } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MarketDataPage() {
  const session = await requireAuth();
  const providerInfo = MarketDataService.getActiveProviderInfo();

  const [rawInstruments, recentValuations] = await Promise.all([
    db
      .select({
        id: instruments.id,
        name: instruments.name,
        symbol: instruments.symbol,
        assetType: instruments.assetType,
        market: instruments.market,
        currency: instruments.currency,
        unit: instruments.unit,
        currentPrice: positions.currentPrice,
        quantity: positions.quantity,
        marketValue: positions.marketValue,
        unrealizedPL: positions.unrealizedPL,
        updatedAt: positions.updatedAt,
      })
      .from(instruments)
      .leftJoin(positions, eq(positions.instrumentId, instruments.id))
      .where(eq(instruments.userId, session.userId)),

    db
      .select({
        id: valuations.id,
        instrumentId: valuations.instrumentId,
        price: valuations.price,
        currency: valuations.currency,
        sourceName: valuations.sourceName,
        sourceType: valuations.sourceType,
        effectiveAt: valuations.effectiveAt,
        fetchedAt: valuations.fetchedAt,
      })
      .from(valuations)
      .where(eq(valuations.userId, session.userId))
      .orderBy(desc(valuations.fetchedAt))
      .limit(10),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E8EF]">
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-600 block mb-0.5">
            VALUASI & KUOTASI PASAR
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Pusat Data Pasar (Market Data)</h1>
          <p className="text-sm text-[#64748B]">
            Pembaruan harga instrumen otomatis harian via API gratisan dan sinkronisasi manual sesuai harga riil.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <RefreshQuotesButton />
        </div>
      </div>

      {/* Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="adm-card p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <h4 className="text-xs font-bold text-[#1E293B]">Live Provider</h4>
            </div>
            <p className="text-[11px] font-medium text-[#1E293B] mt-1 line-clamp-1" title={providerInfo.primaryProvider}>
              {providerInfo.primaryProvider}
            </p>
            <span className="text-[10px] text-[#94A3B8] block mt-0.5">Feed resmi Bursa Jakarta (JKT)</span>
          </div>
        </div>

        <div className="adm-card p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1E293B]">Auto-Update Harian</h4>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Harga pasar diperiksa &amp; diperbarui otomatis minimal 1x sehari setiap kali Anda membuka aplikasi.
            </p>
          </div>
        </div>

        <div className="adm-card p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <Globe2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1E293B]">Pihak Ke-3 Riil (Zero Mock)</h4>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Data harga bursa riil saham IDX, saham global US, dan emas fisik dunia.
            </p>
          </div>
        </div>

        <div className="adm-card p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1E293B]">Kalkulasi PnL Riil</h4>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Nilai Pasar &amp; Unrealized PnL di portofolio selalu mengikuti harga penutupan / pasar terakhir.
            </p>
          </div>
        </div>
      </div>

      {/* Live Search Section */}
      <div className="adm-card p-6">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[#EEF1F5]">
          <Search className="h-5 w-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Cari &amp; Jelajahi Saham Online</h2>
            <p className="text-xs text-[#94A3B8]">Cari kode emiten, perusahaan IDX, atau ETF secara langsung</p>
          </div>
        </div>
        <MarketQuoteLookup />
      </div>

      {/* Tracked Instruments Quotes Table */}
      <div className="adm-card overflow-hidden">
        <div className="p-5 border-b border-[#EEF1F5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-[#1E293B]">Kuotasi Harga Portofolio Anda</h3>
          </div>
          <span className="text-xs text-[#64748B] font-mono">
            {rawInstruments.length} Instrumen Terdaftar
          </span>
        </div>

        {rawInstruments.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748B]">
            Belum ada instrumen investasi yang terdaftar. Tambahkan instrumen di halaman Portofolio untuk memantau harga pasar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E4E8EF] bg-[#F8FAFC] text-[#64748B] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Ticker / Simbol</th>
                  <th className="py-3 px-4">Nama Instrumen</th>
                  <th className="py-3 px-4">Bursa</th>
                  <th className="py-3 px-4 text-right">Harga Terakhir</th>
                  <th className="py-3 px-4 text-right">Nilai Pasar Portofolio</th>
                  <th className="py-3 px-4 text-center">Terakhir Diperbarui</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E8EF] text-[#1E293B]">
                {rawInstruments.map((item) => {
                  const formattedDate = item.updatedAt
                    ? new Date(item.updatedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 text-sm">
                        {item.symbol || "-"}
                      </td>
                      <td className="py-3 px-4 font-medium">{item.name}</td>
                      <td className="py-3 px-4 font-mono text-[#64748B]">{item.market || "IDX"}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#1E293B]">
                        {item.currentPrice && parseFloat(item.currentPrice) > 0
                          ? formatCurrency(item.currentPrice)
                          : "Belum Ada Quote"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#475569]">
                        {item.marketValue ? formatCurrency(item.marketValue) : "Rp 0"}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-[#64748B]">
                        {formattedDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Immutable Valuations Audit Log */}
      {recentValuations.length > 0 && (
        <div className="adm-card overflow-hidden">
          <div className="p-4 border-b border-[#EEF1F5] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Log Audit Kuotasi Terakhir (Immutable Ledger)
            </h3>
            <span className="text-[11px] font-mono text-[#94A3B8]">10 Kuotasi Terbaru</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E4E8EF] bg-[#F8FAFC] text-[#64748B] font-semibold text-[10px] uppercase">
                  <th className="py-2.5 px-4">Waktu Penarikan</th>
                  <th className="py-2.5 px-4">ID Valuasi</th>
                  <th className="py-2.5 px-4">Sumber Data</th>
                  <th className="py-2.5 px-4 text-right">Harga Kuotasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E8EF] text-[#1E293B] font-mono text-[11px]">
                {recentValuations.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-4 text-[#64748B]">
                      {new Date(v.fetchedAt).toLocaleString("id-ID")}
                    </td>
                    <td className="py-2 px-4 text-[#94A3B8]">{v.id}</td>
                    <td className="py-2 px-4 text-[#475569]">{v.sourceName}</td>
                    <td className="py-2 px-4 text-right font-bold text-emerald-600">
                      {formatCurrency(v.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
