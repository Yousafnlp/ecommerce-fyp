"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";

const ToastContext = createContext(null);

const VARIANT_STYLES = {
  info: "border-border/70 bg-card text-card-foreground",
  success: "border-success/30 bg-success/10 text-success",
  error: "border-danger/30 bg-danger/10 text-danger",
};

const VARIANT_ICONS = {
  info: Info,
  success: CheckCircle2,
  error: XCircle,
};

const AUTO_DISMISS_MS = 3500;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, { variant = "info", duration = AUTO_DISMISS_MS } = {}) => {
      if (!message) return;
      const id = ++nextId.current;
      setToasts((current) => [...current.slice(-3), { id, message, variant }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      showToast,
      info: (message) => showToast(message, { variant: "info" }),
      success: (message) => showToast(message, { variant: "success" }),
      error: (message) => showToast(message, { variant: "error" }),
      dismiss,
    }),
    [showToast, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-16 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((toast) => {
          const Icon = VARIANT_ICONS[toast.variant] || Info;
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex items-center gap-2.5 rounded-lg border px-4 py-3 shadow-[var(--shadow-lift)] backdrop-blur-xl max-w-sm animate-in slide-in-from-top-2 fade-in ${VARIANT_STYLES[toast.variant] || VARIANT_STYLES.info}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <p className="text-sm font-medium leading-snug">{toast.message}</p>
              <button
                aria-label="Dismiss notification"
                onClick={() => dismiss(toast.id)}
                className="ml-2 opacity-60 hover:opacity-100 transition-opacity shrink-0"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // No-op fallback keeps consumers safe even if mounted without a provider.
    return {
      showToast: () => {},
      info: () => {},
      success: () => {},
      error: () => {},
      dismiss: () => {},
    };
  }
  return context;
}
