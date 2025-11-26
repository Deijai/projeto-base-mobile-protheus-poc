// src/hooks/useTheme.ts
import { getTheme } from '@/src/constants/theme';
import { useThemeStore } from '@/src/store/themeStore';

export function useTheme() {
    const themeMode = useThemeStore((s) => s.theme);
    const toggleTheme = useThemeStore((s) => s.toggleTheme);
    const setTheme = useThemeStore((s) => s.setTheme);

    const theme = getTheme(themeMode);

    const isDark = themeMode === 'dark';
    const isSunset = themeMode === 'sunset';
    const isLight = themeMode === 'light';

    return {
        themeMode,
        theme,
        isDark,
        isLight,
        isSunset,
        toggleTheme,
        setTheme
    };
}
