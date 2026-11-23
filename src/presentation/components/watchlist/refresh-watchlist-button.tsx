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
      className="gap-2 h-9 border-[#E4E8EF] bg-white text-[#1E293B] hover:bg-[#F8FAFC] shadow-sm text-xs font-semibold"
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
      )}
      Refresh Pantauan
    </Button>
  );
}
