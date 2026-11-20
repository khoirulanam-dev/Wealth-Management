"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useToast } from "@/presentation/components/ui/toast";
import { refreshMarketQuotesAction } from "@/app/actions/portfolio-actions";

export function RefreshQuotesButton({ className = "" }: { className?: string }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [lastSyncedTime, setLastSyncedTime] = useState<Date>(() => new Date());
  const { toast } = useToast();
  const isRefreshingRef = useRef(false);

  const doSync = useCallback(async (isManual = false) => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsRefreshing(true);

    try {
      const result = await refreshMarketQuotesAction();
      setLastSyncedTime(new Date());

      if (isManual) {
        if (result.success) {
          if (result.updatedCount && result.updatedCount > 0) {
            toast.success(
              `Harga ${result.updatedCount} instrumen berhasil diperbarui dari pasar!`,
              "Nilai pasar dan Unrealized PnL telah disinkronkan."
            );
          } else {
            toast.info(
              "Semua harga instrumen sudah menggunakan kuotasi terkini.",
              "Tidak ada kuotasi baru yang perlu diperbarui."
            );
          }
        } else {
          toast.error(result.error || "Gagal memperbarui harga pasar.");
        }
      }
    } catch {
      if (isManual) {
        toast.error("Terjadi kendala saat menghubungi API pasar.");
      }
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [toast]);

  // 1. Smart Auto-Poll every 30 seconds when tab is visible
  useEffect(() => {
    if (!autoSyncEnabled) return;

    const interval = setInterval(() => {
      // Only execute if tab is active and visible
      if (document.visibilityState === "visible") {
        doSync(false);
      }
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, [autoSyncEnabled, doSync]);

  // 2. Auto-refresh immediately when user switches back to this browser tab
  useEffect(() => {
    if (!autoSyncEnabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        doSync(false);
      }
    };

    const handleFocus = () => {
      doSync(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [autoSyncEnabled, doSync]);

  const formattedTime = lastSyncedTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Auto-Sync 30s Toggle Pill */}
      <button
        type="button"
        onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
        title={autoSyncEnabled ? "Auto-update tiap 30 detik aktif. Klik untuk jeda." : "Auto-update dijeda. Klik untuk mengaktifkan."}
        className={`flex items-center gap-1.5 h-9 px-2.5 rounded-lg border text-xs font-mono transition-all select-none ${
          autoSyncEnabled
            ? "border-emerald-200 bg-emerald-50/60 text-emerald-700 hover:bg-emerald-100/60"
            : "border-slate-200 bg-slate-50 text-[#64748B] hover:bg-slate-100"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            autoSyncEnabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
          }`}
        />
        <span className="hidden sm:inline font-semibold">
          {autoSyncEnabled ? "Auto 30s" : "Auto Paused"}
        </span>
      </button>

      {/* Manual Refresh Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => doSync(true)}
        disabled={isRefreshing}
        title={`Terakhir update: ${formattedTime}. Klik untuk refresh sekarang.`}
        className="gap-2 border-[#E4E8EF] text-[#1E293B] hover:bg-slate-50 font-medium h-9 text-xs"
      >
        <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${isRefreshing ? "animate-spin" : ""}`} />
        <span>{isRefreshing ? "Memperbarui..." : "Refresh Pasar"}</span>
      </Button>
    </div>
  );
}
