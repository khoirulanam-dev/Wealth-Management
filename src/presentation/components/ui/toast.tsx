"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export type ToastFunction = ((options: { type?: ToastType; title: string; message?: string }) => void) & {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
};

interface ToastContextType {
  toast: ToastFunction;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = "info", title, message }: { type?: ToastType; title: string; message?: string }) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => addToast({ type: "success", title, message }), [addToast]);
  const error = useCallback((title: string, message?: string) => addToast({ type: "error", title, message }), [addToast]);
  const info = useCallback((title: string, message?: string) => addToast({ type: "info", title, message }), [addToast]);

  const toastFn = Object.assign(
    (options: { type?: ToastType; title: string; message?: string }) => addToast(options),
    {
      success,
      error,
      info,
    }
  ) as ToastFunction;

  return (
    <ToastContext.Provider value={{ toast: toastFn, success, error, info }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 ${
              t.type === "success"
                ? "bg-white border-emerald-200 text-[#1E293B]"
                : t.type === "error"
                ? "bg-white border-red-200 text-[#1E293B]"
                : "bg-white border-blue-200 text-[#1E293B]"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              {t.type === "error" && <AlertCircle className="h-5 w-5 text-red-600" />}
              {t.type === "info" && <Info className="h-5 w-5 text-blue-600" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[#1E293B] leading-tight">{t.title}</h4>
              {t.message && (
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{t.message}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 rounded p-1 text-[#94A3B8] hover:text-[#1E293B] hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
