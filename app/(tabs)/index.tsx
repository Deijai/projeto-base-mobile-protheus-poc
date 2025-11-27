// app/(tabs)/home.tsx
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemedSafeArea } from '../../src/components/layout/ThemedSafeArea';
import { useAppContext } from '../../src/hooks/useAppContext';
import { useTheme } from '../../src/hooks/useTheme';

export default function HomeScreen() {
    const { theme } = useTheme();
    const { user, selectedBranch, selectedModule } = useAppContext();

    return (
        <ThemedSafeArea style={{ flex: 1, backgroundColor: theme.background }}>
            <ScreenHeader
                title="Inicio"
                subtitle={`Bem-vindo, ${user?.name || user?.username || 'usuário'}`}
                showLogo
                logoTintColor={theme.primary}
                logoPosition="right" // agora a logo vai pra direita
            />

            <View style={styles.container}>
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.label, { color: theme.muted }]}>Filial atual</Text>
                    <Text style={[styles.value, { color: theme.text }]}>
                        {selectedBranch?.Description || 'Nenhuma selecionada'}
                    </Text>
                    {selectedBranch?.Code ? (
                        <Text style={{ color: theme.muted, fontSize: 12 }}>
                            Código: {selectedBranch.Code.trim()}
                        </Text>
                    ) : null}
                </View>

                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.label, { color: theme.muted }]}>Módulo atual</Text>
                    <Text style={[styles.value, { color: theme.text }]}>
                        {selectedModule?.name || 'Nenhum selecionado'}
                    </Text>
                    {selectedModule?.description ? (
                        <Text style={{ color: theme.muted, fontSize: 12 }}>
                            {selectedModule.description}
                        </Text>
                    ) : null}
                </View>
            </View>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, gap: 16 },
    title: { fontSize: 22, fontWeight: '700' },
    subtitle: { fontSize: 14 },
    card: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        gap: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
    },
});
