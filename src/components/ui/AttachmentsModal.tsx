// src/components/ui/AttachmentsModal.tsx
import { useTheme } from '@/src/hooks/useTheme';
import { useToast } from '@/src/hooks/useToast';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { documentService } from '../../api/documentService';

type AttachmentItem = {
    objectCode: string;
    name: string;
    description: string;
    extension: string;
    size: number;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    scrId: number;
    documentNumber: string;
};

export const AttachmentsModal: React.FC<Props> = ({
    visible,
    onClose,
    scrId,
    documentNumber,
}) => {
    const { theme } = useTheme();
    const toast = useToast();

    const [loading, setLoading] = useState(false);
    const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
    const [downloading, setDownloading] = useState<string | null>(null);

    // 👇 controla se estamos vendo uma imagem
    const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
    const isPreview = !!previewImageUri;

    useEffect(() => {
        if (visible) {
            loadAttachments();
        } else {
            setAttachments([]);
            setPreviewImageUri(null);
        }
    }, [visible]);

    const loadAttachments = async () => {
        try {
            setLoading(true);

            const response = await documentService.getAttachments(scrId, 1, 10);
            const items = response?.itemsAttachments || response?.items || [];

            if (items.length > 0) {
                const mapped = items.map((item: any) => {
                    const objectCode = item.code || item.objectCode || item.object_code || '';
                    const extension = (item.type || item.extension || item.ext || '')
                        .replace(/^\./, '')
                        .trim();

                    let sizeInBytes = item.size || 0;
                    if (item.sizeType === 'MB') sizeInBytes *= 1024 * 1024;
                    else if (item.sizeType === 'KB') sizeInBytes *= 1024;

                    return {
                        objectCode,
                        name: item.name || item.fileName || 'Sem nome',
                        description: item.description || '',
                        extension,
                        size: sizeInBytes,
                    };
                });

                setAttachments(mapped);
            } else {
                setAttachments([]);
            }
        } catch (error: any) {
            toast.error('Erro ao carregar anexos');
            setAttachments([]);
        } finally {
            setLoading(false);
        }
    };

    const isImage = (ext: string) => {
        const valid = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic', 'heif'];
        return valid.includes(ext.toLowerCase());
    };

    const handleDownload = (item: AttachmentItem) => {
        const mb = item.size / (1024 * 1024);
        if (mb >= 5) {
            Alert.alert(
                'Arquivo grande',
                `Este arquivo tem ${mb.toFixed(2)} MB. Deseja continuar?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Baixar', onPress: () => downloadFile(item) },
                ]
            );
        } else {
            downloadFile(item);
        }
    };

    const downloadFile = async (attachment: AttachmentItem) => {
        try {
            setDownloading(attachment.objectCode);

            const fileData = await documentService.getAttachmentFile(attachment.objectCode);

            let base64: string | null =
                fileData?.itemsAttachments?.[0]?.file ||
                fileData?.file ||
                fileData?.base64 ||
                fileData?.items?.[0]?.file ||
                fileData?.content ||
                fileData?.data ||
                null;

            if (!base64) throw new Error("Conteúdo vazio");

            const safeName = attachment.name.replace(/[^a-zA-Z0-9-_]/g, '_');
            const fileName = `${safeName}.${attachment.extension}`;

            const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
            const fileUri = `${dir}${fileName}`;

            await FileSystem.writeAsStringAsync(fileUri, base64, {
                encoding: FileSystem.EncodingType.Base64,
            });

            if (isImage(attachment.extension)) {
                setPreviewImageUri(fileUri);
                return;
            }

            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(fileUri, {
                    dialogTitle: attachment.name,
                });
            }

            toast.success('Arquivo baixado');
        } catch (error) {
            toast.error('Erro ao baixar anexo');
        } finally {
            setDownloading(null);
        }
    };

    const getIcon = (ext: string) => {
        const map: any = {
            pdf: 'document-text-outline',
            txt: 'document-outline',
            doc: 'document-text-outline',
            docx: 'document-text-outline',
            xls: 'stats-chart-outline',
            xlsx: 'stats-chart-outline',
            jpg: 'image-outline',
            png: 'image-outline',
        };
        return map[ext.toLowerCase()] || 'attach-outline';
    };

    const renderAttachment = ({ item }: { item: AttachmentItem }) => {
        const isDownloadingItem = downloading === item.objectCode;

        return (
            <View style={[styles.attachmentItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.iconBox, { backgroundColor: theme.primary + '22' }]}>
                    <Ionicons name={getIcon(item.extension)} size={26} color={theme.primary} />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={[styles.fileName, { color: theme.text }]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={{ color: theme.muted, fontSize: 12 }}>
                        {item.extension.toUpperCase()} • {(item.size / 1024).toFixed(1)} KB
                    </Text>
                </View>

                <TouchableOpacity
                    disabled={isDownloadingItem}
                    onPress={() => handleDownload(item)}
                    style={[styles.downloadButton, { backgroundColor: theme.primary }]}
                >
                    {isDownloadingItem ?
                        <ActivityIndicator color="#fff" /> :
                        <Ionicons name="eye-outline" size={20} color="#fff" />
                    }
                </TouchableOpacity>
            </View>
        );
    };

    const handleClose = () => {
        setPreviewImageUri(null);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType={isPreview ? 'fade' : 'slide'}
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <View style={[styles.backdrop, isPreview && styles.previewBackdrop]}>
                <View style={[
                    styles.modal,
                    { backgroundColor: theme.surface },
                    isPreview && styles.previewModal
                ]}>

                    {/* HEADER */}
                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { color: theme.text }]}>
                                {isPreview ? 'Visualizar imagem' : 'Anexos'}
                            </Text>
                            {!isPreview && (
                                <Text style={[styles.subtitle, { color: theme.muted }]}>
                                    Documento: {documentNumber}
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={isPreview ? () => setPreviewImageUri(null) : handleClose}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={26} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {/* CONTEÚDO */}
                    {isPreview ? (
                        <View style={styles.previewWrapper}>
                            <Image
                                source={{ uri: previewImageUri! }}
                                style={styles.previewImage}
                                resizeMode="contain"
                            />
                        </View>
                    ) : loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.primary} />
                        </View>
                    ) : attachments.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="folder-open-outline" size={64} color={theme.muted} />
                            <Text style={[styles.emptyText, { color: theme.muted }]}>
                                Nenhum anexo encontrado
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={attachments}
                            keyExtractor={(item, index) => `${item.objectCode}-${index}`}
                            renderItem={renderAttachment}
                            contentContainerStyle={styles.listContent}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    /** Fundo padrão (LISTA) */
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },

    /** Fundo no modo PREVIEW */
    previewBackdrop: {
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.9)',
    },

    /** Modal padrão (BOTTOM SHEET) */
    modal: {
        maxHeight: '85%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },

    /** Modal PREVIEW (FULL SCREEN) */
    previewModal: {
        maxHeight: '100%',
        height: '100%',
        width: '100%',
        borderRadius: 0,
        paddingTop: Platform.OS === 'ios' ? 20 : 10,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    title: { fontSize: 20, fontWeight: '700' },
    subtitle: { fontSize: 13, marginTop: 2 },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loadingContainer: { paddingVertical: 60, alignItems: 'center' },

    emptyContainer: { paddingVertical: 60, alignItems: 'center', gap: 16 },
    emptyText: { fontSize: 16 },

    listContent: { padding: 20, gap: 12 },

    attachmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        gap: 12,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileName: { fontSize: 15, fontWeight: '600' },

    downloadButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /** PREVIEW FULL SCREEN */
    previewWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 16,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
});
