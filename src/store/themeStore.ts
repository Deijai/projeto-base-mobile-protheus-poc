import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark';

type ThemeState = {
    theme: ThemeMode;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
};

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: 'light',
            toggleTheme: () => {
                const current = get().theme;
                set({ theme: current === 'light' ? 'dark' : 'light' });
            },
            setTheme: (mode) => set({ theme: mode }),
        }),
        {
            name: 'app-theme',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);