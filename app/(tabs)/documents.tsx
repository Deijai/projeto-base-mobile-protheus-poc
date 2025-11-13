// app/(tabs)/documents.tsx
import { ThemedSafeArea } from '@/src/components/layout/ThemedSafeArea';
import { ApprovalModal } from '@/src/components/ui/ApprovalModal';
import { BranchFilterModal } from '@/src/components/ui/BranchFilterModal';
import { FilterModal } from '@/src/components/ui/FilterModal';
import { Segment } from '@/src/components/ui/Segment';
import { useTheme } from '@/src/hooks/useTheme';
import { useApprovalsStore } from '@/src/store/approvalsStore';
import { getDocumentTypeLabel } from '@/src/utils/docLabels';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DocumentsScreen() {
    const { theme } = useTheme();
    const {
        documents,
        loading,
        fetchDocuments,
        selectedDocs,
        toggleSelect,
        hasNext,          // 👈 veio do store
        lastFilters,      // 👈 pra paginar com os mesmos filtros
    } = useApprovalsStore();

    const [filterVisible, setFilterVisible] = useState(false);
    const [branchFilterVisible, setBranchFilterVisible] = useState(false);
    const [approvalVisible, setApprovalVisible] = useState(false);

    const [segment, setSegment] = useState<'02' | '03' | '06'>('02');
    const [docType, setDocType] = useState<'SC' | 'PC' | 'IP' | 'AE' | 'ALL'>('SC');
    const [filteredBranches, setFilteredBranches] = useState<string[]>([]);

    const [listLoading, setListLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // 1) função central de carregar
    const loadDocs = useCallback(
        async (opts?: { isRefresh?: boolean }) => {
            const { isRefresh } = opts || {};
            const filters = {
                documentType: docType === 'ALL' ? undefined : docType,
                documentStatus: segment,
                branches: filteredBranches,
            };

            if (isRefresh) {
                setRefreshing(true);
                await fetchDocuments(filters, true);
                setRefreshing(false);
            } else {
                setListLoading(true);
                await fetchDocuments(filters, true);
                setListLoading(false);
            }
        },
        [docType, segment, filteredBranches, fetchDocuments]
    );

    // primeira carga
    useEffect(() => {
        loadDocs();
    }, []);

    // 2) troca de DOC TYPE
    const handleChangeDocType = async (value: 'SC' | 'PC' | 'IP' | 'AE' | 'ALL') => {
        setDocType(value);
        setListLoading(true);
        await fetchDocuments(
            {
                documentType: value === 'ALL' ? undefined : value,
                documentStatus: segment,
                branches: filteredBranches,
            },
            true // reset
        );
        setListLoading(false);
    };

    // 3) troca de STATUS
    const handleChangeSegment = async (value: '02' | '03' | '06') => {
        setSegment(value);
        setListLoading(true);
        await fetchDocuments(
            {
                documentType: docType === 'ALL' ? undefined : docType,
                documentStatus: value,
                branches: filteredBranches,
            },
            true // reset
        );
        setListLoading(false);
    };

    // 4) infinite scroll
    const handleLoadMore = async () => {
        // se já ta carregando ou não tem próxima → não faz nada
        if (loading || !hasNext) return;

        // usa os últimos filtros salvos no store
        const filtersToUse =
            lastFilters ||
            ({
                documentType: docType === 'ALL' ? undefined : docType,
                documentStatus: segment,
                branches: filteredBranches,
            } as any);

        await fetchDocuments(filtersToUse, false); // append
    };

    return (
        <ThemedSafeArea style={{ flex: 1, backgroundColor: theme.background }}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.title, { color: theme.text }]}>Documentos</Text>
                    <Text style={{ color: theme.muted, fontSize: 12 }}>
                        {docType === 'ALL'
                            ? 'Todos os tipos'
                            : `Listando: ${getDocumentTypeLabel(docType)}`}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                        onPress={() => setFilterVisible(true)}
                        style={[
                            styles.iconBtn,
                            { backgroundColor: theme.surface, borderColor: theme.border },
                        ]}
                    >
                        <Ionicons name="filter-outline" size={20} color={theme.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setBranchFilterVisible(true)}
                        style={[
                            styles.iconBtn,
                            { backgroundColor: theme.surface, borderColor: theme.border },
                        ]}
                    >
                        <Ionicons
                            name={filteredBranches.length > 0 ? 'business' : 'business-outline'}
                            size={20}
                            color={filteredBranches.length > 0 ? theme.primary : theme.text}
                        />
                        {filteredBranches.length > 0 ? (
                            <View style={styles.badge}>
                                <Text style={{ color: '#fff', fontSize: 10 }}>
                                    {filteredBranches.length}
                                </Text>
                            </View>
                        ) : null}
                    </TouchableOpacity>
                </View>
            </View>

            {/* chips de tipo */}
            <View style={{ paddingHorizontal: 16, marginBottom: 6 }}>
                <View style={styles.docTypeRow}>
                    {([
                        { label: 'SC', value: 'SC' as const },
                        { label: 'PC', value: 'PC' as const },
                        { label: 'IP', value: 'IP' as const },
                        { label: 'AE', value: 'AE' as const },
                        { label: 'Todos', value: 'ALL' as const },
                    ]).map((opt) => {
                        const active = docType === opt.value;
                        return (
                            <TouchableOpacity
                                key={opt.value}
                                onPress={() => handleChangeDocType(opt.value)}
                                style={[
                                    styles.docTypeChip,
                                    {
                                        backgroundColor: active ? theme.primary : 'transparent',
                                        borderColor: active ? theme.primary : theme.border,
                                    },
                                ]}
                            >
                                <Text
                                    style={{
                                        color: active ? '#fff' : theme.text,
                                        fontWeight: active ? '600' : '400',
                                    }}
                                >
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* segment de status */}
            <Segment
                value={segment}
                onChange={(value) => handleChangeSegment(value as '02' | '03' | '06')}
                items={[
                    { label: 'Pendentes', value: '02' },
                    { label: 'Aprovados', value: '03' },
                    { label: 'Reprovados', value: '06' },
                ]}
            />

            {/* loading de troca de filtro */}
            {listLoading && (
                <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <ActivityIndicator size="small" color={theme.primary} />
                        <Text style={{ color: theme.muted, fontSize: 12 }}>
                            Atualizando documentos...
                        </Text>
                    </View>
                </View>
            )}

            {/* lista */}
            <FlatList
                data={documents}
                keyExtractor={(item) => `${item.scrId}`}
                contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 10 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadDocs({ isRefresh: true })}
                        tintColor={theme.primary}
                        colors={[theme.primary]}
                    />
                }
                renderItem={({ item }) => {
                    const isSelected = selectedDocs.some((d) => d.scrId === item.scrId);
                    const docTypeLabel = getDocumentTypeLabel(item.documentType);
                    const hasPR = item.purchaseRequest && item.purchaseRequest.length > 0;
                    const hasPO = item.purchaseOrder && item.purchaseOrder.length > 0;
                    const hasWR = item.warehouseRequest && item.warehouseRequest.length > 0;
                    const hasME = item.measurements && item.measurements.length > 0;
                    const hasCT = item.contracts && item.contracts.length > 0;

                    return (
                        <TouchableOpacity
                            style={[
                                styles.card,
                                { backgroundColor: theme.surface, borderColor: theme.border },
                                isSelected && { borderColor: theme.primary, borderWidth: 2 },
                            ]}
                            onPress={() => toggleSelect(item)}
                        >
                            <View style={{ flex: 1, gap: 4 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={[styles.docId, { color: theme.text }]}>
                                        {item.documentNumber}
                                    </Text>
                                    <Text
                                        style={{
                                            color:
                                                item.documentStatus === '02'
                                                    ? theme.warning
                                                    : item.documentStatus === '03'
                                                        ? theme.success
                                                        : theme.error,
                                            fontSize: 12,
                                            fontWeight: '600',
                                        }}
                                    >
                                        {item.documentStatus === '02'
                                            ? 'Pendente'
                                            : item.documentStatus === '03'
                                                ? 'Aprovado'
                                                : 'Reprovado'}
                                    </Text>
                                </View>

                                <Text style={{ color: theme.muted, fontSize: 12 }}>
                                    {item.documentBranch?.trim() || 'Sem filial'} • {docTypeLabel}
                                </Text>

                                <Text style={{ color: theme.muted, fontSize: 12 }}>
                                    {item.documentStrongSymbol || item.documentSymbol || 'R$'}{' '}
                                    {item.documentTotal?.toLocaleString?.('pt-BR', {
                                        minimumFractionDigits: 2,
                                    }) || item.documentTotal}
                                </Text>

                                <Text style={{ color: theme.muted, fontSize: 11 }}>
                                    Usuário: {item.documentUserName || 'Não informado'}
                                    {item.documentGroupAprov ? ` • Grupo: ${item.documentGroupAprov}` : ''}
                                </Text>

                                {item.documentCreated ? (
                                    <Text style={{ color: theme.muted, fontSize: 11 }}>
                                        Criado em: {item.documentCreated}
                                    </Text>
                                ) : null}

                                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                                    {hasPR && (
                                        <View style={[styles.smallBadge, { backgroundColor: theme.primary + '22' }]}>
                                            <Text style={{ fontSize: 10, color: theme.primary }}>SC detalhada</Text>
                                        </View>
                                    )}
                                    {hasPO && (
                                        <View style={[styles.smallBadge, { backgroundColor: theme.primary + '22' }]}>
                                            <Text style={{ fontSize: 10, color: theme.primary }}>Pedido vinculado</Text>
                                        </View>
                                    )}
                                    {hasWR && (
                                        <View style={[styles.smallBadge, { backgroundColor: theme.primary + '22' }]}>
                                            <Text style={{ fontSize: 10, color: theme.primary }}>Req. almox.</Text>
                                        </View>
                                    )}
                                    {hasME && (
                                        <View style={[styles.smallBadge, { backgroundColor: theme.primary + '22' }]}>
                                            <Text style={{ fontSize: 10, color: theme.primary }}>Medições</Text>
                                        </View>
                                    )}
                                    {hasCT && (
                                        <View style={[styles.smallBadge, { backgroundColor: theme.primary + '22' }]}>
                                            <Text style={{ fontSize: 10, color: theme.primary }}>Contratos</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {isSelected ? (
                                <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
                            ) : (
                                <Ionicons name="chevron-forward" size={18} color={theme.muted} />
                            )}
                        </TouchableOpacity>
                    );
                }}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.25}
                ListFooterComponent={
                    loading && documents.length > 0 && hasNext ? (
                        <ActivityIndicator style={{ marginVertical: 10 }} color={theme.primary} />
                    ) : null
                }
            />

            {/* ações de aprovação */}
            {selectedDocs.length > 0 && (
                <View style={[styles.bottomBar, { backgroundColor: theme.surface }]}>
                    <TouchableOpacity
                        style={[styles.btn, { backgroundColor: theme.success }]}
                        onPress={() => setApprovalVisible(true)}
                    >
                        <Ionicons name="checkmark" size={20} color="#fff" />
                        <Text style={styles.btnText}>Aprovar ({selectedDocs.length})</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btn, { backgroundColor: theme.error }]}
                        onPress={() => setApprovalVisible(true)}
                    >
                        <Ionicons name="close" size={20} color="#fff" />
                        <Text style={styles.btnText}>Reprovar</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* modais */}
            <FilterModal
                visible={filterVisible}
                onClose={() => setFilterVisible(false)}
                onApply={(filters) => {
                    setListLoading(true);
                    fetchDocuments(
                        {
                            documentType: docType === 'ALL' ? undefined : docType,
                            documentStatus: segment,
                            ...filters,
                            branches: filteredBranches,
                        },
                        true
                    ).finally(() => {
                        setListLoading(false);
                        setFilterVisible(false);
                    });
                }}
            />

            <BranchFilterModal
                visible={branchFilterVisible}
                onClose={() => setBranchFilterVisible(false)}
                selectedCodes={filteredBranches}
                onApply={(codes) => {
                    setFilteredBranches(codes);
                    setListLoading(true);
                    fetchDocuments(
                        {
                            documentType: docType === 'ALL' ? undefined : docType,
                            documentStatus: segment,
                            branches: codes,
                        },
                        true
                    ).finally(() => setListLoading(false));
                }}
            />

            <ApprovalModal
                visible={approvalVisible}
                onClose={() => setApprovalVisible(false)}
                documents={selectedDocs}
            />
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
    },
    title: { fontSize: 20, fontWeight: '600' },
    iconBtn: {
        width: 34,
        height: 34,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#ef4444',
        borderRadius: 999,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
    },
    docTypeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    docTypeChip: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    card: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    docId: { fontSize: 16, fontWeight: '600' },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    btn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    btnText: { color: '#fff', fontWeight: '600' },
    smallBadge: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
});
