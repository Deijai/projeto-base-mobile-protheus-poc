// src/store/moduleStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ModuleItem, moduleService } from '../api/moduleService';

type ModuleState = {
    modules: ModuleItem[];
    selectedModule: ModuleItem | null;
    loading: boolean;
    fetchModules: () => Promise<void>;
    selectModule: (module: ModuleItem) => void;
    clear: () => void;
};

export const useModuleStore = create<ModuleState>()(
    persist(
        (set) => ({
            modules: [],
            selectedModule: null,
            loading: false,

            async fetchModules() {
                try {
                    set({ loading: true });
                    const modules = await moduleService.getModules();
                    set({ modules });
                } finally {
                    set({ loading: false });
                }
            },

            selectModule(module) {
                set({ selectedModule: module });
            },

            clear() {
                set({ modules: [], selectedModule: null });
            },
        }),
        {
            name: 'module-storage',
            storage: {
                getItem: async (name) => {
                    const value = await AsyncStorage.getItem(name);
                    return value ? JSON.parse(value) : null;
                },
                setItem: async (name, value) => {
                    await AsyncStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: async (name) => {
                    await AsyncStorage.removeItem(name);
                },
            },
        }
    )
);
