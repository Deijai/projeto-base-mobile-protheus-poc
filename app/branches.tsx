// app/branches.tsx
import { LoadingOverlay } from '@/src/components/ui/LoadingOverlay';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedSafeArea } from '../src/components/layout/ThemedSafeArea';
import { useTheme } from '../src/hooks/useTheme';
import { useToast } from '../src/hooks/useToast';
import { useAuthStore } from '../src/store/authStore';
import { useBranchStore } from '../src/store/branchStore';

export default function BranchesScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const toast = useToast();

    const {
        fetchBranches,
        branches,
        loading,
        hasNext,
        selectBranch,
        hydrated,      // 👈 pega aqui
        error,
    } = useBranchStore();

    const logout = useAuthStore((s) => s.logout);
    const { fromLogin, fromSettings } = useLocalSearchParams();

    const [search, setSearch] = useState('');

    useEffect(() => {
        // só tenta buscar quando o store já estiver hidratado
        if (!hydrated) return;

        fetchBranches(true).catch((err) => {
            console.error('Erro ao buscar filiais', err);
            toast.error('Erro ao buscar filiais. Faça login novamente.');
            logout();
        });
    }, [hydrated]);

    const filteredBranches = branches.filter((b) => {
        const term = search.toLowerCase();
        return (
            b.Description?.toLowerCase().includes(term) ||
            b.Code?.toLowerCase().includes(term) ||
            b.City?.toLowerCase().includes(term)
        );
    });

    const handleSelect = (branch: any) => {
        selectBranch(branch);
        toast.success(`Filial selecionada: ${branch.Description}`);
        router.replace('/modules');
    };

    const loadMore = () => {
        if (!loading && hasNext) {
            fetchBranches(false);
        }
    };

    // enquanto não hidratou, mostra um loading simples
    if (!hydrated) {
        return (
            <ThemedSafeArea style={{ flex: 1, backgroundColor: theme.background }}>
                <LoadingOverlay visible text="Preparando filiais..." />
            </ThemedSafeArea>
        );
    }

    return (
        <ThemedSafeArea style={{ flex: 1, backgroundColor: theme.background }}>
            {(fromLogin === 'true' || fromSettings === 'true') && (
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={25} color={theme.primary} />
                    </TouchableOpacity>
                </View>
            )}

            <Text style={[styles.subtitle, { color: theme.muted }]}>
                Escolha a filial com a qual deseja trabalhar.
            </Text>

            {/* search */}
            <View
                style={[
                    styles.searchBox,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
            >
                <Ionicons name="search-outline" size={18} color={theme.muted} />
                <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Buscar por nome, código ou cidade"
                    placeholderTextColor={theme.muted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* lista ou loading */}
            {loading && branches.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingOverlay visible={loading} text="Carregando filiais..." />
                </View>
            ) : (
                <FlatList
                    data={filteredBranches}
                    keyExtractor={(item, index) => `${item.Code}-${index}`}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 12 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handleSelect(item)}
                            style={[
                                styles.branchCard,
                                { backgroundColor: theme.surface, borderColor: theme.border },
                            ]}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.branchName, { color: theme.text }]}>
                                    {item.Description?.trim() || 'Sem descrição'}
                                </Text>
                                <Text style={{ color: theme.muted, fontSize: 13 }}>
                                    {item.Code?.trim()} • {item.City?.trim()}{' '}
                                    {item.State ? `- ${item.State}` : ''}
                                </Text>
                                {item.Cgc ? (
                                    <Text style={{ color: theme.muted, fontSize: 12, marginTop: 4 }}>
                                        CNPJ: {item.Cgc}
                                    </Text>
                                ) : null}
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={theme.muted} />
                        </TouchableOpacity>
                    )}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.2}
                    ListFooterComponent={
                        loading && branches.length > 0 ? (
                            <ActivityIndicator style={{ marginTop: 8 }} color={theme.primary} />
                        ) : null
                    }
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
    subtitle: {
        fontSize: 14,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 14,
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        minHeight: 36,
    },
    branchCard: {
        borderWidth: 1,
        borderRadius: 20,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    branchName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
});
