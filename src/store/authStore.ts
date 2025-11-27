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
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      async biometricLogin() {
        const { user, biometricEnabled } = get();

        if (!biometricEnabled) {
          return false;
        }

        if (!user?.refreshToken) {
          return false;
        }

        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (!compatible) {
          return false;
        }

        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) {
          return false;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Autenticar com biometria',
          cancelLabel: 'Cancelar',
          disableDeviceFallback: false,
        });

        if (!result.success) {
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
          return true;
        } catch (err) {
          return false;
        }
      },

      // ✅ Auto-login silencioso (chamado apenas quando app abre)
      async tryAutoBiometricLogin() {
        const { biometricEnabled, user, isAuthenticated } = get();

        if (isAuthenticated) {
          return false;
        }

        if (!biometricEnabled || !user?.refreshToken) {
          return false;
        }

        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (!compatible || !enrolled) {
          return false;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Entrar com biometria',
          cancelLabel: 'Usar senha',
          disableDeviceFallback: true,
        });

        if (!result.success) {
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
          return true;
        } catch (err: any) {

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
          return { ok: false, reason: 'no-refresh' };
        }

        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (!compatible) {
          return { ok: false, reason: 'no-hardware' };
        }

        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) {
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
        return { ok: true, reason: 'success' };
      },

      disableBiometric() {
        set({ biometricEnabled: false, biometricType: undefined });
      },

      logout() {
        set({
          user: null,
          isAuthenticated: false,
          biometricEnabled: false,
          biometricType: undefined,
        });
        AsyncStorage.removeItem('auth-storage');
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hydrated: true });
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