import { useMemo, useState } from 'react';
import { ToastContext } from '../context/ToastContext';
import { Toast } from '../components/ui';

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const value = useMemo(() => ({
    toasts,
    addToast: (toast) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, ...toast }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, toast.duration || 3500);
    },
    removeToast: (id) => setToasts((prev) => prev.filter((toast) => toast.id !== id)),
  }), [toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-50 grid gap-2 px-4 sm:px-0">
        {toasts.map((toast) => (
          <Toast key={toast.id} variant={toast.variant || 'info'}>
            {toast.message}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
