// src/components/ui/FilterModal.tsx
import { useTheme } from '@/src/hooks/useTheme';
import { useBranchStore } from '@/src/store/branchStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = {
    visible: boolean;
    onClose: () => void;
    onApply?: (filters: {
        initDate?: string;
        endDate?: string;
        searchkey?: string;
        documentBranch?: string;
        documentStatus?: string;
    }) => void;
    defaultStatus?: string;
};

export const FilterModal: React.FC<Props> = ({
    visible,
    onClose,
    onApply,
    defaultStatus = '02',
}) => {
    const { theme } = useTheme();
    const { branches } = useBranchStore();
    const [initDate, setInitDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchkey, setSearchkey] = useState('');
    const [documentBranch, setDocumentBranch] = useState<string | undefined>();
    const [documentStatus, setDocumentStatus] = useState(defaultStatus);

    const handleApply = () => {
        onApply?.({
            initDate: initDate || undefined,
            endDate: endDate || undefined,
            searchkey: searchkey || undefined,
            documentBranch,
            documentStatus,
        });
        onClose();
    };

    const statusOptions = [
        { label: 'Pendentes', value: '02' },
        { label: 'Aprovados', value: '03' },
        { label: 'Reprovados', value: '06' },
    ];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={[styles.modal, { backgroundColor: theme.surface }]}>
                    {/* header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>Filtros</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={22} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {/* status */}
                    <Text style={[styles.label, { color: theme.muted }]}>Status</Text>
                    <View style={styles.row}>
                        {statusOptions.map((st) => {
                            const active = st.value === documentStatus;
                            return (
                                <TouchableOpacity
                                    key={st.value}
                                    onPress={() => setDocumentStatus(st.value)}
                                    style={[
                                        styles.chip,
                                        {
                                            borderColor: active ? theme.primary : theme.border,
                                            backgroundColor: active ? theme.primary + '12' : 'transparent',
                                        },
                                    ]}
                                >
                                    <Text
                                        style={{
                                            color: active ? theme.primary : theme.text,
                                            fontWeight: active ? '700' : '500',
                                        }}
                                    >
                                        {st.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* período */}
                    <Text style={[styles.label, { color: theme.muted }]}>Período (YYYY-MM-DD)</Text>
                    <View style={styles.row}>
                        <TextInput
                            placeholder="Data inicial"
                            placeholderTextColor={theme.muted}
                            value={initDate}
                            onChangeText={setInitDate}
                            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                        />
                        <TextInput
                            placeholder="Data final"
                            placeholderTextColor={theme.muted}
                            value={endDate}
                            onChangeText={setEndDate}
                            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                        />
                    </View>

                    {/* busca */}
                    <Text style={[styles.label, { color: theme.muted }]}>Buscar</Text>
                    <TextInput
                        placeholder="Número, solicitante, fornecedor..."
                        placeholderTextColor={theme.muted}
                        value={searchkey}
                        onChangeText={setSearchkey}
                        style={[
                            styles.input,
                            { borderColor: theme.border, color: theme.text, marginBottom: 10 },
                        ]}
                    />


                    {/* footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={onClose} style={[styles.btn, { backgroundColor: theme.border }]}>
                            <Text style={{ color: theme.text }}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleApply} style={[styles.btn, { backgroundColor: theme.primary }]}>
                            <Text style={{ color: '#fff', fontWeight: '600' }}>Aplicar filtros</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: '#00000055',
        justifyContent: 'flex-end',
    },
    modal: {
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: Platform.OS === 'ios' ? 28 : 18,
        gap: 12,
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: { fontSize: 16, fontWeight: '700' },
    label: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    chip: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 5,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        fontSize: 14,
    },
    branchItem: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
    },
    footer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 8,
    },
    btn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
});
