import { create } from 'zustand';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }
interface ToastStore {
  toasts: Toast[];
  toast: (message: string, type?: Toast['type']) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  toast: (message, type = 'success') => {
    const id = Date.now().toString();
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3500);
  },
  dismiss: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));
