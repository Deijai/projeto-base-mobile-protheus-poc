// src/store/authStore.ts - CORRIGIDO
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../api/authService';

export interface User {
  username: string;
  name: string;
  email?: string;
  token: string;
  refreshToken?: string;
}

type EnableResultReason =
  | 'success'
  | 'no-refresh'
  | 'no-hardware'
  | 'not-enrolled'
  | 'unknown';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hydrated: boolean;
  error: string | null;
  biometricEnabled: boolean;
  biometricType?: string;
  login: (username: string, password: string) => Promise<boolean>;
  biometricLogin: () => Promise<boolean>;
  tryAutoBiometricLogin: () => Promise<boolean>;
  enableBiometric: () => Promise<{ ok: boolean; reason: EnableResultReason }>;
  disableBiometric: () => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hydrated: false,
      error: null,
      biometricEnabled: false,
      biometricType: undefined,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      async login(username, password) {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.login(username, password);

          const user: User = {
            username,
            name: response.name || username,
            token: response.access_token,
            refreshToken: response.refresh_token,
          };

          set({ user, isAuthenticated: true });
          return true;
        } catch (error: any) {
          set({
            error: error?.message || 'Falha no login',
            isAuthenticated: false,
          });
          console.log('[login] Erro:', error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      async biometricLogin() {
        const { user, biometricEnabled } = get();

        if (!biometricEnabled) {
          console.log('[biometricLogin] Biometria não habilitada');
          return false;
        }

        if (!user?.refreshToken) {
          console.log('[biometricLogin] Sem refresh token');
          return false;
        }

        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (!compatible) {
          console.log('[biometricLogin] Hardware incompatível');
          return false;
        }

        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) {
          console.log('[biometricLogin] Biometria não cadastrada no dispositivo');
          return false;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Autenticar com biometria',
          cancelLabel: 'Cancelar',
          disableDeviceFallback: false,
        });

        if (!result.success) {
          console.log('[biometricLogin] Usuário cancelou ou falhou');
          return false;
        }

        try {
          const refreshed = await authService.refresh(user.refreshToken);
          const updated: User = {
            ...user,
            token: refreshed.access_token,
            refreshToken: refreshed.refresh_token ?? user.refreshToken,
          };
          set({ user: updated, isAuthenticated: true });
          console.log('[biometricLogin] ✅ Autenticado com sucesso');
          return true;
        } catch (err) {
          console.log('[biometricLogin] ❌ Erro ao renovar token:', err);
          return false;
        }
      },

      // ✅ Auto-login silencioso (chamado apenas quando app abre)
      async tryAutoBiometricLogin() {
        const { biometricEnabled, user, isAuthenticated } = get();

        if (isAuthenticated) {
          console.log('[tryAutoBiometricLogin] Já autenticado');
          return false;
        }

        if (!biometricEnabled || !user?.refreshToken) {
          console.log('[tryAutoBiometricLogin] Biometria não configurada ou sem refresh token');
          return false;
        }

        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (!compatible || !enrolled) {
          console.log('[tryAutoBiometricLogin] Hardware não disponível ou biometria não cadastrada');
          return false;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Entrar com biometria',
          cancelLabel: 'Usar senha',
          disableDeviceFallback: true,
        });

        if (!result.success) {
          console.log('[tryAutoBiometricLogin] Cancelado ou falhou');
          return false;
        }

        // ✅ Tenta renovar o token
        try {
          const refreshed = await authService.refresh(user.refreshToken);
          const updatedUser = {
            ...user,
            token: refreshed.access_token,
            refreshToken: refreshed.refresh_token ?? user.refreshToken,
          };
          set({ user: updatedUser, isAuthenticated: true });
          console.log('[tryAutoBiometricLogin] ✅ Auto-login bem-sucedido');
          return true;
        } catch (err: any) {
          console.log('[tryAutoBiometricLogin] ❌ Token expirado ou inválido:', err?.message);

          // ✅ Token expirado: limpa tudo e força novo login
          set({
            biometricEnabled: false,
            biometricType: undefined,
            user: null,
            isAuthenticated: false,
          });
          return false;
        }
      },

      async enableBiometric() {
        const { user } = get();

        if (!user?.refreshToken) {
          console.log('[enableBiometric] Sem usuário ou refresh token');
          return { ok: false, reason: 'no-refresh' };
        }

        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (!compatible) {
          console.log('[enableBiometric] Hardware não compatível');
          return { ok: false, reason: 'no-hardware' };
        }

        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) {
          console.log('[enableBiometric] Biometria não cadastrada no dispositivo');
          return { ok: false, reason: 'not-enrolled' };
        }

        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        let typeLabel: string | undefined;

        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          typeLabel = 'face';
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          typeLabel = 'fingerprint';
        } else {
          typeLabel = 'biometric';
        }

        set({ biometricEnabled: true, biometricType: typeLabel });
        console.log('[enableBiometric] ✅ Biometria habilitada:', typeLabel);
        return { ok: true, reason: 'success' };
      },

      disableBiometric() {
        set({ biometricEnabled: false, biometricType: undefined });
        console.log('[disableBiometric] Biometria desabilitada');
      },

      logout() {
        set({
          user: null,
          isAuthenticated: false,
          biometricEnabled: false,
          biometricType: undefined,
        });
        AsyncStorage.removeItem('auth-storage');
        console.log('[logout] Sessão encerrada');
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hydrated: true });
        console.log('[authStore] ✅ Hidratado do AsyncStorage');
      },
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