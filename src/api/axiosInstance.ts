// src/api/axiosInstance.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosHeaders } from 'axios';
import { useAuthStore } from '../store/authStore';
import { useConnectionStore } from '../store/connectionStore';

export const api = axios.create();

// helper pra pegar o selectedBranch do storage do zustand
async function getSelectedBranchFromStorage() {
    try {
        const raw = await AsyncStorage.getItem('branch-storage');
        console.log('raw:', raw);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        // o zustand-persist salva em parsed.state
        return parsed?.state?.selectedBranch ?? null;
    } catch (e) {
        return null;
    }
}

api.interceptors.request.use(
    async (config) => {
        const baseUrl = useConnectionStore.getState().getBaseUrl?.();
        const token = useAuthStore.getState().user?.token;

        if (baseUrl) {
            config.baseURL = baseUrl;
        }

        // headers base
        const headers = AxiosHeaders.from({
            ...(config.headers || {}),
        });

        // token
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        // 🔥 pega a filial selecionada do AsyncStorage (persist do zustand)
        const selectedBranch = await getSelectedBranchFromStorage();

        if (selectedBranch) {
            // aqui adapta pros nomes reais do seu DTO
            const companyCode = selectedBranch.EnterpriseGroup?.trim();
            const code = selectedBranch.Code?.trim();

            if (companyCode && code) {
                // monta exatamente como você falou
                const tenantId = `${companyCode}, ${code}`.trim();

                console.log('Adicionando tenantId nos headers:', tenantId);

                // se quiser tirar espaços:
                // const tenantId = `${companyCode}, ${code}`.trim();

                //headers.set('tenantId', tenantId);
            }
        }

        config.headers = headers;

        console.log('Config final:', config);

        return config;
    },
    (error) => Promise.reject(error)
);
