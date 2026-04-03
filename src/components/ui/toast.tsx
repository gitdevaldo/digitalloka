'use client';

import { useState, useCallback, createContext, useContext } from 'react';

interface ToastState {
  message: string;
  visible: boolean;
}

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ message: '', visible: false });

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <div
          className="fixed bottom-6 right-6 z-[9999] bg-foreground text-white border-2 border-foreground rounded-[14px] px-[18px] py-3 font-body text-[0.82rem] font-semibold shadow-[4px_4px_0_rgba(0,0,0,0.3)] flex items-center gap-2 max-w-[300px] animate-pop-in"
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
