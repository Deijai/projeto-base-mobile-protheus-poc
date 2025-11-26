// app/approval-history.tsx
import { ThemedSafeArea } from '@/src/components/layout/ThemedSafeArea';
import { LoadingOverlay } from '@/src/components/ui/LoadingOverlay';
import { useTheme } from '@/src/hooks/useTheme';
import { useToast } from '@/src/hooks/useToast';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { documentService } from '../src/api/documentService';

type HistoryItem = {
    approvalName: string;
    status: string;
    approvalDate: string;
    justification: string;
};

type Legend = {
    status: string;
    color: string;
    percentage: number;
    count: number;
};

export default function ApprovalHistoryScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const toast = useToast();
    const params = useLocalSearchParams();

    const documentNumber = params.documentNumber as string;
    const scrId = params.scrId as string;
    const documentType = params.documentType as string;

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [legends, setLegends] = useState<Legend[]>([]);
    const [approvalPercentage, setApprovalPercentage] = useState(0);
    const [expandedJustifications, setExpandedJustifications] = useState<Record<number, boolean>>(
        {}
    );

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);

            console.log('📜 Carregando histórico:', scrId);

            const response = await documentService.getApprovalHistory(scrId);

            console.log('✅ Histórico carregado:', response);

            if (response?.approvalHistory) {
                setHistory(response.approvalHistory);
                calculateInsights(response.approvalHistory);
            } else {
                setHistory([]);
            }
        } catch (error: any) {
            console.error('❌ Erro ao carregar histórico:', error);
            toast.error(error?.message || 'Erro ao carregar histórico');
            setHistory([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const calculateInsights = (historyData: HistoryItem[]) => {
        const statusMap: Record<string, { count: number; color: string }> = {
            'Liberado por outro aprovador': { count: 0, color: '#10B981' },
            'Aguardando liberação': { count: 0, color: '#F97777' },
            'Liberado': { count: 0, color: '#0C9ABE' },
            'Bloqueado': { count: 0, color: '#000000' },
            'Reprovado': { count: 0, color: '#FF0000' },
            'Aguardando nível anterior': { count: 0, color: '#0000FF' },
            'Outros': { count: 0, color: '#808080' },
        };

        let approvedCount = 0;

        historyData.forEach((item) => {
            const status = item.status.trim();

            if (status === 'Liberado') {
                approvedCount++;
            }

            if (statusMap[status]) {
                statusMap[status].count++;
            } else {
                statusMap['Outros'].count++;
            }
        });

        const totalCount = historyData.length || 1;
        const percentage = (approvedCount / totalCount) * 100;

        setApprovalPercentage(percentage);

        const legendsData: Legend[] = Object.entries(statusMap)
            .filter(([, data]) => data.count > 0)
            .map(([status, data]) => ({
                status,
                color: data.color,
                count: data.count,
                percentage: (data.count / totalCount) * 100,
            }));

        setLegends(legendsData);
    };

    const getStatusColor = (status: string): string => {
        const statusColors: Record<string, string> = {
            'Liberado por outro aprovador': '#10B981',
            'Aguardando liberação': '#F97777',
            'Liberado': '#0C9ABE',
            'Bloqueado': '#000000',
            'Reprovado': '#FF0000',
            'Aguardando nível anterior': '#0000FF',
        };

        return statusColors[status.trim()] || '#808080';
    };

    const toggleJustification = (index: number) => {
        setExpandedJustifications((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadHistory();
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr.length !== 8) return dateStr;
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${day}/${month}/${year}`;
    };

    return (
        <ThemedSafeArea style={{ flex: 1, backgroundColor: theme.background }}>
            {/* HEADER */}
            <View style={[styles.header, { backgroundColor: theme.surface }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.primary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>
                        Histórico de Aprovações
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: theme.muted }]}>
                        Documento: {documentNumber}
                    </Text>
                </View>
            </View>

            {loading && history.length === 0 ? (
                <LoadingOverlay visible text="Carregando histórico..." />
            ) : history.length === 0 ? (
                // EMPTY STATE
                <View style={styles.emptyContainer}>
                    <Ionicons name="time-outline" size={64} color={theme.muted} />
                    <Text style={[styles.emptyText, { color: theme.muted }]}>
                        Nenhum histórico encontrado
                    </Text>
                </View>
            ) : (
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.primary}
                            colors={[theme.primary]}
                        />
                    }
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* CARD DE INSIGHTS */}
                    <View
                        style={[
                            styles.insightCard,
                            {
                                backgroundColor: theme.surface,
                                borderColor: theme.border,
                            },
                        ]}
                    >
                        <Text style={[styles.insightTitle, { color: theme.text }]}>
                            {documentType}: {documentNumber}
                        </Text>
                        <Text style={[styles.insightPercentage, { color: theme.primary }]}>
                            Liberado {approvalPercentage.toFixed(1)}%
                        </Text>

                        {/* PROGRESS BAR */}
                        <View style={[styles.progressOuter, { backgroundColor: '#E4F8FF' }]}>
                            <View
                                style={[
                                    styles.progressInner,
                                    {
                                        width: `${approvalPercentage}%`,
                                        backgroundColor: theme.primary,
                                    },
                                ]}
                            />
                        </View>

                        {/* LEGENDS */}
                        <View style={styles.legendsContainer}>
                            {legends.map((legend, index) => (
                                <View key={index} style={styles.legendItem}>
                                    <View
                                        style={[
                                            styles.legendColor,
                                            { backgroundColor: legend.color },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.legendText,
                                            { color: theme.text },
                                        ]}
                                    >
                                        {legend.status}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.legendPercentage,
                                            { color: theme.muted },
                                        ]}
                                    >
                                        {legend.percentage.toFixed(1)}%
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* TIMELINE */}
                    <View style={styles.timelineContainer}>
                        {history.map((item, index) => {
                            const isExpanded = expandedJustifications[index];
                            const statusColor = getStatusColor(item.status);
                            const isLast = index === history.length - 1;

                            return (
                                <View key={index} style={styles.timelineItem}>
                                    {/* TIMELINE LINE */}
                                    {!isLast && (
                                        <View
                                            style={[
                                                styles.timelineLine,
                                                { backgroundColor: theme.border },
                                            ]}
                                        />
                                    )}

                                    {/* TIMELINE DOT */}
                                    <View
                                        style={[
                                            styles.timelineDot,
                                            { backgroundColor: statusColor },
                                        ]}
                                    />

                                    {/* TIMELINE CARD */}
                                    <View
                                        style={[
                                            styles.historyCard,
                                            {
                                                backgroundColor: theme.surface,
                                                borderColor: theme.border,
                                                borderLeftColor: statusColor,
                                            },
                                        ]}
                                    >
                                        {/* APPROVER NAME */}
                                        {item.approvalName.trim().length > 0 && (
                                            <Text
                                                style={[
                                                    styles.approverName,
                                                    { color: theme.text },
                                                ]}
                                            >
                                                {item.approvalName}
                                            </Text>
                                        )}

                                        {/* STATUS + DATE */}
                                        <View style={styles.statusRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text
                                                    style={[
                                                        styles.label,
                                                        { color: theme.muted },
                                                    ]}
                                                >
                                                    Status
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.statusText,
                                                        { color: statusColor },
                                                    ]}
                                                >
                                                    {item.status}
                                                </Text>
                                            </View>
                                            {item.approvalDate.trim().length > 0 && (
                                                <View style={{ alignItems: 'flex-end' }}>
                                                    <Text
                                                        style={[
                                                            styles.label,
                                                            { color: theme.muted },
                                                        ]}
                                                    >
                                                        Data
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.dateText,
                                                            { color: theme.text },
                                                        ]}
                                                    >
                                                        {formatDate(item.approvalDate)}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* JUSTIFICATION */}
                                        <TouchableOpacity
                                            onPress={() => toggleJustification(index)}
                                            style={styles.justificationToggle}
                                        >
                                            <Text
                                                style={[
                                                    styles.label,
                                                    { color: theme.muted },
                                                ]}
                                            >
                                                Justificativa
                                            </Text>
                                            <Ionicons
                                                name={
                                                    isExpanded
                                                        ? 'chevron-up-outline'
                                                        : 'chevron-down-outline'
                                                }
                                                size={18}
                                                color={theme.muted}
                                            />
                                        </TouchableOpacity>

                                        {isExpanded && (
                                            <View style={styles.justificationContent}>
                                                <Text
                                                    style={[
                                                        styles.justificationText,
                                                        { color: theme.text },
                                                    ]}
                                                >
                                                    {item.justification.trim().length > 0
                                                        ? item.justification
                                                        : 'Sem justificativa'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
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
        borderBottomColor: '#f0f0f0',
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
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    scrollContent: {
        padding: 16,
    },
    insightCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 24,
    },
    insightTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    insightPercentage: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 8,
    },
    progressOuter: {
        height: 8,
        borderRadius: 4,
        marginTop: 12,
        overflow: 'hidden',
    },
    progressInner: {
        height: '100%',
        borderRadius: 4,
    },
    legendsContainer: {
        marginTop: 16,
        gap: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    legendText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
    },
    legendPercentage: {
        fontSize: 13,
        fontWeight: '600',
    },
    timelineContainer: {
        position: 'relative',
    },
    timelineItem: {
        position: 'relative',
        paddingLeft: 32,
        marginBottom: 16,
    },
    timelineLine: {
        position: 'absolute',
        left: 11,
        top: 24,
        width: 2,
        bottom: -16,
    },
    timelineDot: {
        position: 'absolute',
        left: 4,
        top: 16,
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    historyCard: {
        borderRadius: 12,
        borderWidth: 1,
        borderLeftWidth: 4,
        padding: 12,
        gap: 12,
    },
    approverName: {
        fontSize: 16,
        fontWeight: '700',
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    label: {
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
    },
    justificationToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    justificationContent: {
        paddingTop: 8,
    },
    justificationText: {
        fontSize: 14,
        lineHeight: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
    },
});