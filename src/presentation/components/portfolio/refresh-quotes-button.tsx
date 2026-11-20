"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useToast } from "@/presentation/components/ui/toast";
import { refreshMarketQuotesAction } from "@/app/actions/portfolio-actions";

export function RefreshQuotesButton({ className = "" }: { className?: string }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const result = await refreshMarketQuotesAction();
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
    } catch {
      toast.error("Terjadi kendala saat menghubungi API pasar.");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      title="Perbarui harga pasar terkini via API gratisan"
      className={`gap-2 border-[#E4E8EF] text-[#1E293B] hover:bg-slate-50 font-medium ${className}`}
    >
      <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${isRefreshing ? "animate-spin" : ""}`} />
      <span>{isRefreshing ? "Memperbarui Harga..." : "Refresh Harga Pasar"}</span>
    </Button>
  );
}

