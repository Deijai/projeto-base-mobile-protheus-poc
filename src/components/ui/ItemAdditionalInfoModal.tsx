// src/components/ui/ItemAdditionalInfoModal.tsx
import { useTheme } from '@/src/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { documentService } from '../../api/documentService';
import { useToast } from '../../hooks/useToast';

type AdditionalInfoItem = {
    label: string;
    data: string;
    type: 'D' | 'N' | 'C'; // D = Date, N = Number (monetary), C = Character
};

type Props = {
    visible: boolean;
    onClose: () => void;
    recordNumber: string;
    itemNumber: string;
    itemRecno: number;
    itemDescription: string;
};

export const ItemAdditionalInfoModal: React.FC<Props> = ({
    visible,
    onClose,
    recordNumber,
    itemNumber,
    itemRecno,
    itemDescription,
}) => {
    const { theme } = useTheme();
    const toast = useToast();

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<AdditionalInfoItem[]>([]);

    useEffect(() => {
        if (visible) {
            loadAdditionalInfo();
        } else {
            // Reset ao fechar
            setItems([]);
        }
    }, [visible]);

    const loadAdditionalInfo = async () => {
        try {
            setLoading(true);
            const response = await documentService.getItemAdditionalInfo(
                recordNumber,
                itemNumber,
                itemRecno
            );

            if (response?.itemsAdditionalInformation) {
                const infoArray = response.itemsAdditionalInformation;
                setItems(infoArray);
            } else {
                setItems([]);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Erro ao carregar informações adicionais');
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const formatValue = (item: AdditionalInfoItem) => {
        if (!item.data) return '-';

        switch (item.type) {
            case 'D': // Date
                return formatDate(item.data);
            case 'N': // Number (monetary)
                return formatCurrency(item.data);
            default: // Character
                return item.data;
        }
    };

    const formatDate = (dateString: string) => {
        try {
            // Se vier no formato YYYY-MM-DD ou YYYYMMDD
            const cleaned = dateString.replace(/[^0-9]/g, '');
            if (cleaned.length >= 8) {
                const year = cleaned.substring(0, 4);
                const month = cleaned.substring(4, 6);
                const day = cleaned.substring(6, 8);
                return `${day}/${month}/${year}`;
            }
            return dateString;
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (value: string) => {
        try {
            const num = parseFloat(value);
            if (isNaN(num)) return value;
            return num.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            });
        } catch {
            return value;
        }
    };

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
                        <Text style={[styles.title, { color: theme.text }]}>
                            Informações Adicionais
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {/* LOADING */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.primary} />
                            <Text style={[styles.loadingText, { color: theme.muted }]}>
                                Carregando informações...
                            </Text>
                        </View>
                    ) : items.length === 0 ? (
                        // EMPTY STATE
                        <View style={styles.emptyContainer}>
                            <Ionicons
                                name="information-circle-outline"
                                size={64}
                                color={theme.muted}
                            />
                            <Text style={[styles.emptyText, { color: theme.muted }]}>
                                Nenhuma informação adicional encontrada
                            </Text>
                        </View>
                    ) : (
                        // CONTENT
                        <ScrollView
                            style={styles.content}
                            contentContainerStyle={styles.contentContainer}
                        >
                            {/* DESCRIÇÃO DO ITEM */}
                            <Text style={[styles.itemDescription, { color: theme.text }]}>
                                {itemDescription}
                            </Text>

                            {/* LISTA DE INFORMAÇÕES */}
                            {items.map((item, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.infoItem,
                                        {
                                            backgroundColor: theme.surface,
                                            borderColor: theme.border,
                                        },
                                    ]}
                                >
                                    <Text style={[styles.label, { color: theme.muted }]}>
                                        {item.label.trim()}
                                    </Text>
                                    <Text style={[styles.value, { color: theme.text }]}>
                                        {formatValue(item)}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
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
        height: '75%',  // ✅ Altura fixa
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    itemDescription: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 24,
    },
    infoItem: {
        padding: 16,  // ✅ Padding interno
        borderRadius: 12,  // ✅ Bordas arredondadas
        marginBottom: 12,  // ✅ Espaço entre cards
        borderWidth: 1,  // ✅ Borda
    },
    label: {
        fontSize: 13,  // ✅ Maior
        fontWeight: '600',  // ✅ Mais bold
        marginBottom: 8,  // ✅ Mais espaço
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 16,  // ✅ Maior
        fontWeight: '400',
        lineHeight: 24,  // ✅ Mais espaço entre linhas
    },
});