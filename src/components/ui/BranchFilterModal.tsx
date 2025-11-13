// src/components/ui/BranchFilterModal.tsx
import { useTheme } from '@/src/hooks/useTheme';
import { useBranchStore } from '@/src/store/branchStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = {
    visible: boolean;
    onClose: () => void;
    selectedCodes?: string[];
    onApply?: (codes: string[]) => void;
};

export const BranchFilterModal: React.FC<Props> = ({
    visible,
    onClose,
    selectedCodes = [],
    onApply,
}) => {
    const { theme } = useTheme();
    const { branches, fetchBranches, loading, hasNext } = useBranchStore();

    const [localSelected, setLocalSelected] = useState<string[]>(selectedCodes);

    useEffect(() => {
        if (visible) {
            // sincroniza com o que veio da tela
            setLocalSelected(selectedCodes);

            // se não tem nada carregado ainda, busca
            if (!branches || branches.length === 0) {
                fetchBranches(true).catch(() => { });
            }
        }
    }, [visible, selectedCodes, branches?.length]);

    const toggleBranch = (code: string) => {
        setLocalSelected((prev) => {
            if (prev.includes(code)) {
                return prev.filter((c) => c !== code);
            }
            return [...prev, code];
        });
    };

    const handleSelectAll = () => {
        const allCodes = branches.map((b) => b.Code);
        setLocalSelected(allCodes);
    };

    const handleClear = () => {
        setLocalSelected([]);
    };

    const handleApply = () => {
        onApply?.(localSelected);
        onClose();
    };

    const loadMore = () => {
        if (!loading && hasNext) {
            fetchBranches(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={[styles.modal, { backgroundColor: theme.surface }]}>
                    {/* header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.title, { color: theme.text }]}>Filiais</Text>
                            <Text style={{ color: theme.muted, fontSize: 12 }}>
                                Selecione uma ou mais filiais para filtrar os documentos
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={22} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {/* ações rápidas */}
                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            onPress={handleSelectAll}
                            style={[styles.chip, { borderColor: theme.border }]}
                        >
                            <Ionicons name="checkmark-done-outline" size={16} color={theme.text} />
                            <Text style={{ marginLeft: 6, color: theme.text }}>Selecionar tudo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleClear}
                            style={[styles.chip, { borderColor: theme.border }]}
                        >
                            <Ionicons name="close-circle-outline" size={16} color={theme.text} />
                            <Text style={{ marginLeft: 6, color: theme.text }}>Limpar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* lista */}
                    <View style={{ flex: 1, marginTop: 6 }}>
                        {loading && branches.length === 0 ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator color={theme.primary} />
                                <Text style={{ marginTop: 6, color: theme.muted, fontSize: 12 }}>
                                    Carregando filiais...
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={branches}
                                onEndReached={loadMore}
                                onEndReachedThreshold={0.3}
                                keyExtractor={(item, index) => item.Code + index}
                                contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
                                renderItem={({ item }) => {
                                    const active = localSelected.includes(item.Code);
                                    return (
                                        <TouchableOpacity
                                            onPress={() => toggleBranch(item.Code)}
                                            style={[
                                                styles.branchItem,
                                                {
                                                    borderColor: active ? theme.primary : theme.border,
                                                    backgroundColor: active ? theme.primary + '0F' : 'transparent',
                                                },
                                            ]}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ color: theme.text, fontWeight: '600' }}>
                                                    {item.Description?.trim() || 'Sem descrição'}
                                                </Text>
                                                <Text style={{ color: theme.muted, fontSize: 12 }}>
                                                    {item.Code} • {item.City} {item.State ? `- ${item.State}` : ''}
                                                </Text>
                                            </View>
                                            {active ? (
                                                <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                                            ) : (
                                                <Ionicons name="ellipse-outline" size={20} color={theme.muted} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        )}
                    </View>

                    {/* footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={[styles.btn, { backgroundColor: theme.border }]}
                        >
                            <Text style={{ color: theme.text }}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleApply}
                            style={[styles.btn, { backgroundColor: theme.primary }]}
                        >
                            <Text style={{ color: '#fff', fontWeight: '600' }}>
                                Aplicar ({localSelected.length})
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: '#00000066',
        justifyContent: 'flex-end',
    },
    modal: {
        maxHeight: '85%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: Platform.OS === 'ios' ? 24 : 14,
        gap: 12,
        // 👇 isso aqui é o que faltava pra lista aparecer
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    branchItem: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    footer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    btn: {
        flex: 1,
        borderRadius: 14,
        alignItems: 'center',
        paddingVertical: 10,
    },
});
