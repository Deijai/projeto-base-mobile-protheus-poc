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
    View
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
            // você pode colocar toast aqui depois
            return;
        }
        onConfirm?.({
            action,
            justification: justification.trim(),
            documents,
        });
        setJustification('');
        setAction('approve');
        onClose();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView>
                {/* Seu conteúdo aqui */}
                <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
                    <View style={styles.backdrop}>
                        <View style={[styles.modal, { backgroundColor: theme.surface }]}>
                            <View style={styles.header}>
                                <Text style={[styles.title, { color: theme.text }]}>
                                    {documents.length} documento(s) selecionado(s)
                                </Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={22} color={theme.text} />
                                </TouchableOpacity>
                            </View>

                            <Text style={{ color: theme.muted, fontSize: 13, marginBottom: 8 }}>
                                Escolha a ação que deseja aplicar em lote.
                            </Text>

                            {/* ações */}
                            <View style={styles.row}>
                                <TouchableOpacity
                                    onPress={() => setAction('approve')}
                                    style={[
                                        styles.chip,
                                        {
                                            borderColor: action === 'approve' ? theme.success : theme.border,
                                            backgroundColor: action === 'approve' ? theme.success + '10' : 'transparent',
                                        },
                                    ]}
                                >
                                    <Ionicons name="checkmark" size={16} color={theme.success} />
                                    <Text style={{ marginLeft: 6, color: theme.text }}>Aprovar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setAction('reject')}
                                    style={[
                                        styles.chip,
                                        {
                                            borderColor: action === 'reject' ? theme.error : theme.border,
                                            backgroundColor: action === 'reject' ? theme.error + '10' : 'transparent',
                                        },
                                    ]}
                                >
                                    <Ionicons name="close" size={16} color={theme.error} />
                                    <Text style={{ marginLeft: 6, color: theme.text }}>Reprovar</Text>
                                </TouchableOpacity>
                            </View>

                            {/* justificativa */}
                            {isReject ? (
                                <>
                                    <Text style={[styles.label, { color: theme.muted }]}>
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
                                            { borderColor: theme.border, color: theme.text },
                                        ]}
                                    />
                                </>
                            ) : (
                                <>
                                    <Text style={{ color: theme.muted, fontSize: 12, marginTop: 4 }}>
                                        Para aprovação não é obrigatória a justificativa.
                                    </Text>
                                    <TextInput
                                        multiline
                                        value={justification}
                                        onChangeText={setJustification}
                                        placeholder="Ex.: documento com divergência de valor..."
                                        placeholderTextColor={theme.muted}
                                        style={[
                                            styles.textarea,
                                            { borderColor: theme.border, color: theme.text },
                                        ]}
                                    />
                                </>
                            )}

                            {/* footer */}
                            <View style={styles.footer}>
                                <TouchableOpacity onPress={onClose} style={[styles.btn, { backgroundColor: theme.border }]}>
                                    <Text style={{ color: theme.text }}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleConfirm}
                                    style={[
                                        styles.btn,
                                        {
                                            backgroundColor: isReject ? theme.error : theme.success,
                                            opacity: isReject && !justification.trim() ? 0.5 : 1,
                                        },
                                    ]}
                                    disabled={isReject && !justification.trim()}
                                >
                                    <Text style={{ color: '#fff', fontWeight: '600' }}>
                                        {isReject ? 'Reprovar' : 'Aprovar'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: '#00000066',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    modal: {
        borderRadius: 16,
        padding: 16,
        gap: 10,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: { fontSize: 15, fontWeight: '700' },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginTop: 8,
    },
    textarea: {
        minHeight: 80,
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        textAlignVertical: 'top',
    },
    footer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 6,
    },
    btn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 12,
    },
});
