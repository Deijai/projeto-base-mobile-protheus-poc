// app/(tabs)/documents.tsx - COM CT / MD / IM
import { ThemedSafeArea } from '@/src/components/layout/ThemedSafeArea';
import { ApprovalModal } from '@/src/components/ui/ApprovalModal';
import { BranchFilterModal } from '@/src/components/ui/BranchFilterModal';
import { FilterModal } from '@/src/components/ui/FilterModal';
import { LoadingOverlay } from '@/src/components/ui/LoadingOverlay';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { Segment } from '@/src/components/ui/Segment';
import { useTheme } from '@/src/hooks/useTheme';
import { useToast } from '@/src/hooks/useToast';
import { useApprovalsStore } from '@/src/store/approvalsStore';
import { getDocumentTypeLabel } from '@/src/utils/docLabels';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// 👇 tipos de documento usados na UI (inclui CT / MD / IM)
type UIDocumentType = 'SC' | 'PC' | 'IP' | 'AE' | 'CT' | 'MD' | 'IM' | 'ALL';

export default function DocumentsScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const toast = useToast();

    const {
        documents,
        loading,
        fetchDocuments,
        selectedDocs,
        toggleSelect,
        hasNext,
        lastFilters,
        batchProcess,
    } = useApprovalsStore();

    const [filterVisible, setFilterVisible] = useState(false);
    const [branchFilterVisible, setBranchFilterVisible] = useState(false);
    const [approvalVisible, setApprovalVisible] = useState(false);

    const [segment, setSegment] = useState<'02' | '03' | '06'>('02');
    const [docType, setDocType] = useState<UIDocumentType>('SC');
    const [filteredBranches, setFilteredBranches] = useState<string[]>([]);

    const [listLoading, setListLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [processing, setProcessing] = useState(false);

    const pendingSelectedDocs = selectedDocs.filter(
        (d) => d.documentStatus === '02'
    );

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

    useEffect(() => {
        loadDocs();
    }, []);

    const handleChangeDocType = async (value: UIDocumentType) => {
        setDocType(value);
        setListLoading(true);
        await fetchDocuments(
            {
                documentType: value === 'ALL' ? undefined : value,
                documentStatus: segment,
                branches: filteredBranches,
            },
            true
        );
        setListLoading(false);
    };

    const handleChangeSegment = async (value: '02' | '03' | '06') => {
        setSegment(value);
        setListLoading(true);
        await fetchDocuments(
            {
                documentType: docType === 'ALL' ? undefined : docType,
                documentStatus: value,
                branches: filteredBranches,
            },
            true
        );
        setListLoading(false);
        setApprovalVisible(false);
    };

    const handleLoadMore = async () => {
        if (loading || !hasNext) return;

        const filtersToUse =
            lastFilters ||
            ({
                documentType: docType === 'ALL' ? undefined : docType,
                documentStatus: segment,
                branches: filteredBranches,
            } as any);

        await fetchDocuments(filtersToUse, false);
    };

    // 🎯 NAVEGAÇÃO PARA DETALHE
    const handleOpenDetail = (item: any) => {
        router.push({
            pathname: `/document-detail/${item.scrId}` as any,
            params: {
                documentType: item.documentType,
                documentNumber: item.documentNumber,
                documentStatus: item.documentStatus,
                documentBranch: item.documentBranch,
                documentTotal: item.documentTotal?.toString?.() ?? String(item.documentTotal ?? 0),
                documentCreated: item.documentCreated,
                documentGroupAprov: item.documentGroupAprov || '',
                documentUserName: item.documentUserName || '',
                documentSymbol: item.documentSymbol || 'R$',
            }
        });
    };

    const openApprovalModal = () => {
        if (segment !== '02') return;
        if (pendingSelectedDocs.length === 0) return;

        setApprovalVisible(true);
    };

    const handleApprovalConfirm = async ({ action, justification, documents }: any) => {
        try {
            setProcessing(true);

            await batchProcess({
                action,
                justification,
                documents,
            });

            toast.success(
                action === 'approve'
                    ? `Documentos aprovados com sucesso`
                    : `Documentos reprovados com sucesso`
            );

            setApprovalVisible(false);

        } catch (e: any) {
            console.error('Erro ao aprovar/reprovar', e);
            toast.error(`Erro ao executar ação: ${e?.message ?? e}`);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <ThemedSafeArea style={{ flex: 1, backgroundColor: theme.background }}>
            {/* Header */}
            <ScreenHeader
                title="Documentos"
                subtitle={
                    docType === 'ALL'
                        ? 'Todos os tipos'
                        : `Listando: ${getDocumentTypeLabel(docType)}`
                }
                showLogo
                logoTintColor={theme.primary}
                //logoBackgroundColor={theme.primary}

                logoPosition="left" // ou "right", se você quiser a logo do outro lado
                // logoSource={require('../../../assets/images/totvs-custom.png')} // se quiser passar outro logo

                showFilterButton
                showBranchFilterButton
                branchCount={filteredBranches.length}
                onPressFilter={() => setFilterVisible(true)}
                onPressBranchFilter={() => setBranchFilterVisible(true)}
            />

            {/* chips de tipo (agora com CT, MD, IM) */}
            <View style={{ paddingHorizontal: 16, marginBottom: 6 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                    style={{ marginBottom: 6 }}
                >
                    {([
                        { label: 'SC', value: 'SC' as const },
                        { label: 'PC', value: 'PC' as const },
                        { label: 'IP', value: 'IP' as const },
                        { label: 'AE', value: 'AE' as const },
                        { label: 'CT', value: 'CT' as const },
                        { label: 'MD', value: 'MD' as const },
                        { label: 'IM', value: 'IM' as const },
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
                </ScrollView>

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
                keyExtractor={(item, index) => `${item.scrId + index + Math.random()}`}
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

                    const isPending = item.documentStatus === '02';

                    return (
                        <View
                            style={[
                                styles.card,
                                { backgroundColor: theme.surface, borderColor: theme.border },
                                isSelected && { borderColor: theme.primary, borderWidth: 2 },
                            ]}
                        >
                            <View style={{ flex: 1, gap: 4 }}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
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
                                        <View
                                            style={[
                                                styles.smallBadge,
                                                { backgroundColor: theme.primary + '22' },
                                            ]}
                                        >
                                            <Text style={{ fontSize: 10, color: theme.primary }}>
                                                SC detalhada
                                            </Text>
                                        </View>
                                    )}
                                    {hasPO && (
                                        <View
                                            style={[
                                                styles.smallBadge,
                                                { backgroundColor: theme.primary + '22' },
                                            ]}
                                        >
                                            <Text style={{ fontSize: 10, color: theme.primary }}>
                                                Pedido vinculado
                                            </Text>
                                        </View>
                                    )}
                                    {hasWR && (
                                        <View
                                            style={[
                                                styles.smallBadge,
                                                { backgroundColor: theme.primary + '22' },
                                            ]}
                                        >
                                            <Text style={{ fontSize: 10, color: theme.primary }}>
                                                Req. almox.
                                            </Text>
                                        </View>
                                    )}
                                    {hasME && (
                                        <View
                                            style={[
                                                styles.smallBadge,
                                                { backgroundColor: theme.primary + '22' },
                                            ]}
                                        >
                                            <Text style={{ fontSize: 10, color: theme.primary }}>
                                                Medições
                                            </Text>
                                        </View>
                                    )}
                                    {hasCT && (
                                        <View
                                            style={[
                                                styles.smallBadge,
                                                { backgroundColor: theme.primary + '22' },
                                            ]}
                                        >
                                            <Text style={{ fontSize: 10, color: theme.primary }}>
                                                Contratos
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* 🎯 BOTÃO DETALHE + SELEÇÃO */}
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: 6,
                                    }}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.detailBtn,
                                            {
                                                borderColor: theme.primary,
                                                backgroundColor: theme.primary + '12',
                                            },
                                        ]}
                                        onPress={() => handleOpenDetail(item)}
                                    >
                                        <Text
                                            style={{
                                                color: theme.primary,
                                                fontSize: 12,
                                                fontWeight: '600',
                                            }}
                                        >
                                            Detalhe
                                        </Text>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={14}
                                            color={theme.primary}
                                            style={{ marginLeft: 4 }}
                                        />
                                    </TouchableOpacity>

                                    {isPending ? (
                                        <TouchableOpacity
                                            onPress={() => toggleSelect(item)}
                                            style={styles.checkboxArea}
                                        >
                                            <Ionicons
                                                name={
                                                    isSelected
                                                        ? 'checkbox-outline'
                                                        : 'square-outline'
                                                }
                                                size={20}
                                                color={
                                                    isSelected ? theme.primary : theme.muted
                                                }
                                            />
                                            <Text
                                                style={{
                                                    marginLeft: 4,
                                                    fontSize: 12,
                                                    color: theme.muted,
                                                }}
                                            >
                                                {isSelected ? 'Selecionado' : 'Selecionar'}
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons
                                                name="lock-closed-outline"
                                                size={16}
                                                color={theme.muted}
                                            />
                                            <Text
                                                style={{
                                                    marginLeft: 4,
                                                    fontSize: 11,
                                                    color: theme.muted,
                                                }}
                                            >
                                                Não disponível para aprovação
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
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

            {/* ações de aprovação - apenas para pendentes */}
            {segment === '02' && pendingSelectedDocs.length > 0 && (
                <View style={[styles.bottomBar, { backgroundColor: theme.surface }]}>
                    <TouchableOpacity
                        style={[styles.btn, { backgroundColor: theme.success }]}
                        onPress={openApprovalModal}
                    >
                        <Ionicons name="checkmark" size={20} color="#fff" />
                        <Text style={styles.btnText}>
                            Aprovar ({pendingSelectedDocs.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btn, { backgroundColor: theme.error }]}
                        onPress={openApprovalModal}
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
                documents={pendingSelectedDocs}
                onConfirm={handleApprovalConfirm}
            />

            <LoadingOverlay
                isbg
                visible={processing}
                text="Processando..."
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
        flexWrap: 'wrap',
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
    detailBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    checkboxArea: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
