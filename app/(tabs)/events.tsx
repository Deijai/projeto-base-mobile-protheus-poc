// app/(tabs)/events.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemedSafeArea } from '../../src/components/layout/ThemedSafeArea';
import { useTheme } from '../../src/hooks/useTheme';

export default function EventsScreen() {
    const { theme } = useTheme();

    return (
        <ThemedSafeArea style={{ flex: 1, backgroundColor: theme.background }}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: theme.text }]}>Eventos</Text>
                <Text style={[styles.subtitle, { color: theme.muted }]}>
                    Aqui você poderá visualizar os eventos e avisos do sistema.
                </Text>
            </View>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
    subtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20 },
});
