import { useToastStore } from '../store/toastStore';

export function useToast() {
    const show = useToastStore((s) => s.show);
    const hide = useToastStore((s) => s.hide);

    const success = (msg: string) => show(msg, 'success');
    const error = (msg: string) => show(msg, 'error');
    const info = (msg: string) => show(msg, 'info');

    return { success, error, info, hide };
}
