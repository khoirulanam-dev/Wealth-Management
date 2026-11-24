"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useToast } from "@/presentation/components/ui/toast";
import { refreshWatchlistQuotesAction } from "@/app/actions/watchlist-actions";

export function RefreshWatchlistButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function handleRefresh() {
    setIsLoading(true);
    const result = await refreshWatchlistQuotesAction();
    if (result.success && "updatedCount" in result) {
      toast.success(
        result.updatedCount > 0
          ? `${result.updatedCount} harga instrumen pantauan berhasil diperbarui!`
          : "Kuotasi pantauan sudah mutakhir."
      );
    } else {
      toast.error(result.error || "Gagal memperbarui kuotasi pantauan");
    }
    setIsLoading(false);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isLoading}
      className="w-full sm:w-auto gap-1.5 sm:gap-2 h-10 sm:h-9.5 px-3 border border-black/[0.08] bg-white text-xs font-semibold sm:font-medium text-[#1C1C1E] hover:bg-black/[0.03] active:scale-[0.98] rounded-xl shadow-2xs transition-all justify-center whitespace-nowrap shrink-0"
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#007AFF] shrink-0" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5 text-[#007AFF] shrink-0" />
      )}
      <span className="truncate">Refresh Pantauan</span>
    </Button>
  );
}
