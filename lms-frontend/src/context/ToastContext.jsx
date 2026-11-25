import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

let nextToastId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title = '', message, duration = 4000 }) => {
      if (!message) return;
      const id = nextToastId++;
      setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
      }
    },
    []
  );

  const api = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      success: (message, title = 'Success') =>
        addToast({ type: 'success', title, message }),
      error: (message, title = 'Error') =>
        addToast({ type: 'error', title, message, duration: 5500 }),
      info: (message, title = 'Info') => addToast({ type: 'info', title, message }),
    }),
    [toasts, addToast, removeToast]
  );

  return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
