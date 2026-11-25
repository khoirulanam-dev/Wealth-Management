"use client";

import * as React from "react";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "./button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "warning";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Hapus",
  description = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
  confirmText = "Hapus",
  cancelText = "Batal",
  variant = "destructive",
  isLoading = false,
}: ConfirmDialogProps) {
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/[0.04] backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-[#E4E8EF] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 my-6"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#94A3B8] hover:bg-slate-100 hover:text-[#1E293B] transition-colors disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Badge Icon */}
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              variant === "destructive"
                ? "bg-rose-50 text-rose-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {variant === "destructive" ? (
              <Trash2 className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>

          {/* Texts */}
          <div className="space-y-1.5 flex-1 pr-4">
            <h3 className="text-base font-bold text-[#1E293B] leading-snug">
              {title}
            </h3>
            <div className="text-xs text-[#64748B] leading-relaxed">
              {description}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-[#F1F5F9]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl h-10 px-4 text-xs font-semibold border-[#E2E8F0] text-[#475569] hover:bg-slate-50 active:scale-[0.98] transition-all"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-xl h-10 px-4 text-xs font-semibold text-white active:scale-[0.98] transition-all ${
              variant === "destructive"
                ? "bg-rose-600 hover:bg-rose-700 shadow-xs shadow-rose-600/25"
                : "bg-amber-600 hover:bg-amber-700 shadow-xs shadow-amber-600/25"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Memproses...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

