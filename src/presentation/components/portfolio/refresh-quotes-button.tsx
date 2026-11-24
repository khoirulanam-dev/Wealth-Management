"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useToast } from "@/presentation/components/ui/toast";
import { refreshMarketQuotesAction } from "@/app/actions/portfolio-actions";
import { cn } from "@/lib/utils";

export function RefreshQuotesButton({ className = "" }: { className?: string }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<Date>(() => new Date());
  const { toast } = useToast();
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const formattedTime = mounted
    ? lastSyncedTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => doSync(true)}
      disabled={isRefreshing}
      title={mounted ? `Terakhir update: ${formattedTime}. Klik untuk refresh sekarang.` : "Segarkan harga pasar terkini"}
      suppressHydrationWarning
      className={cn(
        "w-full sm:w-auto gap-1.5 sm:gap-2 border border-black/[0.08] bg-white text-[#1C1C1E] hover:bg-black/[0.03] active:scale-[0.98] font-semibold sm:font-medium h-10 sm:h-9.5 px-3 text-xs rounded-xl shadow-2xs transition-all justify-center whitespace-nowrap shrink-0",
        className
      )}
    >
      <RefreshCw className={cn("h-3.5 w-3.5 text-[#007AFF] shrink-0", isRefreshing && "animate-spin")} />
      <span className="truncate">{isRefreshing ? "Memperbarui..." : "Refresh Pasar"}</span>
    </Button>
  );
}
