// src/components/ui/ApprovalModal.tsx
import { ApprovalDocument } from '@/src/api/approvalsService';
import { useTheme } from '@/src/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = {
    visible: boolean;
    onClose: () => void;
    documents: ApprovalDocument[];
    onConfirm?: (params: {
        action: 'approve' | 'reject';
        justification?: string;
        documents: ApprovalDocument[];
    }) => void;
};

export const ApprovalModal: React.FC<Props> = ({
    visible,
    onClose,
    documents,
    onConfirm,
}) => {
    const { theme } = useTheme();
    const [action, setAction] = useState<'approve' | 'reject'>('approve');
    const [justification, setJustification] = useState('');

    const isReject = action === 'reject';

    const handleConfirm = () => {
        if (isReject && !justification.trim()) {
            // depois dá pra plugar um toast aqui
            return;
        }

        onConfirm?.({
            action,
            justification: justification.trim(),
            documents,
        });

        // limpa estado interno
        setJustification('');
        setAction('approve');
    };

    const firstDoc = documents[0];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <View style={styles.backdrop}>
                    <View
                        style={[
                            styles.modal,
                            {
                                backgroundColor: theme.surface,
                                shadowColor: theme.text,
                            },
                        ]}
                    >
                        {/* HEADER */}
                        <View style={styles.header}>
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={[
                                        styles.title,
                                        { color: theme.text },
                                    ]}
                                >
                                    Aprovação de documentos
                                </Text>
                                <Text
                                    style={{
                                        color: theme.muted,
                                        fontSize: 12,
                                        marginTop: 2,
                                    }}
                                >
                                    {documents.length} documento(s)
                                    selecionado(s)
                                </Text>
                            </View>

                            <TouchableOpacity onPress={onClose}>
                                <Ionicons
                                    name="close"
                                    size={22}
                                    color={theme.text}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* RESUMO DO PRIMEIRO DOCUMENTO */}
                        {firstDoc && (
                            <View
                                style={[
                                    styles.docCard,
                                    {
                                        borderColor: theme.border,
                                        backgroundColor: theme.background,
                                    },
                                ]}
                            >
                                <View style={styles.docRow}>
                                    <View style={styles.docBadge}>
                                        <Text
                                            style={{
                                                fontSize: 11,
                                                fontWeight: '700',
                                                color: theme.primary,
                                            }}
                                        >
                                            {firstDoc.documentType}
                                        </Text>
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            color: theme.muted,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {firstDoc.documentBranch || '-'}
                                    </Text>
                                </View>

                                <Text
                                    style={{
                                        fontSize: 15,
                                        fontWeight: '600',
                                        color: theme.text,
                                        marginTop: 4,
                                    }}
                                    numberOfLines={1}
                                >
                                    {firstDoc.documentNumber}
                                </Text>

                                <View style={styles.docRow}>
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            color: theme.muted,
                                        }}
                                    >
                                        Valor:{' '}
                                        <Text
                                            style={{
                                                fontWeight: '600',
                                                color: theme.text,
                                            }}
                                        >
                                            {firstDoc.documentTotal?.toLocaleString(
                                                'pt-BR',
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }
                                            ) || '0,00'}
                                        </Text>
                                    </Text>
                                    {firstDoc.documentGroupAprov && (
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                color: theme.muted,
                                            }}
                                        >
                                            Grupo:{' '}
                                            <Text
                                                style={{
                                                    fontWeight: '600',
                                                    color: theme.text,
                                                }}
                                            >
                                                {
                                                    firstDoc.documentGroupAprov
                                                }
                                            </Text>
                                        </Text>
                                    )}
                                </View>

                                {documents.length > 1 && (
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            color: theme.muted,
                                            marginTop: 4,
                                        }}
                                    >
                                        + {documents.length - 1} documento(s)
                                        neste lote
                                    </Text>
                                )}
                            </View>
                        )}

                        {/* AÇÕES (chips) */}
                        <Text
                            style={{
                                color: theme.muted,
                                fontSize: 13,
                                marginBottom: 8,
                            }}
                        >
                            Escolha a ação que deseja aplicar.
                        </Text>

                        <View style={styles.row}>
                            <TouchableOpacity
                                onPress={() => setAction('approve')}
                                style={[
                                    styles.chip,
                                    {
                                        borderColor:
                                            action === 'approve'
                                                ? theme.success
                                                : theme.border,
                                        backgroundColor:
                                            action === 'approve'
                                                ? theme.success + '20'
                                                : 'transparent',
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="checkmark-circle"
                                    size={18}
                                    color={theme.success}
                                />
                                <Text
                                    style={{
                                        marginLeft: 6,
                                        color: theme.text,
                                        fontWeight: '600',
                                    }}
                                >
                                    Aprovar
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setAction('reject')}
                                style={[
                                    styles.chip,
                                    {
                                        borderColor:
                                            action === 'reject'
                                                ? theme.error
                                                : theme.border,
                                        backgroundColor:
                                            action === 'reject'
                                                ? theme.error + '20'
                                                : 'transparent',
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={18}
                                    color={theme.error}
                                />
                                <Text
                                    style={{
                                        marginLeft: 6,
                                        color: theme.text,
                                        fontWeight: '600',
                                    }}
                                >
                                    Reprovar
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* JUSTIFICATIVA (com scroll interno para teclado) */}
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            style={{ marginTop: 10, maxHeight: 180 }}
                        >
                            {isReject ? (
                                <>
                                    <Text
                                        style={[
                                            styles.label,
                                            { color: theme.muted },
                                        ]}
                                    >
                                        Justificativa (obrigatória)
                                    </Text>
                                    <TextInput
                                        multiline
                                        value={justification}
                                        onChangeText={setJustification}
                                        placeholder="Ex.: documento com divergência de valor..."
                                        placeholderTextColor={theme.muted}
                                        style={[
                                            styles.textarea,
                                            {
                                                borderColor: theme.border,
                                                color: theme.text,
                                                backgroundColor:
                                                    theme.background,
                                            },
                                        ]}
                                    />
                                </>
                            ) : (
                                <>
                                    <Text
                                        style={{
                                            color: theme.muted,
                                            fontSize: 12,
                                            marginTop: 4,
                                        }}
                                    >
                                        Para aprovação, a justificativa é
                                        opcional.
                                    </Text>
                                    <TextInput
                                        multiline
                                        value={justification}
                                        onChangeText={setJustification}
                                        placeholder="Adicione um comentário (opcional)..."
                                        placeholderTextColor={theme.muted}
                                        style={[
                                            styles.textarea,
                                            {
                                                borderColor: theme.border,
                                                color: theme.text,
                                                backgroundColor:
                                                    theme.background,
                                            },
                                        ]}
                                    />
                                </>
                            )}
                        </ScrollView>

                        {/* FOOTER */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                onPress={onClose}
                                style={[
                                    styles.btn,
                                    {
                                        backgroundColor: theme.background,
                                        borderColor: theme.border,
                                    },
                                ]}
                            >
                                <Text style={{ color: theme.text }}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleConfirm}
                                style={[
                                    styles.btn,
                                    {
                                        backgroundColor: isReject
                                            ? theme.error
                                            : theme.success,
                                        opacity:
                                            isReject &&
                                                !justification.trim()
                                                ? 0.5
                                                : 1,
                                    },
                                ]}
                                disabled={isReject && !justification.trim()}
                            >
                                <Text
                                    style={{
                                        color: '#fff',
                                        fontWeight: '700',
                                    }}
                                >
                                    {isReject ? 'Reprovar' : 'Aprovar'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: '#00000066',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    modal: {
        width: '100%',
        borderRadius: 18,
        padding: 16,
        gap: 10,
        maxHeight: '85%',
        // sombra leve
        elevation: 5,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    docCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
    },
    docRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
    },
    docBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
        borderWidth: 1,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    chip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginTop: 8,
    },
    textarea: {
        minHeight: 90,
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        textAlignVertical: 'top',
        fontSize: 13,
        marginTop: 6,
    },
    footer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    btn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 11,
        borderRadius: 12,
        borderWidth: 1,
    },
});
