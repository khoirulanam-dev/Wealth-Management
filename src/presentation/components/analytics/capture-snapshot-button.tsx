"use client";

import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useToast } from "@/presentation/components/ui/toast";
import { captureSnapshotAction } from "@/app/actions/snapshot-actions";

export function CaptureSnapshotButton() {
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
      className="gap-2 h-9 border-[#E4E8EF] bg-white text-[#1E293B] hover:bg-[#F8FAFC]"
      title="Ambil snapshot posisi keuangan saat ini"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      ) : (
        <Camera className="h-4 w-4 text-blue-600" />
      )}
      <span>Ambil Snapshot</span>
    </Button>
  );
}
