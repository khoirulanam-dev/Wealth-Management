"use client";

import { useState, useRef } from "react";
import {
  Share2,
  Download,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  TrendingUp,
  PieChart,
  X,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useToast } from "@/presentation/components/ui/toast";
import { formatCurrency } from "@/lib/decimal";

export interface AllocationItem {
  category?: string;
  name?: string;
  value: string | number;
  percentage: number;
  color?: string;
}

interface SharePortfolioDialogProps {
  triggerButton?: React.ReactNode;
  netWorth: string | number;
  totalInvestments: string | number;
  totalCash: string | number;
  totalLiabilities: string | number;
  overallReturnPercent?: number;
  allocations: AllocationItem[];
  userName?: string;
  currency?: string;
  asOfDate?: string;
}

type AspectRatioPreset = "square" | "story" | "landscape";

export function SharePortfolioDialog({
  triggerButton,
  netWorth,
  totalInvestments,
  totalCash,
  totalLiabilities,
  overallReturnPercent = 0,
  allocations = [],
  userName = "Investor",
  currency = "IDR",
  asOfDate,
}: SharePortfolioDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preset, setPreset] = useState<AspectRatioPreset>("square");
  const [hideNominals, setHideNominals] = useState(true);
  const [showBranding, setShowBranding] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const formattedDate =
    asOfDate ||
    new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // Masking helper
  const maskValue = (val: string | number) => {
    if (hideNominals) {
      return "Rp •••••••";
    }
    return formatCurrency(val, currency);
  };

  async function handleDownloadImage() {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      // Dynamic import to trim initial bundle size and load only on demand
      const { toPng } = await import("html-to-image");

      // 100% Client-side render with retina resolution (pixelRatio: 2)
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        style: {
          transform: "scale(1)",
        },
      });

      const link = document.createElement("a");
      const cleanDate = new Date().toISOString().split("T")[0];
      link.download = `wealth-os-portfolio-${preset}-${cleanDate}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Gambar portofolio berhasil disimpan ke perangkat!");
    } catch (err) {
      console.error("Export PNG error:", err);
      toast.error("Gagal merender gambar. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Pre-configured category colors
  const categoryColors: Record<string, string> = {
    saham: "#2563EB", // Blue
    reksadana: "#10B981", // Emerald
    emas: "#F59E0B", // Amber
    kripto: "#8B5CF6", // Purple
    kas: "#06B6D4", // Cyan
    lainnya: "#64748B", // Slate
  };

  const getCategoryColor = (cat: string) => {
    const key = cat.toLowerCase().replace(/\s+/g, "");
    return categoryColors[key] || "#3B82F6";
  };

  // Dimensions for preview/render container
  const getContainerStyles = () => {
    switch (preset) {
      case "square":
        return "w-[440px] min-h-[440px]";
      case "story":
        return "w-[380px] min-h-[580px]";
      case "landscape":
        return "w-[560px] min-h-[350px]";
    }
  };

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)}>{triggerButton}</div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto h-10 sm:h-9.5 gap-1.5 sm:gap-2 px-3 border border-black/[0.08] bg-white text-xs font-semibold sm:font-medium text-[#1C1C1E] hover:bg-black/[0.03] active:scale-[0.98] rounded-xl shadow-2xs transition-all justify-center whitespace-nowrap shrink-0"
        >
          <Share2 className="h-3.5 w-3.5 text-[#007AFF] shrink-0" />
          <span className="truncate">Bagikan Portofolio</span>
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/25 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-[24px] border border-black/[0.08] shadow-2xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Generator Visual Portofolio
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ekspor visual resolusi tinggi untuk media sosial dengan opsi privasi 100% di browser.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Controls & Live Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Settings & Controls (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* 1. Format / Aspect Ratio */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Format Rasio Aspek
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPreset("square")}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                        preset === "square"
                          ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs ring-1 ring-blue-500/20"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <div className="h-6 w-6 border-2 border-current rounded-sm mb-1.5" />
                      <span>1:1 Persegi</span>
                      <span className="text-[10px] text-slate-400 font-normal">Feed Post</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreset("story")}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                        preset === "story"
                          ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs ring-1 ring-blue-500/20"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <div className="h-6 w-3.5 border-2 border-current rounded-sm mb-1.5" />
                      <span>9:16 Cerita</span>
                      <span className="text-[10px] text-slate-400 font-normal">Story/Status</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreset("landscape")}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                        preset === "landscape"
                          ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs ring-1 ring-blue-500/20"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <div className="h-4 w-7 border-2 border-current rounded-sm mb-1.5" />
                      <span>16:9 Lebar</span>
                      <span className="text-[10px] text-slate-400 font-normal">Presentasi</span>
                    </button>
                  </div>
                </div>

                {/* 2. Privacy & Branding Toggles */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Opsi Privasi & Tampilan
                  </label>

                  {/* Privacy Toggle */}
                  <div
                    onClick={() => setHideNominals(!hideNominals)}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 cursor-pointer select-none transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          hideNominals ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {hideNominals ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          Sembunyikan Nominal (Persentase Saja)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {hideNominals
                            ? "Nominal rupiah disamarkan menjadi Rp •••••••"
                            : "Menampilkan nominal angka sebenarnya"}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        hideNominals
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {hideNominals && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Branding Toggle */}
                  <div
                    onClick={() => setShowBranding(!showBranding)}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 cursor-pointer select-none transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          showBranding ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          Branding WEALTH OS
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Tampilkan lencana sistem di pojok visual
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        showBranding
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {showBranding && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>

                {/* Privacy Guarantee Note */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-800">
                  <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>100% Pemrosesan Lokal:</strong> Gambar di-render sepenuhnya di peramban Anda.
                    Tidak ada data keuangan atau visual yang dikirim ke server pihak ketiga manapun.
                  </p>
                </div>

                {/* Download Button */}
                <Button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={isGenerating}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-2 rounded-xl shadow-md shadow-blue-600/20 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Merender Resolusi Tinggi...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Unduh Gambar PNG ({preset.toUpperCase()})</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Right Column: Live Interactive Card Canvas (7 cols) */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-900/5 rounded-2xl p-4 sm:p-6 border border-slate-200/60 overflow-hidden">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Pratinjau Visual (Siap Ekspor)
                </div>

                {/* The Shareable Card to Capture */}
                <div
                  ref={cardRef}
                  className={`bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white rounded-3xl p-6 sm:p-7 shadow-2xl relative flex flex-col justify-between overflow-hidden border border-slate-700/60 ${getContainerStyles()}`}
                  style={{
                    boxSizing: "border-box",
                  }}
                >
                  {/* Subtle Background Glows */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Top Bar: User & Date */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-500/30">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-100 tracking-wide">
                          Portofolio {userName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Per {formattedDate}
                        </div>
                      </div>
                    </div>

                    {showBranding && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[10px] font-bold tracking-wider text-blue-400">
                        <Shield className="h-3 w-3 text-blue-400" />
                        <span>WEALTH OS</span>
                      </div>
                    )}
                  </div>

                  {/* Center Main Metric: Net Worth & Performance */}
                  <div className="my-5 space-y-2 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Kekayaan Bersih Terkonsolidasi
                      </span>
                      {overallReturnPercent !== 0 && (
                        <div
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            overallReturnPercent >= 0
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          <TrendingUp className="h-3 w-3" />
                          <span>
                            {overallReturnPercent >= 0 ? "+" : ""}
                            {overallReturnPercent.toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white drop-shadow-sm">
                      {maskValue(netWorth)}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                        <span className="text-[9px] text-slate-400 block mb-0.5 truncate">
                          Investasi
                        </span>
                        <span className="font-mono font-bold text-slate-200 text-[11px] block truncate">
                          {maskValue(totalInvestments)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                        <span className="text-[9px] text-slate-400 block mb-0.5 truncate">
                          Kas Likuid
                        </span>
                        <span className="font-mono font-bold text-slate-200 text-[11px] block truncate">
                          {maskValue(totalCash)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                        <span className="text-[9px] text-slate-400 block mb-0.5 truncate">
                          Liabilitas
                        </span>
                        <span className="font-mono font-bold text-slate-200 text-[11px] block truncate">
                          {maskValue(totalLiabilities)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Asset Allocation Breakdown */}
                  <div className="space-y-2.5 relative z-10 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <PieChart className="h-3.5 w-3.5 text-blue-400" />
                        Alokasi Aset
                      </span>
                      <span>100% Terverifikasi</span>
                    </div>

                    {/* Stacked Progress Bar */}
                    <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                      {allocations.length > 0 ? (
                        allocations.map((item, idx) => {
                          const catName = item.category || item.name || "Aset";
                          return (
                            <div
                              key={idx}
                              style={{
                                width: `${Math.max(item.percentage, 2)}%`,
                                backgroundColor: item.color || getCategoryColor(catName),
                              }}
                              className="h-full transition-all"
                              title={`${catName}: ${item.percentage.toFixed(1)}%`}
                            />
                          );
                        })
                      ) : (
                        <div className="h-full w-full bg-blue-600" />
                      )}
                    </div>

                    {/* Badges / Legend */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {allocations.slice(0, 4).map((item, idx) => {
                        const catName = item.category || item.name || "Aset";
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[10px]"
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: item.color || getCategoryColor(catName),
                              }}
                            />
                            <span className="text-slate-300 font-medium">{catName}</span>
                            <span className="font-mono font-bold text-slate-100">
                              {item.percentage.toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer Watermark */}
                  {showBranding && (
                    <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 relative z-10">
                      <span>Private Wealth Management OS</span>
                      <span className="font-mono text-slate-400">IDR Native · Zero Cloud Leak</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
