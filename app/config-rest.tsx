// app/config-rest.tsx
import { RestConfig } from '@/src/api/restValidatorService';
import { ThemedView } from '@/src/components/layout/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Modal, Pressable, StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { ThemedSafeArea } from '../src/components/layout/ThemedSafeArea';
import { useTheme } from '../src/hooks/useTheme';
import { useToast } from '../src/hooks/useToast';
import { useConnectionStore } from '../src/store/connectionStore';

export default function ConfigRestScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const toast = useToast();
    const { config, isValid, isTesting, testConnection, saveConfig, testAndSave } = useConnectionStore();

    const { fromLogin, fromSettings } = useLocalSearchParams();

    const [protocol, setProtocol] = useState<'HTTP' | 'HTTPS'>(config?.protocol ?? 'HTTP');
    const [address, setAddress] = useState(config?.address ?? '');
    const [port, setPort] = useState(config?.port ?? '');
    const [endpoint, setEndpoint] = useState(config?.endpoint ?? 'rest');
    const [preview, setPreview] = useState('');
    const [showProtocolModal, setShowProtocolModal] = useState(false);

    useEffect(() => {
        buildPreview({
            protocol,
            address,
            port,
            endpoint,
        });
    }, [protocol, address, port, endpoint]);

    const buildPreview = (cfg: RestConfig) => {
        const portPart = cfg.port?.trim() ? `:${cfg.port.trim()}` : '';
        const endpointClean = cfg.endpoint.startsWith('/')
            ? cfg.endpoint.slice(1)
            : cfg.endpoint;
        const url = `${cfg.protocol.toLowerCase()}://${cfg.address.trim()}${portPart}/${endpointClean}/api/oauth2/v1/token?grant_type=password`;
        setPreview(url);
    };

    const currentConfig: RestConfig = {
        protocol,
        address: address.trim(),
        port: port.trim(),
        endpoint: endpoint.trim(),
    };

    const handleValidate = async () => {
        if (!address.trim()) {
            toast.error('Informe o endereço/IP.');
            return;
        }
        const result = await testConnection(currentConfig);
        if (result.success) {
            toast.success('Conexão válida! ✅');
        } else {
            toast.error(result.error || 'Não foi possível validar o REST.');
        }
    };

    const handleSave = async () => {
        const result = await testAndSave(currentConfig);
        if (result.success) {
            toast.success('Configuração salva.');
            router.replace('/branches');
        } else {
            toast.error(result.error || 'Não foi possível salvar.');
        }
    };

    return (
        <ThemedSafeArea style={{ flex: 1, backgroundColor: theme.background }}>
            <ThemedView>
                {/* TOP BAR */}
                {fromLogin === 'true' || fromSettings === 'true' && (
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={25} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* CONTENT */}
                <View style={styles.content}>
                    <Text style={[styles.title, { color: theme.text }]}>Configurar REST</Text>
                    <Text style={[styles.subtitle, { color: theme.muted }]}>
                        Informe o servidor Protheus (REST) para habilitar login.
                    </Text>

                    {/* PROTOCOL SELECT */}
                    <View
                        style={[
                            styles.inputBox,
                            { backgroundColor: theme.surface, borderColor: theme.border },
                        ]}
                    >
                        <Text style={[styles.inputLabel, { color: theme.muted }]}>Protocolo</Text>

                        <TouchableOpacity
                            style={styles.selectTouchable}
                            onPress={() => setShowProtocolModal(true)}
                        >
                            <Text style={[styles.valueText, { color: theme.text }]}>{protocol}</Text>
                            <Ionicons name="chevron-down" size={18} color={theme.muted} />
                        </TouchableOpacity>
                    </View>

                    {/* MODAL STILIZADO */}
                    <Modal
                        visible={showProtocolModal}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowProtocolModal(false)}
                    >
                        <Pressable
                            style={styles.modalOverlay}
                            onPress={() => setShowProtocolModal(false)}
                        >
                            <View
                                style={[
                                    styles.modalContainer,
                                    { backgroundColor: theme.surface, borderColor: theme.border },
                                ]}
                            >
                                <Text style={[styles.modalTitle, { color: theme.text }]}>
                                    Selecione o protocolo
                                </Text>

                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={protocol}
                                        onValueChange={(value) => setProtocol(value)}
                                        style={{ color: theme.text }}
                                        dropdownIconColor={theme.text}
                                    >
                                        <Picker.Item color={theme.text} label="HTTP" value="HTTP" />
                                        <Picker.Item color={theme.text} label="HTTPS" value="HTTPS" />
                                    </Picker>
                                </View>

                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: theme.primary }]}
                                    onPress={() => setShowProtocolModal(false)}
                                >
                                    <Text style={styles.modalButtonText}>Confirmar</Text>
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </Modal>

                    {/* ADDRESS */}
                    <View
                        style={[
                            styles.inputBox,
                            { backgroundColor: theme.surface, borderColor: theme.border },
                        ]}
                    >
                        <Text style={[styles.inputLabel, { color: theme.muted }]}>
                            Endereço / IP
                        </Text>
                        <TextInput
                            value={address}
                            onChangeText={setAddress}
                            placeholder="ex: 192.168.0.10 ou api.empresa.com"
                            placeholderTextColor={theme.muted}
                            style={[styles.input, { color: theme.text }]}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* PORT + ENDPOINT na mesma linha? se quiser */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View
                            style={[
                                styles.inputBoxSmall,
                                { backgroundColor: theme.surface, borderColor: theme.border },
                            ]}
                        >
                            <Text style={[styles.inputLabel, { color: theme.muted }]}>
                                Porta (opcional)
                            </Text>
                            <TextInput
                                value={port}
                                onChangeText={setPort}
                                placeholder="8080"
                                placeholderTextColor={theme.muted}
                                style={[styles.input, { color: theme.text }]}
                                keyboardType="numeric"
                            />
                        </View>

                        <View
                            style={[
                                styles.inputBoxFlex,
                                { backgroundColor: theme.surface, borderColor: theme.border },
                            ]}
                        >
                            <Text style={[styles.inputLabel, { color: theme.muted }]}>
                                Endpoint base
                            </Text>
                            <TextInput
                                value={endpoint}
                                onChangeText={setEndpoint}
                                placeholder="rest"
                                placeholderTextColor={theme.muted}
                                style={[styles.input, { color: theme.text }]}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* PREVIEW */}
                    <View
                        style={[
                            styles.previewBox,
                            { backgroundColor: theme.surface, borderColor: theme.border },
                        ]}
                    >
                        <Text style={{ color: theme.muted, fontSize: 12, marginBottom: 4 }}>
                            URL que será testada:
                        </Text>
                        <Text style={{ color: theme.text, fontSize: 13 }}>{preview}</Text>
                        {isValid ? (
                            <View style={styles.statusRow}>
                                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                                <Text style={{ color: '#22c55e', marginLeft: 4, fontSize: 12 }}>
                                    Último teste: sucesso
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {/* BUTTONS */}
                    <View style={styles.buttonsRow}>
                        <TouchableOpacity
                            style={[
                                styles.buttonSecondary,
                                { borderColor: theme.primary },
                            ]}
                            onPress={handleValidate}
                            disabled={isTesting}
                        >
                            <Text
                                style={[
                                    styles.buttonSecondaryText,
                                    { color: theme.primary },
                                ]}
                            >
                                {isTesting ? 'Validando...' : 'Validar'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.buttonPrimary,
                                { backgroundColor: theme.primary },
                            ]}
                            onPress={handleSave}
                            // se quiser, só deixa salvar quando tiver endereço
                            disabled={!address.trim() || !isValid}
                        >
                            <Text style={styles.buttonPrimaryText}>Salvar e continuar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ThemedView>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingHorizontal: 18,
        paddingTop: 8,
        marginBottom: 6,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        gap: 14,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 13,
        marginBottom: 8,
    },
    inputBox: {
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        gap: 4,
    },
    selectTouchable: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'transparent',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },

    valueText: {
        fontSize: 15,
        fontWeight: '500',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContainer: {
        width: '80%',
        borderWidth: 1,
        borderRadius: 18,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },

    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },

    pickerWrapper: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: 20,
    },

    modalButton: {
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    modalButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },

    inputBoxSmall: {
        flex: 0,
        width: 120,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        gap: 4,
    },
    inputBoxFlex: {
        flex: 1,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        gap: 4,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    input: {
        paddingVertical: 4,
        fontSize: 14,
    },
    previewBox: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 10,
        gap: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    buttonSecondary: {
        flex: 1,
        borderRadius: 999,
        borderWidth: 1.5,
        paddingVertical: 11,
        alignItems: 'center',
    },
    buttonSecondaryText: {
        fontWeight: '600',
        fontSize: 14,
    },
    buttonPrimary: {
        flex: 1,
        borderRadius: 999,
        paddingVertical: 12,
        alignItems: 'center',
    },
    buttonPrimaryText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
