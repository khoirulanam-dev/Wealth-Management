"use client";

import { useState, useRef } from "react";
import {
  Share2,
  Download,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useToast } from "@/presentation/components/ui/toast";
import { formatCurrency } from "@/lib/decimal";
import { cn } from "@/lib/utils";

export interface AllocationItem {
  name: string;
  assetType?: string;
  value: string | number;
  percentage: number;
  color?: string;
}

interface ShareAllocationDialogProps {
  data: AllocationItem[];
  totalAssets?: string | number;
  userName?: string;
  currency?: string;
  triggerButton?: React.ReactNode;
}

const DEFAULT_PALETTE = [
  "#2563EB", // Blue - Saham
  "#10B981", // Emerald - Reksa Dana
  "#8B5CF6", // Purple - Kas
  "#F59E0B", // Amber - Emas
  "#F97316", // Orange - Kripto
  "#6366F1", // Indigo - Obligasi
  "#06B6D4", // Cyan
  "#64748B", // Slate
];

export function ShareAllocationDialog({
  data,
  totalAssets,
  userName = "Investor",
  currency = "IDR",
  triggerButton,
}: ShareAllocationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNominals, setShowNominals] = useState(false); // Default: percentage only as requested
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const chartItems = (data || []).map((item, idx) => ({
    name: item.name,
    value: typeof item.value === "string" ? parseFloat(item.value) || 0 : Number(item.value) || 0,
    percentage: item.percentage || 0,
    color: item.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length],
  }));

  const calculatedTotal = chartItems.reduce((acc, cur) => acc + cur.value, 0);
  const finalTotalValue = totalAssets ? (typeof totalAssets === "string" ? parseFloat(totalAssets) : Number(totalAssets)) : calculatedTotal;

  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Pure SVG Donut calculations (circumference based with generous inner diameter)
  const radius = 76;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius; // ~477.52

  let accumulatedPercent = 0;
  const svgSlices = chartItems.map((item) => {
    const percentFraction = Math.max(0, item.percentage) / 100;
    const strokeDasharray = `${percentFraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percentFraction;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  async function handleDownloadPNG() {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2.5,
        cacheBust: true,
        style: {
          transform: "scale(1)",
        },
      });

      const cleanName = userName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const cleanDate = new Date().toISOString().split("T")[0];
      const link = document.createElement("a");
      link.download = `alokasi-aset-${cleanName}-${cleanDate}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Gambar alokasi portofolio berhasil disimpan!");
      setIsOpen(false);
    } catch (err) {
      console.error("Gagal merender gambar:", err);
      toast.error("Gagal membuat file gambar. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopyImage() {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(cardRef.current, {
        pixelRatio: 2.5,
        cacheBust: true,
      });

      if (!blob) throw new Error("Gagal membuat blob gambar");

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setIsCopied(true);
        toast.success("Gambar disalin ke clipboard! Siap di-paste ke chat/sosmed.");
        setTimeout(() => setIsCopied(false), 3000);
      } else {
        toast.info("Browser Anda tidak mendukung salin gambar langsung. Gunakan tombol 'Unduh PNG'.");
      }
    } catch (err) {
      console.error("Gagal menyalin gambar:", err);
      toast.error("Gagal menyalin gambar ke clipboard.");
    } finally {
      setIsGenerating(false);
    }
  }

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
          className="h-8 gap-1.5 border-[#E4E8EF] bg-white text-xs font-semibold text-[#1E293B] hover:bg-slate-50 shadow-2xs"
          title="Ekspor / Bagikan Alokasi Aset sebagai Gambar"
        >
          <Share2 className="h-3.5 w-3.5 text-blue-600" />
          <span>Bagikan</span>
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEF1F5] shrink-0 bg-[#F8FAFC]">
              <div>
                <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-blue-600" />
                  Bagikan Alokasi Portofolio
                </h3>
                <p className="text-xs text-[#64748B]">
                  Ekspor visual komposisi aset dengan opsi privasi nominal dan watermark anti-manipulasi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#1E293B] hover:bg-slate-200/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body: Controls & Live Preview */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Controls Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#F1F5F9]/80 border border-slate-200/80">
                {/* Nominal Toggle */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#1E293B] block">Tampilkan Nominal</span>
                    <span className="text-[10px] text-[#64748B] block">
                      {showNominals ? "Nominal Rupiah terlihat" : "Hanya persentase (%)"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNominals(!showNominals)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-2xs",
                      showNominals
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    {showNominals ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    <span>{showNominals ? "Aktif" : "Sembunyi"}</span>
                  </button>
                </div>

                {/* Theme Toggle */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#1E293B] block">Tema Gambar</span>
                    <span className="text-[10px] text-[#64748B] block">
                      {theme === "light" ? "Fintech White (Terang)" : "Obsidian Dark (Gelap)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all",
                        theme === "light" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-600"
                      )}
                    >
                      Terang
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all",
                        theme === "dark" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600"
                      )}
                    >
                      Gelap
                    </button>
                  </div>
                </div>
              </div>

              {/* LIVE EXPORT CANVAS (Rendered Target for html-to-image) */}
              <div className="flex justify-center">
                <div
                  ref={cardRef}
                  className={cn(
                    "relative w-full max-w-[420px] rounded-3xl p-6 border shadow-xl transition-all duration-200 overflow-hidden select-none",
                    theme === "light"
                      ? "bg-white border-slate-200 text-[#1E293B]"
                      : "bg-[#0F172A] border-slate-800 text-white"
                  )}
                >
                  {/* --- ANTI-TAMPER WATERMARK LAYER 1: DIAGONAL REPEATING MICRO-TEXT --- */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none opacity-[0.045] flex flex-wrap content-center justify-center rotate-[-22deg] scale-150 overflow-hidden select-none"
                  >
                    {Array.from({ length: 48 }).map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "m-1 text-[8px] font-mono font-black tracking-widest uppercase whitespace-nowrap",
                          theme === "light" ? "text-slate-900" : "text-white"
                        )}
                      >
                        • {userName.toUpperCase()} • PORTOFOLIO •
                      </span>
                    ))}
                  </div>

                  {/* Card Header (Clean & Minimalist: No W Logo, No Wealth OS Text) */}
                  <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800">
                    <div>
                      <h4
                        className={cn(
                          "text-base font-bold tracking-tight",
                          theme === "light" ? "text-[#1E293B]" : "text-white"
                        )}
                      >
                        Alokasi Portofolio
                      </h4>
                    </div>

                    {/* Minimalist Profile Pill (Clean green dot, No Shield icon) */}
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border shadow-2xs",
                        theme === "light"
                          ? "bg-slate-50 text-slate-700 border-slate-200"
                          : "bg-slate-800/90 text-slate-200 border-slate-700"
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-semibold truncate max-w-[150px]">{userName}</span>
                    </div>
                  </div>

                  {/* Pure Vector Donut Chart (Sharp & Instant Rendering with Wide Inner Hole) */}
                  <div className="relative z-10 my-6 flex items-center justify-center">
                    <div className="relative w-[200px] h-[200px] flex items-center justify-center">
                      <svg viewBox="0 0 200 200" className="w-full h-full block -rotate-90">
                        {svgSlices.map((slice, idx) => (
                          <circle
                            key={idx}
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="transparent"
                            stroke={slice.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={slice.strokeDasharray}
                            strokeDashoffset={slice.strokeDashoffset}
                            className="transition-all duration-300"
                          />
                        ))}
                      </svg>

                      {/* Center Content Overlay (Spacious padding so nominal never overlaps ring) */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-3">
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            theme === "light" ? "text-slate-400" : "text-slate-400"
                          )}
                        >
                          {showNominals ? "Total Aset" : "Komposisi Aset"}
                        </span>
                        <span
                          className={cn(
                            "font-extrabold font-mono tracking-tight my-0.5 whitespace-nowrap",
                            showNominals ? "text-[13px] leading-tight" : "text-base",
                            theme === "light" ? "text-[#1E293B]" : "text-white"
                          )}
                        >
                          {showNominals ? formatCurrency(finalTotalValue, currency) : "100%"}
                        </span>

                        {/* Center Micro-Watermark */}
                        <span className="text-[9px] font-medium text-slate-400/80 tracking-tight truncate max-w-[110px]">
                          @{userName.toLowerCase().replace(/\s+/g, "")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Allocation Legend List (Responsive grid with perfect vertical column alignment) */}
                  <div
                    className={cn(
                      "relative z-10 space-y-2.5 pt-3.5 border-t",
                      theme === "light" ? "border-slate-100" : "border-slate-800"
                    )}
                  >
                    {chartItems.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs"
                            style={{ backgroundColor: item.color }}
                          />
                          <span
                            className={cn(
                              "font-medium truncate text-xs",
                              theme === "light" ? "text-[#1E293B]" : "text-slate-200"
                            )}
                          >
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 font-mono shrink-0">
                          <span
                            className={cn(
                              "font-bold text-xs min-w-[42px] text-right",
                              theme === "light" ? "text-[#1E293B]" : "text-white"
                            )}
                          >
                            {item.percentage.toFixed(1)}%
                          </span>
                          {showNominals && (
                            <span
                              className={cn(
                                "text-xs font-semibold tabular-nums min-w-[96px] text-right",
                                theme === "light" ? "text-slate-600" : "text-slate-300"
                              )}
                            >
                              {formatCurrency(item.value, currency)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Security Footer */}
                  <div
                    className={cn(
                      "relative z-10 mt-5 pt-3 border-t flex items-center justify-between text-[11px] font-mono",
                      theme === "light"
                        ? "border-slate-100 text-slate-400"
                        : "border-slate-800 text-slate-500"
                    )}
                  >
                    <span className="truncate">{userName}</span>
                    <span>{todayFormatted}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer: Action Buttons */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#EEF1F5] flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-[#64748B] text-center sm:text-left">
                Watermark nama <strong className="text-[#1E293B] font-semibold">{userName}</strong> tertanam permanen pada pola visual.
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyImage}
                  disabled={isGenerating}
                  className="gap-1.5 h-9 text-xs border-slate-200 bg-white hover:bg-slate-50 text-[#1E293B]"
                >
                  {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{isCopied ? "Tersalin!" : "Salin Gambar"}</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleDownloadPNG}
                  disabled={isGenerating}
                  className="gap-1.5 h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Membuat PNG...
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      Unduh Gambar PNG
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
