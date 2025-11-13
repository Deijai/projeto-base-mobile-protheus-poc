// src/store/authStore.ts
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
  biometricType?: string; // 'face' | 'fingerprint' | 'biometric'
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

          //console.log('response: ', response);


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
          console.log('error: ', error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      async biometricLogin() {
        const { user, biometricEnabled } = get();

        if (!biometricEnabled || !user?.refreshToken) {
          console.log('[biometricLogin] Biometria não habilitada ou sem refresh.');
          return false;
        }

        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (!compatible) return false;

        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) return false;

        console.log('compatible', compatible, 'enrolled', enrolled);


        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Autenticar com biometria',
          cancelLabel: 'Cancelar',
          disableDeviceFallback: false,
        });

        console.log('result', result);


        if (!result.success) return false;

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
          console.log('Erro ao renovar token após biometria', err);
          return false;
        }
      },

      async tryAutoBiometricLogin() {
        const { biometricEnabled, user, isAuthenticated } = get();
        if (isAuthenticated || !biometricEnabled || !user?.refreshToken) return false;

        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!compatible || !enrolled) return false;

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Entrar com biometria',
          cancelLabel: 'Cancelar',
          disableDeviceFallback: false,
        });

        if (!result.success) return false;

        try {
          const refreshed = await authService.refresh(user.refreshToken);
          const updatedUser = {
            ...user,
            token: refreshed.access_token,
            refreshToken: refreshed.refresh_token ?? user.refreshToken,
          };
          set({ user: updatedUser, isAuthenticated: true });
          console.log('Login automático via biometria ✅');
          return true;
        } catch (err) {
          console.log('Erro no auto-biometric login:', err);
          return false;
        }
      },

      // ⚙️ agora retorna {ok, reason}
      async enableBiometric() {
        const { user } = get();
        if (!user?.refreshToken) {
          console.log('[enableBiometric] Nenhum usuário logado com refreshToken.');
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
        // marca como hidratado
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
