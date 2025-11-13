import { Stack } from 'expo-router';
import React from 'react';
import { ThemedSafeArea } from '../../src/components/layout/ThemedSafeArea';
import { useTheme } from '../../src/hooks/useTheme';

export default function AuthLayout() {
    const { theme } = useTheme();

    return (
        <ThemedSafeArea style={{ flex: 1, backgroundColor: theme.background }}>
            <Stack
                screenOptions={{
                    headerShown: false, // as telas de login já têm seu próprio topo customizado
                    contentStyle: { backgroundColor: theme.background },
                }}
            />
        </ThemedSafeArea>
    );
}
