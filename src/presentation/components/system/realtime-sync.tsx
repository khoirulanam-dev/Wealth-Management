"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Global tracker for mutations made locally on THIS client session
let lastLocalMutationTimestamp = 0;

export function markLocalMutation() {
  lastLocalMutationTimestamp = Date.now();
  if (typeof window !== "undefined") {
    try {
      const channel = new BroadcastChannel("wealth_os_sync");
      channel.postMessage({ type: "LOCAL_MUTATION", timestamp: Date.now() });
      channel.close();
    } catch {
      // Ignore BroadcastChannel errors
    }
  }
}

/**
 * RealtimeSync provides instant synchronization across devices (e.g. mobile phone -> laptop)
 * and multi-tab sessions without requiring manual browser refresh.
 */
export function RealtimeSync() {
  const router = useRouter();
  const lastVersionRef = useRef<number | null>(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    // 1. Detect any form submissions or button clicks on this page to mark as local mutation
    const handleLocalSubmit = () => {
      lastLocalMutationTimestamp = Date.now();
    };
    const handleLocalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("button") || target?.closest("form")) {
        lastLocalMutationTimestamp = Date.now();
      }
    };
    window.addEventListener("submit", handleLocalSubmit, true);
    window.addEventListener("click", handleLocalClick, true);

    // 2. BroadcastChannel for instant multi-tab sync on this same machine
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel("wealth_os_sync");
        channel.onmessage = (event) => {
          if (event.data?.type === "LOCAL_MUTATION") {
            lastLocalMutationTimestamp = event.data.timestamp || Date.now();
            router.refresh();
          }
        };
      }
    } catch {
      // Ignore if not supported
    }

    // 3. Cross-device synchronization via lightweight version heartbeat
    let intervalId: NodeJS.Timeout | null = null;

    async function checkVersion() {
      if (isRefreshingRef.current) return;
      try {
        // Cache-busting parameter + no-cache headers guarantees fresh response from server
        const res = await fetch(`/api/sync/version?_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
          credentials: "include",
        });

        if (!res.ok) return;
        const data = await res.json();
        if (!data || typeof data.version !== "number") return;
        const remoteVersion = data.version;

        // Initialize on first successful heartbeat
        if (lastVersionRef.current === null) {
          lastVersionRef.current = remoteVersion;
          return;
        }

        // If data version increased (someone mutated data in the database):
        if (remoteVersion > lastVersionRef.current) {
          lastVersionRef.current = remoteVersion;

          // Check if this device triggered the mutation recently (< 4 seconds)
          const timeSinceLocal = Date.now() - lastLocalMutationTimestamp;
          const isLocal = timeSinceLocal < 4000;

          if (isLocal) {
            // Already handled by local Server Action response
            router.refresh();
          } else {
            // DATA WAS MODIFIED ON ANOTHER DEVICE (e.g. smartphone)!
            // Check if user is actively typing in an input on this device
            const isTyping = Boolean(
              document.activeElement &&
                (document.activeElement.tagName === "INPUT" ||
                  document.activeElement.tagName === "TEXTAREA" ||
                  document.activeElement.getAttribute("contenteditable") === "true")
            );

            if (!isTyping) {
              isRefreshingRef.current = true;
              // Instantly reload page so laptop gets 100% fresh Server Component state
              window.location.reload();
            } else {
              // Soft refresh so we don't clear the user's active typing
              router.refresh();
            }
          }
        }
      } catch {
        // Silently tolerate transient offline/network transitions
      }
    }

    // Initial check on mount
    checkVersion();

    // Responsive polling interval: 2 seconds when tab is active, 8 seconds when hidden
    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      const delay = document.visibilityState === "visible" ? 2000 : 8000;
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
      window.removeEventListener("submit", handleLocalSubmit, true);
      window.removeEventListener("click", handleLocalClick, true);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [router]);

  return null;
}
