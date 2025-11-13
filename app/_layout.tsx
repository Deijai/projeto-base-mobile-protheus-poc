// app/_layout.tsx
import { LoadingOverlay } from '@/src/components/ui/LoadingOverlay';
import { useModuleStore } from '@/src/store/moduleStore';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toast } from '../src/components/ui/Toast';
import { useAuthStore } from '../src/store/authStore';
import { useBranchStore } from '../src/store/branchStore';
import { useConnectionStore } from '../src/store/connectionStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [loaded] = useFonts({
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });

  // stores

  const { isValid: restValid, config } = useConnectionStore();
  const { selectedBranch } = useBranchStore();
  const { selectedModule } = useModuleStore();

  // evita navegar antes do root montar
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const {
    isAuthenticated,
    hydrated,
    biometricEnabled,
    isLoading: authLoading,
    tryAutoBiometricLogin,
  } = useAuthStore();

  useEffect(() => {
    // Só esconder splash quando fontes E i18n estiverem carregados
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const initBiometric = async () => {
      if (hydrated && !isAuthenticated && biometricEnabled) {
        const ok = await tryAutoBiometricLogin();
        if (ok) console.log('Autenticado automaticamente via Face ID / Biometria ✅');
      }
    };
    initBiometric();
  }, [hydrated, biometricEnabled]);

  useEffect(() => {
    //clearStorage();
    // debugStorage(); // mostra tudo
    //debugStorage('connection-storage');
    setIsNavigationReady(true);
  }, []);

  useEffect(() => {
    if (!isNavigationReady) return;

    // rota atual (primeiro nível): '', 'config-rest', '(auth)', 'branches', '(tabs)', ...
    const rootSegment = segments[0];

    // rotas que o usuário PODE acessar mesmo já estando configurado
    const utilityRoutes = ['config-rest', 'branches', 'modules'];

    // 1) sem REST válido -> manda pra /config-rest
    if (!restValid || !config) {
      if (rootSegment !== 'config-rest') {
        router.replace('/config-rest');
      }
      return;
    }

    // 2) REST ok, mas usuário não logado -> manda pro login
    if (!isAuthenticated) {
      if (rootSegment !== '(auth)') {
        router.replace('/(auth)/signin');
      }
      return;
    }

    // 3) logado, mas não tem filial escolhida -> manda pra /branches
    if (!selectedBranch) {
      if (rootSegment !== 'branches') {
        router.replace('/branches');
      }
      return;
    }

    // 4) tem filial mas não tem módulo -> manda pra /modules
    if (!selectedModule) {
      if (rootSegment !== 'modules') {
        router.replace('/modules');
      }
      return;
    }

    // 5) se já tem TUDO e o cara não está em tabs,
    // mas está em uma rota utilitária (config-rest, branches, modules),
    // **deixa ele lá**.
    const isInUtility = utilityRoutes.includes(rootSegment as string);

    if (!rootSegment?.startsWith('(tabs)') && !isInUtility) {
      router.replace('/(tabs)');
    }
  }, [
    isNavigationReady,
    segments,
    restValid,
    config,
    isAuthenticated,
    selectedBranch,
    selectedModule,
    router,
  ]);

  // enquanto o auth está restaurando do AsyncStorage
  if (authLoading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {/* <ActivityIndicator size="large" /> */}
          <LoadingOverlay visible={true} text="Carregando dados..." />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Slot />
      <Toast />
    </SafeAreaProvider>
  );
}
