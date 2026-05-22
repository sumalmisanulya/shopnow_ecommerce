"use client";

import { useToastStore } from "@/store/useToastStore";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 sm:px-0 sm:w-96">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start justify-between p-4 rounded-xl shadow-xl border backdrop-blur-lg transition-all duration-300 animate-slide-in ${
            toast.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/20 text-emerald-200"
              : toast.type === "error"
              ? "bg-rose-950/80 border-rose-500/20 text-rose-200"
              : "bg-zinc-900/80 border-zinc-700/20 text-zinc-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0">
              {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === "info" && <Info className="w-5 h-5 text-sky-400" />}
            </span>
            <p className="text-sm font-medium leading-5">{toast.message}</p>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-0.5 shrink-0 ml-3"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
