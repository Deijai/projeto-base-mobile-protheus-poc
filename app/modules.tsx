// app/modules.tsx
import { LoadingOverlay } from '@/src/components/ui/LoadingOverlay';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemedSafeArea } from '../src/components/layout/ThemedSafeArea';
import { useTheme } from '../src/hooks/useTheme';
import { useToast } from '../src/hooks/useToast';
import { useModuleStore } from '../src/store/moduleStore';

export default function ModuleSelectionScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { modules, fetchModules, selectModule, loading } = useModuleStore();
    const toast = useToast();
    const { fromLogin, fromSettings } = useLocalSearchParams();

    useEffect(() => {
        fetchModules();
    }, []);

    const handleSelect = (module: any) => {
        selectModule(module);
        toast.success(`Módulo selecionado: ${module.name}`);
        //router.replace(module.route);
        router.replace('/(tabs)');
    };

    return (
        <ThemedSafeArea style={{ flex: 1, backgroundColor: theme.background }}>
            {/* TOP BAR */}
            {fromLogin === 'true' || fromSettings === 'true' && (
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={25} color={theme.primary} />
                    </TouchableOpacity>
                </View>
            )}
            <Text style={[styles.subtitle, { color: theme.muted }]}>Escolha o módulo para continuar</Text>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {/* <ActivityIndicator color={theme.primary} /> */}

                    <LoadingOverlay visible={loading} text="Carregando módulos..." />
                </View>
            ) : (
                <FlatList
                    data={modules}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.card,
                                { backgroundColor: theme.surface, borderColor: theme.border },
                            ]}
                            onPress={() => handleSelect(item)}
                        >
                            <Ionicons name={item.icon as any} size={26} color={theme.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                                <Text style={[styles.desc, { color: theme.muted }]}>{item.description}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={theme.muted} />
                        </TouchableOpacity>
                    )}
                />
            )}
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingHorizontal: 18,
        paddingTop: 8,
        marginBottom: 6,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 14,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        gap: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
    desc: {
        fontSize: 13,
        marginTop: 2,
    },
});
