// app/_layout.tsx - VERSÃO SEM SPLASH SCREEN MANUAL
import { LoadingOverlay } from '@/src/components/ui/LoadingOverlay';
import { useModuleStore } from '@/src/store/moduleStore';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { MenuProvider } from 'react-native-popup-menu';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toast } from '../src/components/ui/Toast';
import { useAuthStore } from '../src/store/authStore';
import { useBranchStore } from '../src/store/branchStore';
import { useConnectionStore } from '../src/store/connectionStore';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [loaded] = useFonts({
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });

  const { isValid: restValid, config } = useConnectionStore();
  const { selectedBranch } = useBranchStore();
  const { selectedModule } = useModuleStore();

  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [biometricAttempted, setBiometricAttempted] = useState(false);

  const {
    isAuthenticated,
    hydrated,
    biometricEnabled,
    isLoading: authLoading,
    tryAutoBiometricLogin,
  } = useAuthStore();

  // ✅ Auto-login biométrico - APENAS UMA VEZ
  useEffect(() => {
    const initBiometric = async () => {
      if (!hydrated) return;
      if (biometricAttempted) return;
      if (isAuthenticated) return;
      if (!biometricEnabled) return;

      console.log('[_layout] Tentando auto-login biométrico...');
      setBiometricAttempted(true);

      const ok = await tryAutoBiometricLogin();

      if (ok) {
        console.log('[_layout] ✅ Auto-login bem-sucedido');
      } else {
        console.log('[_layout] ❌ Auto-login falhou ou foi cancelado');
      }
    };

    initBiometric();
  }, [hydrated]);

  useEffect(() => {
    setIsNavigationReady(true);
  }, []);

  useEffect(() => {
    if (!isNavigationReady || !hydrated) return;

    const rootSegment = segments[0];
    const utilityRoutes = ['config-rest', 'branches', 'modules', 'document-detail'];

    // 1) Sem REST válido
    if (!restValid || !config) {
      if (rootSegment !== 'config-rest') {
        router.replace('/config-rest');
      }
      return;
    }

    // 2) REST ok, mas não autenticado
    if (!isAuthenticated) {
      if (rootSegment !== '(auth)') {
        router.replace('/(auth)/signin');
      }
      return;
    }

    // 3) Autenticado mas sem filial
    if (!selectedBranch) {
      if (rootSegment !== 'branches') {
        router.replace('/branches');
      }
      return;
    }

    // 4) Tem filial mas sem módulo
    if (!selectedModule) {
      if (rootSegment !== 'modules') {
        router.replace('/modules');
      }
      return;
    }

    // 5) Tudo ok
    const isInUtility = utilityRoutes.includes(rootSegment as string);
    if (!rootSegment?.startsWith('(tabs)') && !isInUtility) {
      router.replace('/(tabs)');
    }
  }, [
    isNavigationReady,
    hydrated,
    segments,
    restValid,
    config,
    isAuthenticated,
    selectedBranch,
    selectedModule,
    router,
  ]);

  // ✅ Mostra loading enquanto não estiver tudo pronto
  if (!loaded || !hydrated) {
    return (
      <SafeAreaProvider>
        <MenuProvider>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <LoadingOverlay visible={true} text="Carregando dados..." />
          </View>
        </MenuProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <MenuProvider>
        <Slot />
        <Toast />
      </MenuProvider>
    </SafeAreaProvider>
  );
}