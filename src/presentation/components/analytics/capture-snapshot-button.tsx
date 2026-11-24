"use client";

import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useToast } from "@/presentation/components/ui/toast";
import { captureSnapshotAction } from "@/app/actions/snapshot-actions";
import { cn } from "@/lib/utils";

interface CaptureSnapshotButtonProps {
  className?: string;
}

export function CaptureSnapshotButton({ className }: CaptureSnapshotButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function handleCapture() {
    setIsLoading(true);
    const res = await captureSnapshotAction();
    if (res.success) {
      toast.success("Snapshot harian berhasil disimpan");
    } else {
      toast.error(res.error || "Gagal menyimpan snapshot");
    }
    setIsLoading(false);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCapture}
      disabled={isLoading}
      className={cn(
        "w-full sm:w-auto gap-1.5 sm:gap-2 h-10 sm:h-9.5 px-3 border border-black/[0.08] bg-white text-xs font-semibold sm:font-medium text-[#1C1C1E] hover:bg-black/[0.03] active:scale-[0.98] rounded-xl shadow-2xs transition-all justify-center whitespace-nowrap shrink-0",
        className
      )}
      title="Ambil snapshot posisi keuangan saat ini"
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#007AFF] shrink-0" />
      ) : (
        <Camera className="h-3.5 w-3.5 text-[#007AFF] shrink-0" />
      )}
      <span className="truncate">Ambil Snapshot</span>
    </Button>
  );
}
