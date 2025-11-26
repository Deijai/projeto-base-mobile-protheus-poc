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

// helper
export const getTheme = (mode: 'light' | 'dark') =>
    mode === 'light' ? lightTheme : darkTheme;
