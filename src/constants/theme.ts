// theme.ts (ou onde estão seus temas)

import { ThemeMode } from "../store/themeStore";


export const lightTheme = {
    name: 'light',
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#111827',
    muted: '#6B7280',
    primary: '#013F65',
    border: '#E5E7EB',
    overlay: 'rgba(255, 255, 255, 0.97)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
};

export const darkTheme = {
    name: 'dark',
    background: '#0F172A',
    surface: '#1F2937',
    text: '#F8FAFC',
    muted: '#94A3B8',
    primary: '#013F65',
    border: '#1F2937',
    overlay: 'rgba(0,0,0,0.4)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
};

export const sunsetTheme = {
    name: 'sunset',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    muted: '#6B7280',
    // 🌅 Cor base do Protheus Sunset
    primary: '#87090D',
    border: '#FECACA',
    overlay: 'rgba(255, 255, 255, 0.97)',
    success: '#16A34A',
    error: '#DC2626',
    warning: '#F97316',
};

// helper
export const getTheme = (mode: ThemeMode) => {
    switch (mode) {
        case 'dark':
            return darkTheme;
        case 'sunset':
            return sunsetTheme;
        case 'light':
        default:
            return lightTheme;
    }
};
