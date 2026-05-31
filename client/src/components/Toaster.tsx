import { X } from 'lucide-react';
import { useToastStore } from '../store/toastStore';
import { cn } from '../lib/utils';

export default function Toaster() {
  const { toasts, dismiss } = useToastStore();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="flex items-center gap-3 border shadow-glow rounded-full px-4 py-2.5 pointer-events-auto min-w-[220px] max-w-sm bg-gray-200 border-gray-300"
          style={{ animation: 'slideUp 0.25s ease' }}
        >
          <span className={cn(
            'w-2 h-2 rounded-full shrink-0',
            t.type === 'success' && 'bg-emerald-400',
            t.type === 'error'   && 'bg-red-400',
            t.type === 'info'    && 'bg-primary-400',
          )} />
          <span className="flex-1 text-sm text-gray-900 font-medium">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="text-gray-500 hover:text-gray-900 transition-colors shrink-0">
            <X size={14} />
          </button>
        </div>
      ))}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
