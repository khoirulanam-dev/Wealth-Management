"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X, Share, PlusSquare } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => {
          console.warn("[PWA] Service worker registration failed:", err);
        });
    }

    // 2. Check if already installed / standalone
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return; // Already running as an installed PWA, do not show prompt
    }

    // 3. Check if user dismissed recently (cool-down of 7 days)
    const dismissedUntil = localStorage.getItem("wealth_os_pwa_dismissed_until");
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // 4. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
    const isSafari =
      /safari/.test(userAgent) &&
      !/chrome|crios|fxios|edgios|opr\//.test(userAgent);

    if (isAppleMobile && isSafari) {
      setIsIos(true);
      // Small delay on mobile before showing non-intrusive prompt
      const timer = setTimeout(() => setIsVisible(true), 2500);
      return () => clearTimeout(timer);
    }

    // 5. Android / Chromium BeforeInstallPrompt handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Small delay so user sees initial page first
      setTimeout(() => setIsVisible(true), 1800);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Don't show again for 7 days to respect user's flow
    const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("wealth_os_pwa_dismissed_until", sevenDaysFromNow.toString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative rounded-2xl border border-[#E4E8EF] bg-white/95 backdrop-blur-md p-4 shadow-[0_12px_36px_rgba(15,23,42,0.14)] space-y-3">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 rounded-lg p-1 text-[#94A3B8] hover:bg-slate-100 hover:text-[#1E293B] transition-colors"
          title="Tutup pemberitahuan"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content Header */}
        <div className="flex items-start gap-3 pr-6">
          <div className="relative h-11 w-11 shrink-0 rounded-xl overflow-hidden shadow-xs border border-blue-100">
            <Image
              src="/icons/icon-192.png"
              alt="Wealth OS Logo"
              width={44}
              height={44}
              className="object-cover"
            />
          </div>
          <div className="space-y-0.5 min-w-0">
            <h4 className="text-sm font-bold text-[#1E293B] leading-tight">
              Pasang Aplikasi Wealth OS
            </h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Buka lebih instan, layar penuh tanpa bilah peramban, dan hemat kuota di HP Anda.
            </p>
          </div>
        </div>

        {/* iOS Step-by-Step Mini Guide */}
        {showIosGuide && (
          <div className="rounded-xl bg-blue-50/80 border border-blue-200/60 p-3 text-xs text-blue-900 space-y-2 animate-in fade-in duration-200">
            <div className="font-semibold flex items-center gap-1.5 text-blue-700">
              <span>Langkah Pemasangan di iPhone / iPad:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-800">
              <li className="flex items-center gap-1.5">
                <span>1. Ketuk ikon Bagikan</span>
                <Share className="h-3.5 w-3.5 text-blue-600 inline" />
                <span>di menu browser Safari bawah.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>2. Gulir dan pilih</span>
                <span className="font-bold inline-flex items-center gap-0.5">
                  <PlusSquare className="h-3 w-3 inline text-blue-600" /> Tambah ke Layar Utama
                </span>
              </li>
            </ol>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-xs text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 h-8 px-3"
          >
            Nanti Saja
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleInstallClick}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 px-3.5 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isIos ? "Petunjuk Pasang" : "Install Sekarang"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
