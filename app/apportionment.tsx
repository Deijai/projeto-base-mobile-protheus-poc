// app/apportionment.tsx - VERSÃO FINAL COM SCROLL HORIZONTAL E INFINITE SCROLL
import { ThemedSafeArea } from '@/src/components/layout/ThemedSafeArea';
import { LoadingOverlay } from '@/src/components/ui/LoadingOverlay';
import { useTheme } from '@/src/hooks/useTheme';
import { useToast } from '@/src/hooks/useToast';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { documentService } from '../src/api/documentService';

// 📊 Tipos
type ApportionmentItem = {
    item: string;
    perc: number;
    cc: string;
    cc_desc: string;
    conta: string;
    itemcta: string;
    clvl: string;
    ec05db: string;
    ec05cr: string;
    ec06db: string;
    ec06cr: string;
    ec07db: string;
    ec07cr: string;
    ec08db: string;
    ec08cr: string;
    ec09db: string;
    ec09cr: string;
};

type GroupedItem = {
    itemDoc: string;
    items: ApportionmentItem[];
};

export default function ApportionmentScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const toast = useToast();
    const params = useLocalSearchParams();

    const documentNumber = params.documentNumber as string;
    const documentType = params.documentType as string;

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [groupedData, setGroupedData] = useState<GroupedItem[]>([]);
    const [documentTitle, setDocumentTitle] = useState('');
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [openMap, setOpenMap] = useState<{ [key: number]: boolean }>({});

    // 🔄 CARREGA DADOS
    const loadApportionment = async (reset = false) => {
        try {
            if (reset) {
                setLoading(true);
                setPage(1);
                setGroupedData([]);
            }

            const currentPage = reset ? 1 : page;
            const type = documentType.toUpperCase();

            let response;

            if (type === 'SC') {
                // Solicitação de Compra
                response = await documentService.getApportionmentPurchaseRequest(
                    documentNumber,
                    currentPage,
                    10
                );

                if (response?.items?.length > 0) {
                    const title = response.items[0]?.cx_solicit || documentNumber;
                    setDocumentTitle(title);

                    // Agrupa por item
                    const grouped = response.items.reduce((acc: any, curr: any) => {
                        const key = `${curr.cx_itemsol} - ${curr.c1_descri}`;

                        if (!acc[key]) {
                            acc[key] = [];
                        }

                        acc[key].push({
                            item: curr.cx_item,
                            perc: parseFloat(curr.cx_perc) || 0,
                            cc: curr.cx_cc,
                            cc_desc: curr.ctt_desc01 || '',
                            conta: curr.cx_conta,
                            itemcta: curr.cx_itemcta,
                            clvl: curr.cx_clvl,
                            ec05db: curr.cx_ec05db || '',
                            ec05cr: curr.cx_ec05cr || '',
                            ec06db: curr.cx_ec06db || '',
                            ec06cr: curr.cx_ec06cr || '',
                            ec07db: curr.cx_ec07db || '',
                            ec07cr: curr.cx_ec07cr || '',
                            ec08db: curr.cx_ec08db || '',
                            ec08cr: curr.cx_ec08cr || '',
                            ec09db: curr.cx_ec09db || '',
                            ec09cr: curr.cx_ec09cr || '',
                        });

                        return acc;
                    }, {});

                    const groupedArray = Object.entries(grouped).map(([itemDoc, items]) => ({
                        itemDoc,
                        items: items as ApportionmentItem[],
                    }));

                    if (reset) {
                        setGroupedData(groupedArray);
                    } else {
                        setGroupedData((prev) => [...prev, ...groupedArray]);
                    }

                    setHasNext(response.hasNext ?? false);
                }
            } else {
                // Pedido de Compra (PC, IP, AE)
                response = await documentService.getApportionmentPurchaseOrder(
                    documentNumber,
                    currentPage,
                    10
                );

                if (response?.items?.length > 0) {
                    const title = response.items[0]?.ch_pedido || documentNumber;
                    setDocumentTitle(title);

                    // Agrupa por item
                    const grouped = response.items.reduce((acc: any, curr: any) => {
                        const key = `${curr.ch_itempd} - ${curr.c7_descri}`;

                        if (!acc[key]) {
                            acc[key] = [];
                        }

                        acc[key].push({
                            item: curr.ch_item,
                            perc: parseFloat(curr.ch_perc) || 0,
                            cc: curr.ch_cc,
                            cc_desc: curr.ctt_desc01 || '',
                            conta: curr.ch_conta,
                            itemcta: curr.ch_itemcta,
                            clvl: curr.ch_clvl,
                            ec05db: curr.ch_ec05db || '',
                            ec05cr: curr.ch_ec05cr || '',
                            ec06db: curr.ch_ec06db || '',
                            ec06cr: curr.ch_ec06cr || '',
                            ec07db: curr.ch_ec07db || '',
                            ec07cr: curr.ch_ec07cr || '',
                            ec08db: curr.ch_ec08db || '',
                            ec08cr: curr.ch_ec08cr || '',
                            ec09db: curr.ch_ec09db || '',
                            ec09cr: curr.ch_ec09cr || '',
                        });

                        return acc;
                    }, {});

                    const groupedArray = Object.entries(grouped).map(([itemDoc, items]) => ({
                        itemDoc,
                        items: items as ApportionmentItem[],
                    }));

                    if (reset) {
                        setGroupedData(groupedArray);
                    } else {
                        setGroupedData((prev) => [...prev, ...groupedArray]);
                    }

                    setHasNext(response.hasNext ?? false);
                }
            }
        } catch (error: any) {
            console.error('❌ Erro ao carregar rateio:', error);
            toast.error(error?.message || 'Erro ao carregar rateio');
            setGroupedData([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // 🔄 LOAD INICIAL
    useEffect(() => {
        loadApportionment(true);
    }, []);

    // 🔄 PULL TO REFRESH
    const handleRefresh = () => {
        setRefreshing(true);
        setPage(1);
        loadApportionment(true);
    };

    // ⬇️ INFINITE SCROLL
    const handleLoadMore = () => {
        if (!loading && hasNext) {
            setPage((prev) => prev + 1);
            loadApportionment(false);
        }
    };

    // 📂 TOGGLE ACCORDION
    const toggleGroup = (index: number) => {
        setOpenMap((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    // 📊 RENDER ITEM GROUP
    const renderGroupItem = ({ item, index }: { item: GroupedItem; index: number }) => {
        const isOpen = openMap[index] ?? false;

        return (
            <View
                style={[
                    styles.card,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
            >
                {/* HEADER */}
                <TouchableOpacity
                    onPress={() => toggleGroup(index)}
                    style={[styles.cardHeader, { backgroundColor: theme.background }]}
                >
                    <View style={[styles.iconBox, { backgroundColor: theme.primary }]}>
                        <Ionicons name="document-text-outline" size={20} color="#fff" />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={[styles.itemDoc, { color: theme.text }]}>
                            {item.itemDoc}
                        </Text>
                        <Text style={[styles.itemSubtitle, { color: theme.muted }]}>
                            {documentType === 'SC'
                                ? 'Solicitação de Compra'
                                : 'Pedido de Compra'}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {!isOpen && (
                            <View
                                style={[
                                    styles.badge,
                                    { backgroundColor: theme.primary + '22' },
                                ]}
                            >
                                <Text style={{ color: theme.primary, fontWeight: '600' }}>
                                    {item.items.length}
                                </Text>
                            </View>
                        )}
                        <Ionicons
                            name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                            size={20}
                            color={theme.text}
                        />
                    </View>
                </TouchableOpacity>

                {/* CONTEÚDO */}
                {isOpen && (
                    <View style={styles.cardContent}>
                        {/* 🔥 SCROLL HORIZONTAL */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator
                            style={styles.scrollContainer}
                            contentContainerStyle={styles.scrollContent}
                        >
                            <View style={styles.table}>
                                {/* HEADER DA TABELA */}
                                <View
                                    style={[
                                        styles.tableHeader,
                                        {
                                            backgroundColor: theme.background,
                                            borderColor: theme.border,
                                        },
                                    ]}
                                >
                                    <View style={[styles.col, styles.colItem]}>
                                        <Text style={[styles.headerText, { color: theme.primary }]}>
                                            Item
                                        </Text>
                                    </View>
                                    <View style={[styles.col, styles.colPerc]}>
                                        <Text style={[styles.headerText, { color: theme.primary }]}>
                                            Rateio %
                                        </Text>
                                    </View>
                                    <View style={[styles.col, styles.colCC]}>
                                        <Text style={[styles.headerText, { color: theme.primary }]}>
                                            Centro de Custo
                                        </Text>
                                    </View>
                                    <View style={[styles.col, styles.colConta]}>
                                        <Text style={[styles.headerText, { color: theme.primary }]}>
                                            Conta
                                        </Text>
                                    </View>
                                    <View style={[styles.col, styles.colENT]}>
                                        <Text style={[styles.headerText, { color: theme.primary }]}>
                                            ENT 05-09
                                        </Text>
                                    </View>
                                </View>

                                {/* LINHAS DA TABELA */}
                                {item.items.map((apport, idx) => (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.tableRow,
                                            {
                                                backgroundColor:
                                                    idx % 2 === 0 ? theme.surface : theme.background,
                                                borderColor: theme.border,
                                            },
                                        ]}
                                    >
                                        {/* ITEM */}
                                        <View style={[styles.col, styles.colItem]}>
                                            <Text style={[styles.cellTitle, { color: theme.text }]}>
                                                {apport.item}
                                            </Text>
                                            <Text style={[styles.cellSub, { color: theme.muted }]}>
                                                Item Conta: {apport.itemcta}
                                            </Text>
                                        </View>

                                        {/* RATEIO */}
                                        <View style={[styles.col, styles.colPerc]}>
                                            <View
                                                style={[
                                                    styles.percBadge,
                                                    { backgroundColor: theme.primary },
                                                ]}
                                            >
                                                <Text style={styles.percText}>
                                                    {apport.perc.toFixed(2)}%
                                                </Text>
                                            </View>
                                            <Text style={[styles.cellSub, { color: theme.muted }]}>
                                                Classe: {apport.clvl}
                                            </Text>
                                        </View>

                                        {/* CC */}
                                        <View style={[styles.col, styles.colCC]}>
                                            <Text style={[styles.cellTitle, { color: theme.text }]}>
                                                {apport.cc}
                                            </Text>
                                            <Text
                                                style={[styles.cellSub, { color: theme.muted }]}
                                                numberOfLines={2}
                                            >
                                                {apport.cc_desc}
                                            </Text>
                                        </View>

                                        {/* CONTA */}
                                        <View style={[styles.col, styles.colConta]}>
                                            <Text
                                                style={[styles.cellTitle, { color: theme.text }]}
                                                numberOfLines={2}
                                            >
                                                {apport.conta}
                                            </Text>
                                        </View>

                                        {/* ENT 05-09 */}
                                        <View style={[styles.col, styles.colENT]}>
                                            <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                            >
                                                <View style={styles.entContainer}>
                                                    {/* ENT 05 */}
                                                    <View
                                                        style={[
                                                            styles.entCard,
                                                            {
                                                                backgroundColor: theme.surface,
                                                                borderColor: theme.border,
                                                            },
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.entLabel,
                                                                { color: theme.primary },
                                                            ]}
                                                        >
                                                            ENT 05
                                                        </Text>
                                                        <View style={styles.entRow}>
                                                            <Text
                                                                style={[
                                                                    styles.entKey,
                                                                    { color: theme.muted },
                                                                ]}
                                                            >
                                                                Déb:
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.entValue,
                                                                    { color: theme.text },
                                                                ]}
                                                            >
                                                                {apport.ec05db || '-'}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.entRow}>
                                                            <Text
                                                                style={[
                                                                    styles.entKey,
                                                                    { color: theme.muted },
                                                                ]}
                                                            >
                                                                Cré:
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.entValue,
                                                                    { color: theme.text },
                                                                ]}
                                                            >
                                                                {apport.ec05cr || '-'}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {/* ENT 06 */}
                                                    <View
                                                        style={[
                                                            styles.entCard,
                                                            {
                                                                backgroundColor: theme.surface,
                                                                borderColor: theme.border,
                                                            },
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.entLabel,
                                                                { color: theme.primary },
                                                            ]}
                                                        >
                                                            ENT 06
                                                        </Text>
                                                        <View style={styles.entRow}>
                                                            <Text
                                                                style={[
                                                                    styles.entKey,
                                                                    { color: theme.muted },
                                                                ]}
                                                            >
                                                                Déb:
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.entValue,
                                                                    { color: theme.text },
                                                                ]}
                                                            >
                                                                {apport.ec06db || '-'}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.entRow}>
                                                            <Text
                                                                style={[
                                                                    styles.entKey,
                                                                    { color: theme.muted },
                                                                ]}
                                                            >
                                                                Cré:
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.entValue,
                                                                    { color: theme.text },
                                                                ]}
                                                            >
                                                                {apport.ec06cr || '-'}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {/* ENT 07 */}
                                                    <View
                                                        style={[
                                                            styles.entCard,
                                                            {
                                                                backgroundColor: theme.surface,
                                                                borderColor: theme.border,
                                                            },
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.entLabel,
                                                                { color: theme.primary },
                                                            ]}
                                                        >
                                                            ENT 07
                                                        </Text>
                                                        <View style={styles.entRow}>
                                                            <Text
                                                                style={[
                                                                    styles.entKey,
                                                                    { color: theme.muted },
                                                                ]}
                                                            >
                                                                Déb:
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.entValue,
                                                                    { color: theme.text },
                                                                ]}
                                                            >
                                                                {apport.ec07db || '-'}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.entRow}>
                                                            <Text
                                                                style={[
                                                                    styles.entKey,
                                                                    { color: theme.muted },
                                                                ]}
                                                            >
                                                                Cré:
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.entValue,
                                                                    { color: theme.text },
                                                                ]}
                                                            >
                                                                {apport.ec07cr || '-'}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {/* ENT 08 */}
                                                    <View
                                                        style={[
                                                            styles.entCard,
                                                            {
                                                                backgroundColor: theme.surface,
                                                                borderColor: theme.border,
                                                            },
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.entLabel,
                                                                { color: theme.primary },
                                                            ]}
                                                        >
                                                            ENT 08
                                                        </Text>
                                                        <View style={styles.entRow}>
                                                            <Text
                                                                style={[
                                                                    styles.entKey,
                                                                    { color: theme.muted },
                                                                ]}
                                                            >
                                                                Déb:
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.entValue,
                                                                    { color: theme.text },
                                                                ]}
                                                            >
                                                                {apport.ec08db || '-'}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.entRow}>
                                                            <Text
                                                                style={[
                                                                    styles.entKey,
                                                                    { color: theme.muted },
                                                                ]}
                                                            >
                                                                Cré:
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.entValue,
                                                                    { color: theme.text },
                                                                ]}
                                                            >
                                                                {apport.ec08cr || '-'}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {/* ENT 09 */}
                                                    <View
                                                        style={[
                                                            styles.entCard,
                                                            {
                                                                backgroundColor: theme.surface,
                                                                borderColor: theme.border,
                                                            },
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.entLabel,
                                                                { color: theme.primary },
                                                            ]}
                                                        >
                                                            ENT 09
                                                        </Text>
                                                        <View style={styles.entRow}>
                                                            <Text
                                                                style={[
                                                                    styles.entKey,
                                                                    { color: theme.muted },
                                                                ]}
                                                            >
                                                                Déb:
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.entValue,
                                                                    { color: theme.text },
                                                                ]}
                                                            >
                                                                {apport.ec09db || '-'}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.entRow}>
                                                            <Text
                                                                style={[
                                                                    styles.entKey,
                                                                    { color: theme.muted },
                                                                ]}
                                                            >
                                                                Cré:
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.entValue,
                                                                    { color: theme.text },
                                                                ]}
                                                            >
                                                                {apport.ec09cr || '-'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </ScrollView>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}
            </View>
        );
    };

    return (
        <ThemedSafeArea style={{ flex: 1, backgroundColor: theme.background }}>
            {/* HEADER */}
            <View
                style={[
                    styles.header,
                    { backgroundColor: theme.surface, borderBottomColor: theme.border },
                ]}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.primary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Rateio</Text>
                    {documentTitle && (
                        <Text style={[styles.headerSubtitle, { color: theme.muted }]}>
                            {documentTitle}
                        </Text>
                    )}
                </View>
            </View>

            {/* LISTA */}
            {loading && groupedData.length === 0 ? (
                <LoadingOverlay visible text="Carregando rateio..." />
            ) : groupedData.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="sad-outline" size={64} color={theme.muted} />
                    <Text style={[styles.emptyText, { color: theme.muted }]}>
                        Nenhum rateio encontrado
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={groupedData}
                    keyExtractor={(item, index) => `${item.itemDoc}-${index}`}
                    renderItem={renderGroupItem}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.primary}
                            colors={[theme.primary]}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                    ListFooterComponent={
                        loading && groupedData.length > 0 ? (
                            <ActivityIndicator
                                style={{ marginVertical: 16 }}
                                color={theme.primary}
                            />
                        ) : null
                    }
                />
            )}
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
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },

    // CARD
    card: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemDoc: {
        fontSize: 16,
        fontWeight: '600',
    },
    itemSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    cardContent: {
        padding: 16,
        paddingTop: 0,
    },

    // 🔥 SCROLL HORIZONTAL
    scrollContainer: {
        marginTop: 8,
    },
    scrollContent: {
        paddingRight: 16,
    },

    // TABELA
    table: {
        minWidth: 1000, // 👈 FORÇA LARGURA MÍNIMA PARA SCROLL
    },
    tableHeader: {
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginBottom: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
    },

    // COLUNAS
    col: {
        paddingHorizontal: 8,
    },
    colItem: {
        width: 150,
    },
    colPerc: {
        width: 120,
    },
    colCC: {
        width: 200,
    },
    colConta: {
        width: 150,
    },
    colENT: {
        flex: 1,
        minWidth: 600, // 👈 5 ENTs × 120px
    },

    // CELLS
    headerText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    cellTitle: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'monospace',
    },
    cellSub: {
        fontSize: 12,
        marginTop: 2,
    },
    percBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        alignSelf: 'flex-start',
    },
    percText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },

    // ENT CARDS
    entContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    entCard: {
        width: 120,
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
    },
    entLabel: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 6,
    },
    entRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    entKey: {
        fontSize: 12,
    },
    entValue: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'monospace',
    },

    // EMPTY STATE
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
    },
});