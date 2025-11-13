import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
    message: string;
    type: ToastType;
    visible: boolean;
    show: (message: string, type?: ToastType) => void;
    hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
    message: '',
    type: 'info',
    visible: false,
    show: (message, type = 'info') => {
        set({ message, type, visible: true });
        // fecha automaticamente depois de 3s
        setTimeout(() => set({ visible: false }), 3000);
    },
    hide: () => set({ visible: false }),
}));
