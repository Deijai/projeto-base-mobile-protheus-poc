// src/store/connectionStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RestConfig, restValidator } from '../api/restValidatorService';

type ConnectionState = {
    config: RestConfig | null;
    isValid: boolean;
    isTesting: boolean;
    error: string | null;
    hydrated: boolean;
    testConnection: (config: RestConfig) => Promise<{ success: boolean; error?: string }>;
    saveConfig: (config: RestConfig) => void;
    testAndSave: (config: RestConfig) => Promise<{ success: boolean; error?: string }>;
    getBaseUrl: () => string | null;
    clear: () => void;
};

export const useConnectionStore = create<ConnectionState>()(
    persist(
        (set, get) => ({
            config: null,
            isValid: false,
            isTesting: false,
            error: null,
            hydrated: false,

            async testConnection(config) {
                set({ isTesting: true, error: null });
                const result = await restValidator.testConnectionWithFallback(config);

                if (result.success) {
                    set({
                        isTesting: false,
                        isValid: true,
                        error: null,
                    });
                    return { success: true };
                } else {
                    set({
                        isTesting: false,
                        isValid: false,
                        error: result.error || 'Falha ao testar REST',
                    });
                    return { success: false, error: result.error, isValid: false };
                }
            },

            saveConfig(config) {
                // salva e marca como válido
                set({ config, isValid: true });
            },

            async testAndSave(config) {
                const r = await get().testConnection(config);
                if (r.success) {
                    get().saveConfig(config);
                }
                return r;
            },

            getBaseUrl() {
                const cfg = get().config;
                if (!cfg) return null;
                const portPart = cfg.port?.trim() ? `:${cfg.port.trim()}` : '';
                const endpointClean = cfg.endpoint?.replace(/^\//, '') || 'rest';
                return `${cfg.protocol.toLowerCase()}://${cfg.address.trim()}${portPart}/${endpointClean}`;
            },

            clear() {
                set({ config: null, isValid: false, error: null });
            },
        }),
        {
            name: 'connection-storage',
            storage: {
                // 👇 AGORA SIM: usando AsyncStorage do RN
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
            // quando terminar de reidratar, marcamos que tá ok
            onRehydrateStorage: () => {
                return () => {
                    // isso roda DEPOIS de ler do AsyncStorage
                    useConnectionStore.setState({ hydrated: true, isTesting: false });
                };
            },
        }
    )
);
