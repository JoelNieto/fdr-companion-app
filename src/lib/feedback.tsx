'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface FeedbackContextType {
  toasts: Toast[];
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  dismiss: (id: string) => void;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const showSuccess = useCallback((message: string) => addToast(message, 'success'), [addToast]);
  const showError = useCallback((message: string) => addToast(message, 'error'), [addToast]);
  const showInfo = useCallback((message: string) => addToast(message, 'info'), [addToast]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <FeedbackContext.Provider value={{ toasts, showSuccess, showError, showInfo, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </FeedbackContext.Provider>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 md:bottom-20 md:right-4"
      data-testid="toast-container"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  }[toast.type];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white min-w-[280px] max-w-md ${bgColor} animate-slide-in`}
      data-testid={`toast-${toast.type}`}
    >
      <span className="flex-1 text-sm">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-white/80 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}

export function showSuccess(message: string) {
  // This is a fallback for non-React contexts (e.g., server actions)
  // In practice, we'll use the context in components
  console.log('[SUCCESS]', message);
}

export function showError(message: string) {
  console.log('[ERROR]', message);
}