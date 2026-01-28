"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, Loader2 } from "lucide-react";

type ToastType = "success" | "error" | "info" | "loading";

interface Toast {
  id: string;
  message: ReactNode;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: ReactNode, type: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: ReactNode, type: ToastType, duration = 7000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (type !== "loading" && duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} onClose={() => hideToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const ToastItem: React.FC<Toast & { onClose: () => void }> = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    loading: <Loader2 className="h-5 w-5 text-brand-500 animate-spin" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800",
    error: "bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800",
    info: "bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800",
    loading: "bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800",
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-300 ${bgColors[type]}`}>
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
        {message}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
