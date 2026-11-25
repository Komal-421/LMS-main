import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const STYLES = {
  success: {
    container: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
  },
  error: {
    container: 'border-rose-200 bg-rose-50 text-rose-900',
    icon: XCircle,
    iconColor: 'text-rose-600',
  },
  info: {
    container: 'border-sky-200 bg-sky-50 text-sky-900',
    icon: Info,
    iconColor: 'text-sky-600',
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => {
        const style = STYLES[toast.type] || STYLES.info;
        const Icon = style.icon;
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-xl border p-3.5 shadow-lg ${style.container}`}
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconColor}`} />
            <div className="min-w-0 flex-1 text-sm">
              {toast.title && <p className="font-semibold">{toast.title}</p>}
              <p className="text-xs opacity-90">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="rounded p-0.5 opacity-60 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
