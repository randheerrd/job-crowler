import { X } from 'lucide-react';
import { useToastStore } from '../store/toastStore';
import { cn } from '../lib/utils';

export default function Toaster() {
  const { toasts, dismiss } = useToastStore();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="flex items-center gap-2.5 bg-gray-200 border border-gray-300 rounded px-3.5 py-2.5 pointer-events-auto min-w-[200px] max-w-xs animate-fadeIn">
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0',
            t.type === 'success' ? 'bg-emerald-400' : t.type === 'error' ? 'bg-red-400' : 'bg-primary-400'
          )} />
          <span className="flex-1 text-xs text-gray-900 font-medium">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="text-gray-500 hover:text-gray-700 shrink-0">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
