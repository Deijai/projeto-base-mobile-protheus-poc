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
    View
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

    // 📝 Params vindos da navegação
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

    // 🏪 Store
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

    // 🏪 Store de aprovações (para batchProcess)
    const { batchProcess } = useApprovalsStore();

    // 🎯 Estados dos modais
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

    // 🎯 Estado de processamento
    const [processing, setProcessing] = useState(false);

    console.log('📄 [DocumentDetail] Params recebidos:', {
        scrId,
        documentType,
        documentNumber,
        documentStatus,
    });

    // 🎨 Configurações por tipo de documento
    const getDocumentConfig = () => {
        const type = documentType?.toUpperCase();
        switch (type) {
            case 'SC':
                return {
                    title: 'Solicitação de Compra',
                    showApportionment: true,
                };
            case 'PC':
                return {
                    title: 'Pedido de Compra',
                    showApportionment: true,
                };
            case 'IP':
                return {
                    title: 'Pedido de Compra (Item)',
                    showApportionment: true,
                };
            case 'AE':
                return {
                    title: 'Autorização de Entrega',
                    showApportionment: true,
                };
            case 'SA':
                return {
                    title: 'Requisição de Almoxarifado',
                    showApportionment: false,
                };
            case 'CT':
                return {
                    title: 'Contrato',
                    showApportionment: false,
                };
            case 'MD':
                return {
                    title: 'Medição',
                    showApportionment: false,
                };
            default:
                return {
                    title: 'Documento',
                    showApportionment: false,
                };
        }
    };

    const config = getDocumentConfig();

    // 🎬 Carregar na primeira vez
    useEffect(() => {
        console.log('🎬 [DocumentDetail] Componente montado');

        // Define documento atual no store
        setCurrentDocument(Number(scrId), documentType, documentNumber);

        // Carrega itens usando scrId ao invés de documentNumber
        fetchItems(documentType, scrId, true); // ✅ MUDADO: passa scrId

        // Cleanup ao desmontar
        return () => {
            console.log('🧹 [DocumentDetail] Componente desmontado - limpando store');
            clear();
        };
    }, [scrId, documentType, documentNumber]);

    // 📋 Renderizar item baseado no tipo
    const renderItem = ({ item }: { item: any }) => {
        // 🎯 Detecta o tipo de item baseado nos campos presentes
        const isPurchaseOrder = 'purchaseOrderItem' in item;
        const isPurchaseRequest = 'requestItem' in item;

        // 📦 Normaliza os dados
        const itemData = {
            // Campos comuns
            description: item.itemSkuDescription || '',
            code: isPurchaseOrder ? item.itemSku : item.itemProduct,
            costCenter: item.costCenter || '-',
            quantity: item.quantity,
            unitMeasurement: item.unitMeasurement,
            currency: item.currency || documentSymbol,
            itemTotal: item.itemTotal,
            unitValue: item.unitValue,
            // Campos específicos
            itemNumber: isPurchaseOrder ? item.purchaseOrderItem : item.requestItem,
        };

        return (
            <View
                style={[
                    styles.itemCard,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
            >
                {/* Título */}
                <Text style={[styles.itemTitle, { color: theme.text }]}>
                    {itemData.description}
                </Text>
                <Text style={[styles.itemSubtitle, { color: theme.muted }]}>
                    {itemData.code}
                </Text>

                {/* Linha 1: Centro de Custo, Quantidade, Unidade */}
                <View style={styles.itemRow}>
                    <View style={styles.itemDetail}>
                        <Text style={[styles.itemLabel, { color: theme.muted }]}>
                            Centro de Custo
                        </Text>
                        <Text style={[styles.itemValue, { color: theme.text }]}>
                            {itemData.costCenter}
                        </Text>
                    </View>
                    <View style={styles.itemDetail}>
                        <Text style={[styles.itemLabel, { color: theme.muted }]}>
                            Quantidade
                        </Text>
                        <Text style={[styles.itemValue, { color: theme.text }]}>
                            {itemData.quantity}
                        </Text>
                    </View>
                    <View style={styles.itemDetail}>
                        <Text style={[styles.itemLabel, { color: theme.muted }]}>
                            Unidade
                        </Text>
                        <Text style={[styles.itemValue, { color: theme.text }]}>
                            {itemData.unitMeasurement}
                        </Text>
                    </View>
                </View>

                {/* Linha 2: Valor Unitário e Valor Total (apenas para PC/IP/AE) */}
                {isPurchaseOrder && (
                    <View style={styles.itemRow}>
                        <View style={styles.itemDetail}>
                            <Text style={[styles.itemLabel, { color: theme.muted }]}>
                                Valor Unitário
                            </Text>
                            <Text style={[styles.itemValue, { color: theme.text }]}>
                                {formatCurrency(itemData.unitValue, itemData.currency)}
                            </Text>
                        </View>
                        <View style={styles.itemDetail}>
                            <Text style={[styles.itemLabel, { color: theme.muted }]}>
                                Valor Total
                            </Text>
                            <Text style={[styles.itemValue, { color: theme.text }]}>
                                {formatCurrency(itemData.itemTotal, itemData.currency)}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Linha 3: Valor Total (apenas para SC) */}
                {isPurchaseRequest && (
                    <View style={styles.itemRow}>
                        <View style={styles.itemDetail}>
                            <Text style={[styles.itemLabel, { color: theme.muted }]}>
                                Valor Total
                            </Text>
                            <Text style={[styles.itemValue, { color: theme.text }]}>
                                {formatCurrency(itemData.itemTotal, itemData.currency)}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Botões */}
                <View style={styles.itemActions}>
                    <TouchableOpacity
                        onPress={() => handleViewMore(item)}
                        style={[
                            styles.itemButton,
                            { borderColor: theme.primary, backgroundColor: theme.primary + '12' },
                        ]}
                    >
                        <Ionicons name="information-circle-outline" size={16} color={theme.primary} />
                        <Text style={[styles.itemButtonText, { color: theme.primary }]}>
                            Ver Mais
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleItemHistory(item)}
                        style={[
                            styles.itemButton,
                            { borderColor: theme.primary, backgroundColor: theme.primary + '12' },
                        ]}
                    >
                        <Ionicons name="time-outline" size={16} color={theme.primary} />
                        <Text style={[styles.itemButtonText, { color: theme.primary }]}>
                            Histórico
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // 🎯 Handlers de ações
    const handleViewMore = (item: any) => {
        console.log('👁️ Ver mais info do item:', item);

        // Detecta o tipo de item
        const isPurchaseOrder = 'purchaseOrderItem' in item;

        // Extrai os campos necessários
        const itemNumber = isPurchaseOrder ? item.purchaseOrderItem : item.requestItem;

        // ✅ PARA TODOS OS TIPOS: usa scrId do documento
        const itemRecno = parseInt(scrId) || 0;

        const itemDescription = item.itemSkuDescription || '';

        console.log('📋 Dados para buscar info adicional:', {
            recordNumber: documentNumber,
            itemNumber,
            itemRecno,
            itemDescription,
            documentType,
        });

        // Valida
        if (!itemRecno || itemRecno === 0) {
            console.error('❌ itemRecno inválido! scrId:', scrId);
            toast.error('ID do documento não encontrado');
            return;
        }

        // Abre o modal
        setAdditionalInfoModal({
            visible: true,
            recordNumber: documentNumber,
            itemNumber,
            itemRecno,
            itemDescription,
        });
    };

    const handleItemHistory = (item: any) => {
        console.log('📜 Histórico do item:', item);

        // Detecta o tipo de item
        const isPurchaseOrder = 'purchaseOrderItem' in item;

        // Extrai o código do produto
        const productCode = isPurchaseOrder ? item.itemSku : item.itemProduct;
        const itemDescription = item.itemSkuDescription || '';

        console.log('📋 Dados para buscar histórico:', {
            productCode,
            itemDescription,
        });

        // Abre o modal
        setHistoryModal({
            visible: true,
            productCode,
            itemDescription,
        });
    };

    const handleApprove = () => {
        console.log('✅ Abrir modal de aprovação');
        if (documentStatus !== '02') {
            toast.error('Apenas documentos pendentes podem ser aprovados');
            return;
        }
        setApprovalModal({ visible: true });
    };

    const handleReject = () => {
        console.log('❌ Abrir modal de reprovação');
        if (documentStatus !== '02') {
            toast.error('Apenas documentos pendentes podem ser reprovados');
            return;
        }
        setApprovalModal({ visible: true });
    };

    // Handler do modal de aprovação
    const handleApprovalConfirm = async ({ action, justification }: any) => {
        try {
            setProcessing(true);

            console.log('📋 Processando aprovação:', { action, justification });

            // Monta o documento no formato esperado pelo batchProcess
            const documentToProcess = {
                scrId: parseInt(scrId),
                documentType,
                documentNumber,
                documentStatus,
                documentBranch,
                documentTotal: parseFloat(documentTotal) || 0,
                documentGroupAprov,
                documentItemGroup: '', // não temos esse campo aqui
            };

            console.log('📄 Documento a processar:', documentToProcess);

            // Chama batchProcess com 1 documento
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

            // Volta para lista após 1 segundo
            setTimeout(() => {
                router.back();
            }, 1000);
        } catch (error: any) {
            console.error('❌ Erro ao processar:', error);
            toast.error(`Erro: ${error?.message || 'Não foi possível processar'}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleOpenAttachments = () => {
        console.log('📎 Abrir anexos:', scrId);
        toast.info('Tela de anexos em desenvolvimento');
    };

    const handleOpenHistory = () => {
        console.log('📜 Abrir histórico:', documentNumber);
        toast.info('Tela de histórico em desenvolvimento');
    };

    const handleOpenApportionment = () => {
        console.log('📊 Abrir rateio:', documentNumber);
        toast.info('Tela de rateio em desenvolvimento');
    };

    // 📅 Formatar data YYYYMMDD → DD/MM/YYYY
    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr.length !== 8) return dateStr;
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${day}/${month}/${year}`;
    };

    // 💰 Formatar moeda
    const formatCurrency = (value: any, symbol = 'R$') => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return `${symbol} 0,00`;
        return `${symbol} ${num.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    // 🔴 Verifica se é pendente (pode aprovar/reprovar)
    const isPending = documentStatus === '02';

    // 🚨 Mostra erro se houver
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    return (
        <ThemedSafeArea style={{ flex: 1, backgroundColor: theme.background }}>
            {/* HEADER */}
            <View style={[styles.header, { backgroundColor: theme.surface }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.primary} />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>
                        {config.title}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: theme.muted }]}>
                        {documentNumber}
                    </Text>
                </View>

                <Menu>
                    <MenuTrigger>
                        <View style={styles.menuButton}>
                            <Ionicons name="ellipsis-vertical" size={20} color={theme.text} />
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
                                <Ionicons name="attach-outline" size={20} color={theme.text} />
                                <Text style={[styles.menuText, { color: theme.text }]}>
                                    Anexos
                                </Text>
                            </View>
                        </MenuOption>
                        <MenuOption onSelect={handleOpenHistory}>
                            <View style={styles.menuItem}>
                                <Ionicons name="time-outline" size={20} color={theme.text} />
                                <Text style={[styles.menuText, { color: theme.text }]}>
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
                                    <Text style={[styles.menuText, { color: theme.text }]}>
                                        Rateio
                                    </Text>
                                </View>
                            </MenuOption>
                        )}
                    </MenuOptions>
                </Menu>
            </View>

            {/* INFORMAÇÕES DO DOCUMENTO - FIXO */}
            <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={[styles.infoLabel, { color: theme.muted }]}>
                            Grupo de Aprovação
                        </Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>
                            {documentGroupAprov || '-'}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={[styles.infoLabel, { color: theme.muted }]}>Número</Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>
                            {documentNumber}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={[styles.infoLabel, { color: theme.muted }]}>Filial</Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>
                            {documentBranch || '-'}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={[styles.infoLabel, { color: theme.muted }]}>Valor</Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>
                            {formatCurrency(documentTotal, documentSymbol)}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={[styles.infoLabel, { color: theme.muted }]}>Data</Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>
                            {formatDate(documentCreated)}
                        </Text>
                    </View>
                </View>

                {documentUserName && (
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Text style={[styles.infoLabel, { color: theme.muted }]}>
                                Usuário
                            </Text>
                            <Text style={[styles.infoValue, { color: theme.text }]}>
                                {documentUserName}
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* LISTA DE ITENS - COM SCROLL */}
            <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
                <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>
                    Itens do Documento ({items.length})
                </Text>

                {loading && items.length === 0 ? (
                    <LoadingOverlay visible text="Carregando itens..." />
                ) : items.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-outline" size={48} color={theme.muted} />
                        <Text style={[styles.emptyText, { color: theme.muted }]}>
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
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.3}
                        contentContainerStyle={{ paddingBottom: isPending ? 80 : 16 }}
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

            {/* FOOTER COM BOTÕES (apenas para pendentes) */}
            {isPending && (
                <View style={[styles.footer, { backgroundColor: theme.surface }]}>
                    <TouchableOpacity
                        style={[styles.footerButton, { backgroundColor: theme.error }]}
                        onPress={handleReject}
                    >
                        <Text style={styles.footerButtonText}>Reprovar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.footerButton, { backgroundColor: theme.success }]}
                        onPress={handleApprove}
                    >
                        <Text style={styles.footerButtonText}>Aprovar</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* MODAL DE INFORMAÇÕES ADICIONAIS */}
            <ItemAdditionalInfoModal
                visible={additionalInfoModal.visible}
                onClose={() =>
                    setAdditionalInfoModal((prev) => ({ ...prev, visible: false }))
                }
                recordNumber={additionalInfoModal.recordNumber}
                itemNumber={additionalInfoModal.itemNumber}
                itemRecno={additionalInfoModal.itemRecno}
                itemDescription={additionalInfoModal.itemDescription}
            />

            {/* MODAL DE HISTÓRICO */}
            <ItemHistoryModal
                visible={historyModal.visible}
                onClose={() => setHistoryModal((prev) => ({ ...prev, visible: false }))}
                productCode={historyModal.productCode}
                itemDescription={historyModal.itemDescription}
            />

            {/* MODAL DE APROVAÇÃO */}
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

            {/* LOADING OVERLAY */}
            <LoadingOverlay visible={processing} text="Processando..." isbg />
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
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
        fontWeight: '600',
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
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
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 12,
    },
    menuText: {
        fontSize: 14,
    },
    infoCard: {
        margin: 16,
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 16,
    },
    infoItem: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    itemCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        gap: 8,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    itemSubtitle: {
        fontSize: 13,
    },
    itemRow: {
        flexDirection: 'row',
        gap: 12,
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
        marginTop: 8,
    },
    itemButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 1.5,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    itemButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    footerButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    footerButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
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