import React from 'react';
import { CheckCircle2, Heart, Bookmark, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'heart' | 'bookmark' | 'error';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'heart':
              return <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />;
            case 'bookmark':
              return <Bookmark className="w-4 h-4 text-purple-600 fill-purple-600 shrink-0" />;
            case 'error':
              return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />;
            default:
              return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
          }
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900/90 text-white backdrop-blur-md px-4 py-3 rounded-xl shadow-xl border border-slate-700/50 flex items-center justify-between gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <div className="flex items-center gap-2.5">
              {getIcon()}
              <span className="font-medium text-slate-100">{toast.text}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-600 hover:text-white p-1 rounded transition-colors dark:text-slate-300"
              aria-label="닫기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
