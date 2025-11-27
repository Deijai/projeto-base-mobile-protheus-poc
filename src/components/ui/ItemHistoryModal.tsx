// src/components/ui/ItemHistoryModal.tsx
import { useTheme } from '@/src/hooks/useTheme';
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
import { documentService } from '../../api/documentService';
import { useToast } from '../../hooks/useToast';

type HistoryItem = {
    issue_date?: string;
    'issue_dt.'?: string;
    purchaseDate?: string;
    company_name?: string;
    supplyerName?: string;
    quantity: number;
    unit_value?: number;
    unitValue?: number;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    productCode: string;
    itemDescription: string;
};

export const ItemHistoryModal: React.FC<Props> = ({
    visible,
    onClose,
    productCode,
    itemDescription,
}) => {
    const { theme } = useTheme();
    const toast = useToast();

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);

    useEffect(() => {
        if (visible) {
            loadHistory(true);
        } else {
            // Reset ao fechar
            setItems([]);
            setPage(1);
            setHasNext(false);
        }
    }, [visible]);

    const loadHistory = async (reset = false) => {
        try {
            if (reset) {
                setLoading(true);
                setPage(1);
            }

            const response = await documentService.getItemHistory(
                productCode,
                reset ? 1 : page,
                30
            );

            if (response?.records) {
                if (reset) {
                    setItems(response.records);
                } else {
                    setItems((prev) => [...prev, ...response.records]);
                }
                setHasNext(response.hasNext ?? false);
            } else {
                setItems([]);
                setHasNext(false);
            }
        } catch (error: any) {
            console.error('❌ [ItemHistoryModal] Erro:', error);
            toast.error(error?.message || 'Erro ao carregar histórico');
            if (reset) setItems([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasNext) {
            setPage((prev) => prev + 1);
            loadHistory(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadHistory(true);
    };

    const formatDate = (item: HistoryItem) => {
        const date = item.issue_date || item['issue_dt.'] || item.purchaseDate;
        if (!date) return '-';

        try {
            // Se vier no formato YYYY-MM-DD ou YYYYMMDD
            const cleaned = date.replace(/[^0-9]/g, '');
            if (cleaned.length >= 8) {
                const year = cleaned.substring(0, 4);
                const month = cleaned.substring(4, 6);
                const day = cleaned.substring(6, 8);
                return `${day}/${month}/${year}`;
            }
            return date;
        } catch {
            return date;
        }
    };

    const formatCurrency = (value?: number) => {
        if (!value && value !== 0) return '-';
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    const getSupplierName = (item: HistoryItem) => {
        return item.company_name || item.supplyerName || '-';
    };

    const getUnitValue = (item: HistoryItem) => {
        return item.unit_value ?? item.unitValue ?? 0;
    };

    const renderItem = ({ item }: { item: HistoryItem }) => (
        <View
            style={[
                styles.historyItem,
                { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
        >
            <View style={styles.historyRow}>
                <View style={styles.historyCol}>
                    <Text style={[styles.historyLabel, { color: theme.muted }]}>Data</Text>
                    <Text style={[styles.historyValue, { color: theme.text }]}>
                        {formatDate(item)}
                    </Text>
                </View>
                <View style={[styles.historyCol, { flex: 2 }]}>
                    <Text style={[styles.historyLabel, { color: theme.muted }]}>
                        Fornecedor
                    </Text>
                    <Text style={[styles.historyValue, { color: theme.text }]} numberOfLines={2}>
                        {getSupplierName(item)}
                    </Text>
                </View>
            </View>

            <View style={styles.historyRow}>
                <View style={styles.historyCol}>
                    <Text style={[styles.historyLabel, { color: theme.muted }]}>
                        Quantidade
                    </Text>
                    <Text style={[styles.historyValue, { color: theme.text }]}>
                        {item.quantity}
                    </Text>
                </View>
                <View style={styles.historyCol}>
                    <Text style={[styles.historyLabel, { color: theme.muted }]}>
                        Valor Unitário
                    </Text>
                    <Text style={[styles.historyValue, { color: theme.text }]}>
                        {formatCurrency(getUnitValue(item))}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.backdrop}>
                <View style={[styles.modal, { backgroundColor: theme.surface }]}>
                    {/* HEADER */}
                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { color: theme.text }]}>
                                Histórico de Compras
                            </Text>
                            <Text style={[styles.subtitle, { color: theme.muted }]}>
                                {itemDescription}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {/* HEADER DA TABELA (opcional, já que cada card tem labels) */}
                    {!loading && items.length > 0 && (
                        <View style={[styles.tableHeader, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.columnTitle, { color: theme.muted }]}>
                                Histórico de {items.length} compra{items.length !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    )}

                    {/* LOADING */}
                    {loading && items.length === 0 ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.primary} />
                            <Text style={[styles.loadingText, { color: theme.muted }]}>
                                Carregando histórico...
                            </Text>
                        </View>
                    ) : items.length === 0 ? (
                        // EMPTY STATE
                        <View style={styles.emptyContainer}>
                            <Ionicons name="time-outline" size={64} color={theme.muted} />
                            <Text style={[styles.emptyText, { color: theme.muted }]}>
                                Nenhum histórico de compra encontrado
                            </Text>
                        </View>
                    ) : (
                        // LISTA
                        <FlatList
                            data={items}
                            keyExtractor={(item, index) => `history-${index}`}
                            renderItem={renderItem}
                            contentContainerStyle={styles.listContent}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.3}
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            ListFooterComponent={
                                loading && items.length > 0 ? (
                                    <ActivityIndicator
                                        style={{ marginVertical: 16 }}
                                        color={theme.primary}
                                    />
                                ) : null
                            }
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modal: {
        maxHeight: '85%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tableHeader: {
        paddingHorizontal: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    columnTitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
    },
    emptyContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    listContent: {
        padding: 20,
        gap: 12,
    },
    historyItem: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        gap: 12,
    },
    historyRow: {
        flexDirection: 'row',
        gap: 12,
    },
    historyCol: {
        flex: 1,
    },
    historyLabel: {
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    historyValue: {
        fontSize: 14,
        fontWeight: '600',
    },
});