// app/document-detail/[id].tsx - USANDO STORE
import { ThemedSafeArea } from '@/src/components/layout/ThemedSafeArea';
import { ApprovalModal } from '@/src/components/ui/ApprovalModal';
import { ItemAdditionalInfoModal } from '@/src/components/ui/ItemAdditionalInfoModal';
import { ItemHistoryModal } from '@/src/components/ui/ItemHistoryModal';
import { LoadingOverlay } from '@/src/components/ui/LoadingOverlay';
import { useTheme } from '@/src/hooks/useTheme';
import { useToast } from '@/src/hooks/useToast';
import { useApprovalsStore } from '@/src/store/approvalsStore';
import { useDocumentDetailStore } from '@/src/store/documentDetailStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    Menu,
    MenuOption,
    MenuOptions,
    MenuTrigger,
} from 'react-native-popup-menu';

export default function DocumentDetailScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const toast = useToast();
    const params = useLocalSearchParams();

    const scrId = params.id as string;
    const documentType = params.documentType as string;
    const documentNumber = params.documentNumber as string;
    const documentStatus = params.documentStatus as string;
    const documentBranch = params.documentBranch as string;
    const documentTotal = params.documentTotal as string;
    const documentCreated = params.documentCreated as string;
    const documentGroupAprov = params.documentGroupAprov as string;
    const documentUserName = params.documentUserName as string;
    const documentSymbol = params.documentSymbol as string;

    const {
        items,
        loading,
        refreshing,
        hasNext,
        error,
        setCurrentDocument,
        fetchItems,
        loadMore,
        refresh,
        clear,
    } = useDocumentDetailStore();

    const { batchProcess } = useApprovalsStore();

    const [additionalInfoModal, setAdditionalInfoModal] = useState({
        visible: false,
        recordNumber: '',
        itemNumber: '',
        itemRecno: 0,
        itemDescription: '',
    });

    const [historyModal, setHistoryModal] = useState({
        visible: false,
        productCode: '',
        itemDescription: '',
    });

    const [approvalModal, setApprovalModal] = useState({
        visible: false,
    });

    const [processing, setProcessing] = useState(false);

    // CONFIG POR TIPO
    const getDocumentConfig = () => {
        const type = documentType?.toUpperCase();
        switch (type) {
            case 'SC':
                return { title: 'Solicitação de Compra', showApportionment: true };
            case 'PC':
                return { title: 'Pedido de Compra', showApportionment: true };
            case 'IP':
                return { title: 'Pedido de Compra (Item)', showApportionment: true };
            case 'AE':
                return { title: 'Autorização de Entrega', showApportionment: true };
            case 'SA':
                return { title: 'Requisição de Almoxarifado', showApportionment: false };
            case 'CT':
                return { title: 'Contrato', showApportionment: false };
            case 'MD':
                return { title: 'Medição', showApportionment: false };
            default:
                return { title: 'Documento', showApportionment: false };
        }
    };

    const config = getDocumentConfig();

    // STATUS CHIP
    const getStatusConfig = () => {
        switch (documentStatus) {
            case '02':
                return { label: 'Pendente', color: theme.warning ?? '#f5a623' };
            case '03':
                return { label: 'Aprovado', color: theme.success };
            case '04':
                return { label: 'Reprovado', color: theme.error };
            default:
                return { label: documentStatus || 'Status', color: theme.muted };
        }
    };

    const statusConfig = getStatusConfig();

    // LOAD INICIAL
    useEffect(() => {
        setCurrentDocument(Number(scrId), documentType, documentNumber);
        fetchItems(documentType, scrId, true);

        return () => {
            clear();
        };
    }, [scrId, documentType, documentNumber]);

    // RENDER ITEM
    const renderItem = ({ item }: { item: any }) => {
        const isPurchaseOrder = 'purchaseOrderItem' in item;
        const isPurchaseRequest = 'requestItem' in item;

        const itemData = {
            description: item.itemSkuDescription || '',
            code: isPurchaseOrder ? item.itemSku : item.itemProduct,
            costCenter: item.costCenter || '-',
            quantity: item.quantity,
            unitMeasurement: item.unitMeasurement,
            currency: item.currency || documentSymbol,
            itemTotal: item.itemTotal,
            unitValue: item.unitValue,
            itemNumber: isPurchaseOrder ? item.purchaseOrderItem : item.requestItem,
        };

        return (
            <View
                style={[
                    styles.itemCard,
                    {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                    },
                ]}
            >
                {/* BARRA LATERAL COLORIDA */}
                <View
                    style={[
                        styles.itemAccentBar,
                        { backgroundColor: theme.primary },
                    ]}
                />

                <View style={{ flex: 1 }}>
                    {/* TÍTULO + CÓDIGO */}
                    <View style={styles.itemHeaderRow}>
                        <View style={{ flex: 1 }}>
                            <Text
                                style={[styles.itemTitle, { color: theme.text }]}
                                numberOfLines={2}
                            >
                                {itemData.description || 'Item sem descrição'}
                            </Text>
                            <Text
                                style={[styles.itemSubtitle, { color: theme.muted }]}
                                numberOfLines={1}
                            >
                                {itemData.code}
                            </Text>
                        </View>

                        {itemData.itemNumber && (
                            <View
                                style={[
                                    styles.itemBadge,
                                    { borderColor: theme.border },
                                ]}
                            >
                                <Text
                                    style={{
                                        fontSize: 11,
                                        color: theme.muted,
                                        fontWeight: '600',
                                    }}
                                >
                                    Item {itemData.itemNumber}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* LINHA 1 */}
                    <View style={styles.itemRow}>
                        <View style={styles.itemDetail}>
                            <Text
                                style={[styles.itemLabel, { color: theme.muted }]}
                            >
                                Centro de Custo
                            </Text>
                            <Text
                                style={[styles.itemValue, { color: theme.text }]}
                                numberOfLines={1}
                            >
                                {itemData.costCenter}
                            </Text>
                        </View>
                        <View style={styles.itemDetail}>
                            <Text
                                style={[styles.itemLabel, { color: theme.muted }]}
                            >
                                Quantidade
                            </Text>
                            <Text
                                style={[styles.itemValue, { color: theme.text }]}
                            >
                                {itemData.quantity}
                            </Text>
                        </View>
                        <View style={styles.itemDetail}>
                            <Text
                                style={[styles.itemLabel, { color: theme.muted }]}
                            >
                                Unidade
                            </Text>
                            <Text
                                style={[styles.itemValue, { color: theme.text }]}
                            >
                                {itemData.unitMeasurement}
                            </Text>
                        </View>
                    </View>

                    {/* VALORES */}
                    {isPurchaseOrder && (
                        <View style={styles.itemRow}>
                            <View style={styles.itemDetail}>
                                <Text
                                    style={[styles.itemLabel, { color: theme.muted }]}
                                >
                                    Valor Unitário
                                </Text>
                                <Text
                                    style={[styles.itemValue, { color: theme.text }]}
                                >
                                    {formatCurrency(
                                        itemData.unitValue,
                                        itemData.currency
                                    )}
                                </Text>
                            </View>
                            <View style={styles.itemDetail}>
                                <Text
                                    style={[styles.itemLabel, { color: theme.muted }]}
                                >
                                    Valor Total
                                </Text>
                                <Text
                                    style={[styles.itemValue, { color: theme.text }]}
                                >
                                    {formatCurrency(
                                        itemData.itemTotal,
                                        itemData.currency
                                    )}
                                </Text>
                            </View>
                        </View>
                    )}

                    {isPurchaseRequest && (
                        <View style={styles.itemRow}>
                            <View style={styles.itemDetail}>
                                <Text
                                    style={[styles.itemLabel, { color: theme.muted }]}
                                >
                                    Valor Total
                                </Text>
                                <Text
                                    style={[styles.itemValue, { color: theme.text }]}
                                >
                                    {formatCurrency(
                                        itemData.itemTotal,
                                        itemData.currency
                                    )}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* AÇÕES */}
                    <View style={styles.itemActions}>
                        <TouchableOpacity
                            onPress={() => handleViewMore(item)}
                            style={[
                                styles.itemButton,
                                {
                                    borderColor: theme.primary,
                                    backgroundColor: theme.primary + '10',
                                },
                            ]}
                        >
                            <Ionicons
                                name="information-circle-outline"
                                size={16}
                                color={theme.primary}
                            />
                            <Text
                                style={[
                                    styles.itemButtonText,
                                    { color: theme.primary },
                                ]}
                            >
                                Ver mais
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleItemHistory(item)}
                            style={[
                                styles.itemButton,
                                {
                                    borderColor: theme.primary,
                                    backgroundColor: theme.primary + '05',
                                },
                            ]}
                        >
                            <Ionicons
                                name="time-outline"
                                size={16}
                                color={theme.primary}
                            />
                            <Text
                                style={[
                                    styles.itemButtonText,
                                    { color: theme.primary },
                                ]}
                            >
                                Histórico
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    // HANDLERS
    const handleViewMore = (item: any) => {
        const isPurchaseOrder = 'purchaseOrderItem' in item;
        const itemNumber = isPurchaseOrder ? item.purchaseOrderItem : item.requestItem;
        const itemRecno = parseInt(scrId) || 0;
        const itemDescription = item.itemSkuDescription || '';

        if (!itemRecno || itemRecno === 0) {
            toast.error('ID do documento não encontrado');
            return;
        }

        setAdditionalInfoModal({
            visible: true,
            recordNumber: documentNumber,
            itemNumber,
            itemRecno,
            itemDescription,
        });
    };

    const handleItemHistory = (item: any) => {
        const isPurchaseOrder = 'purchaseOrderItem' in item;
        const productCode = isPurchaseOrder ? item.itemSku : item.itemProduct;
        const itemDescription = item.itemSkuDescription || '';

        setHistoryModal({
            visible: true,
            productCode,
            itemDescription,
        });
    };

    const handleApprove = () => {
        if (documentStatus !== '02') {
            toast.error('Apenas documentos pendentes podem ser aprovados');
            return;
        }
        setApprovalModal({ visible: true });
    };

    const handleReject = () => {
        if (documentStatus !== '02') {
            toast.error('Apenas documentos pendentes podem ser reprovados');
            return;
        }
        setApprovalModal({ visible: true });
    };

    const handleApprovalConfirm = async ({ action, justification }: any) => {
        try {
            setProcessing(true);

            const documentToProcess = {
                scrId: parseInt(scrId),
                documentType,
                documentNumber,
                documentStatus,
                documentBranch,
                documentTotal: parseFloat(documentTotal) || 0,
                documentGroupAprov,
                documentItemGroup: '',
            };

            await batchProcess({
                action,
                justification,
                documents: [documentToProcess as any],
            });

            toast.success(
                action === 'approve'
                    ? 'Documento aprovado com sucesso!'
                    : 'Documento reprovado com sucesso!'
            );

            setApprovalModal({ visible: false });

            setTimeout(() => {
                router.back();
            }, 1000);
        } catch (error: any) {
            toast.error(`Erro: ${error?.message || 'Não foi possível processar'}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleOpenAttachments = () => {
        toast.info('Tela de anexos em desenvolvimento');
    };

    const handleOpenHistory = () => {
        toast.info('Tela de histórico em desenvolvimento');
    };

    const handleOpenApportionment = () => {
        toast.info('Tela de rateio em desenvolvimento');
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr.length !== 8) return dateStr;
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${day}/${month}/${year}`;
    };

    const formatCurrency = (value: any, symbol = 'R$') => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return `${symbol} 0,00`;
        return `${symbol} ${num.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const isPending = documentStatus === '02';

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    return (
        <ThemedSafeArea
            style={{ flex: 1, backgroundColor: theme.background }}
        >
            {/* HEADER */}
            <View
                style={[
                    styles.headerContainer,
                    {
                        backgroundColor: theme.surface,
                        shadowColor: theme.text,
                    },
                ]}
            >
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[
                            styles.backButton,
                            { backgroundColor: theme.background },
                        ]}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={22}
                            color={theme.primary}
                        />
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}>
                        <Text
                            style={[
                                styles.headerTitle,
                                { color: theme.text },
                            ]}
                            numberOfLines={1}
                        >
                            {config.title}
                        </Text>
                        <View style={styles.headerSubRow}>
                            <Text
                                style={[
                                    styles.headerSubtitle,
                                    { color: theme.muted },
                                ]}
                                numberOfLines={1}
                            >
                                Nº {documentNumber}
                            </Text>

                            {/* STATUS CHIP */}
                            <View
                                style={[
                                    styles.statusChip,
                                    {
                                        borderColor: statusConfig.color,
                                        backgroundColor: statusConfig.color + '22',
                                    },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.statusDot,
                                        { backgroundColor: statusConfig.color },
                                    ]}
                                />
                                <Text
                                    style={{
                                        fontSize: 11,
                                        fontWeight: '600',
                                        color: theme.text,
                                    }}
                                >
                                    {statusConfig.label}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Menu>
                        <MenuTrigger>
                            <View style={styles.menuButton}>
                                <Ionicons
                                    name="ellipsis-vertical"
                                    size={20}
                                    color={theme.text}
                                />
                            </View>
                        </MenuTrigger>
                        <MenuOptions
                            customStyles={{
                                optionsContainer: {
                                    backgroundColor: theme.surface,
                                    borderRadius: 12,
                                    padding: 8,
                                    marginTop: 40,
                                },
                            }}
                        >
                            <MenuOption onSelect={handleOpenAttachments}>
                                <View style={styles.menuItem}>
                                    <Ionicons
                                        name="attach-outline"
                                        size={20}
                                        color={theme.text}
                                    />
                                    <Text
                                        style={[
                                            styles.menuText,
                                            { color: theme.text },
                                        ]}
                                    >
                                        Anexos
                                    </Text>
                                </View>
                            </MenuOption>
                            <MenuOption onSelect={handleOpenHistory}>
                                <View style={styles.menuItem}>
                                    <Ionicons
                                        name="time-outline"
                                        size={20}
                                        color={theme.text}
                                    />
                                    <Text
                                        style={[
                                            styles.menuText,
                                            { color: theme.text },
                                        ]}
                                    >
                                        Histórico
                                    </Text>
                                </View>
                            </MenuOption>
                            {config.showApportionment && (
                                <MenuOption onSelect={handleOpenApportionment}>
                                    <View style={styles.menuItem}>
                                        <Ionicons
                                            name="pie-chart-outline"
                                            size={20}
                                            color={theme.text}
                                        />
                                        <Text
                                            style={[
                                                styles.menuText,
                                                { color: theme.text },
                                            ]}
                                        >
                                            Rateio
                                        </Text>
                                    </View>
                                </MenuOption>
                            )}
                        </MenuOptions>
                    </Menu>
                </View>

                {/* CARD RESUMO DOCUMENTO */}
                <View
                    style={[
                        styles.infoCard,
                        {
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.sectionLabel,
                            { color: theme.muted },
                        ]}
                    >
                        Resumo do documento
                    </Text>

                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <View style={styles.infoLabelRow}>
                                <Ionicons
                                    name="pricetag-outline"
                                    size={14}
                                    color={theme.muted}
                                />
                                <Text
                                    style={[
                                        styles.infoLabel,
                                        { color: theme.muted },
                                    ]}
                                >
                                    Grupo de Aprovação
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.infoValue,
                                    { color: theme.text },
                                ]}
                            >
                                {documentGroupAprov || '-'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <View style={styles.infoLabelRow}>
                                <Ionicons
                                    name="document-text-outline"
                                    size={14}
                                    color={theme.muted}
                                />
                                <Text
                                    style={[
                                        styles.infoLabel,
                                        { color: theme.muted },
                                    ]}
                                >
                                    Número
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.infoValue,
                                    { color: theme.text },
                                ]}
                            >
                                {documentNumber}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <View style={styles.infoLabelRow}>
                                <Ionicons
                                    name="business-outline"
                                    size={14}
                                    color={theme.muted}
                                />
                                <Text
                                    style={[
                                        styles.infoLabel,
                                        { color: theme.muted },
                                    ]}
                                >
                                    Filial
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.infoValue,
                                    { color: theme.text },
                                ]}
                            >
                                {documentBranch || '-'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <View style={styles.infoLabelRow}>
                                <Ionicons
                                    name="cash-outline"
                                    size={14}
                                    color={theme.muted}
                                />
                                <Text
                                    style={[
                                        styles.infoLabel,
                                        { color: theme.muted },
                                    ]}
                                >
                                    Valor
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.infoValueHighlight,
                                    { color: theme.primary },
                                ]}
                            >
                                {formatCurrency(documentTotal, documentSymbol)}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <View style={styles.infoLabelRow}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={14}
                                    color={theme.muted}
                                />
                                <Text
                                    style={[
                                        styles.infoLabel,
                                        { color: theme.muted },
                                    ]}
                                >
                                    Data
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.infoValue,
                                    { color: theme.text },
                                ]}
                            >
                                {formatDate(documentCreated)}
                            </Text>
                        </View>
                    </View>

                    {documentUserName && (
                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <View style={styles.infoLabelRow}>
                                    <Ionicons
                                        name="person-circle-outline"
                                        size={14}
                                        color={theme.muted}
                                    />
                                    <Text
                                        style={[
                                            styles.infoLabel,
                                            { color: theme.muted },
                                        ]}
                                    >
                                        Usuário
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.infoValue,
                                        { color: theme.text },
                                    ]}
                                >
                                    {documentUserName}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>

            {/* LISTA DE ITENS */}
            <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
                <View style={styles.sectionHeaderRow}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            { color: theme.text },
                        ]}
                    >
                        Itens do documento
                    </Text>
                    <Text
                        style={[
                            styles.sectionCount,
                            { color: theme.muted },
                        ]}
                    >
                        {items.length} item(s)
                    </Text>
                </View>

                {loading && items.length === 0 ? (
                    <LoadingOverlay visible text="Carregando itens..." />
                ) : items.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="document-outline"
                            size={48}
                            color={theme.muted}
                        />
                        <Text
                            style={[
                                styles.emptyText,
                                { color: theme.muted },
                            ]}
                        >
                            Nenhum item encontrado
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={items}
                        keyExtractor={(item, index) =>
                            (item as any).purchaseOrderItem ||
                            (item as any).requestItem ||
                            `item-${index}`
                        }
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={refresh}
                                tintColor={theme.primary}
                                colors={[theme.primary]}
                            />
                        }
                        renderItem={renderItem}
                        onEndReached={hasNext ? loadMore : undefined}
                        onEndReachedThreshold={0.3}
                        contentContainerStyle={{
                            paddingBottom: isPending ? 96 : 24,
                        }}
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

            {/* FOOTER */}
            {isPending && (
                <View
                    style={[
                        styles.footer,
                        { backgroundColor: theme.surface },
                    ]}
                >
                    <TouchableOpacity
                        style={[
                            styles.footerButton,
                            { backgroundColor: theme.error },
                        ]}
                        onPress={handleReject}
                    >
                        <Ionicons
                            name="close-circle-outline"
                            size={18}
                            color="#fff"
                        />
                        <Text style={styles.footerButtonText}>Reprovar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.footerButton,
                            { backgroundColor: theme.success },
                        ]}
                        onPress={handleApprove}
                    >
                        <Ionicons
                            name="checkmark-circle-outline"
                            size={18}
                            color="#fff"
                        />
                        <Text style={styles.footerButtonText}>Aprovar</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* MODAIS */}
            <ItemAdditionalInfoModal
                visible={additionalInfoModal.visible}
                onClose={() =>
                    setAdditionalInfoModal((prev) => ({
                        ...prev,
                        visible: false,
                    }))
                }
                recordNumber={additionalInfoModal.recordNumber}
                itemNumber={additionalInfoModal.itemNumber}
                itemRecno={additionalInfoModal.itemRecno}
                itemDescription={additionalInfoModal.itemDescription}
            />

            <ItemHistoryModal
                visible={historyModal.visible}
                onClose={() =>
                    setHistoryModal((prev) => ({ ...prev, visible: false }))
                }
                productCode={historyModal.productCode}
                itemDescription={historyModal.itemDescription}
            />

            <ApprovalModal
                visible={approvalModal.visible}
                onClose={() => setApprovalModal({ visible: false })}
                documents={[
                    {
                        scrId: parseInt(scrId),
                        documentType,
                        documentNumber,
                        documentStatus,
                        documentBranch,
                        documentTotal: parseFloat(documentTotal) || 0,
                        documentGroupAprov,
                        documentItemGroup: '',
                    } as any,
                ]}
                onConfirm={handleApprovalConfirm}
            />

            <LoadingOverlay visible={processing} text="Processando..." isbg />
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerSubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    headerSubtitle: {
        fontSize: 13,
        flexShrink: 1,
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 3,
        gap: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 10,
    },
    menuText: {
        fontSize: 14,
    },

    infoCard: {
        marginTop: 10,
        marginBottom: 6,
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        gap: 10,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 4,
    },
    infoItem: {
        flex: 1,
    },
    infoLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    infoValueHighlight: {
        fontSize: 16,
        fontWeight: '700',
    },

    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    sectionCount: {
        fontSize: 13,
    },

    itemCard: {
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        gap: 10,
    },
    itemAccentBar: {
        width: 4,
        borderRadius: 999,
    },
    itemHeaderRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    itemSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    itemBadge: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'flex-start',
    },
    itemRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 6,
    },
    itemDetail: {
        flex: 1,
    },
    itemLabel: {
        fontSize: 11,
        marginBottom: 2,
    },
    itemValue: {
        fontSize: 13,
        fontWeight: '500',
    },
    itemActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    itemButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 1.5,
        borderRadius: 999,
        paddingVertical: 7,
        paddingHorizontal: 10,
    },
    itemButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },

    footer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    footerButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    footerButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
    },
});
