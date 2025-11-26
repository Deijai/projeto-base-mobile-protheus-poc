// store/useThemeStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'sunset';

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
                // ciclo: light -> dark -> sunset -> light
                const next =
                    current === 'light'
                        ? 'dark'
                        : current === 'dark'
                            ? 'sunset'
                            : 'light';

                set({ theme: next });
            },
            setTheme: (mode) => set({ theme: mode }),
        }),
        {
            name: 'app-theme',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
