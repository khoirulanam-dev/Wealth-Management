"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * RealtimeSync provides seamless, instant synchronization across devices (e.g. mobile phone -> laptop)
 * and multi-tab sessions without requiring manual browser refresh.
 */
export function RealtimeSync() {
  const router = useRouter();
  const lastVersionRef = useRef<number | null>(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    // 1. Instant multi-tab synchronization on the same device via BroadcastChannel (< 1ms)
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel("wealth_os_sync");
        channel.onmessage = (event) => {
          if (event.data?.type === "DATA_CHANGED") {
            router.refresh();
          }
        };
      }
    } catch {
      // Ignore if not supported in environment
    }

    // 2. Cross-device synchronization via lightweight version heartbeat
    let intervalId: NodeJS.Timeout | null = null;

    async function checkVersion() {
      if (isRefreshingRef.current) return;
      try {
        const res = await fetch("/api/sync/version", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (!res.ok) return;
        const data = await res.json();
        const remoteVersion = Number(data.version);

        if (lastVersionRef.current === null) {
          lastVersionRef.current = remoteVersion;
          return;
        }

        // If data was mutated on another device (e.g. smartphone), refresh Server Components smoothly
        if (remoteVersion > lastVersionRef.current) {
          lastVersionRef.current = remoteVersion;
          isRefreshingRef.current = true;
          router.refresh();
          setTimeout(() => {
            isRefreshingRef.current = false;
          }, 1500);
        }
      } catch {
        // Silently tolerate transient offline/network transitions
      }
    }

    // Initial check on mount
    checkVersion();

    // Responsive polling interval: 3 seconds when active, 15 seconds when backgrounded
    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      const delay = document.visibilityState === "visible" ? 3000 : 15000;
      intervalId = setInterval(checkVersion, delay);
    };

    startPolling();

    // Immediate check on tab focus or visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkVersion();
      }
      startPolling();
    };

    const handleFocus = () => {
      checkVersion();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (channel) channel.close();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [router]);

  return null;
}
