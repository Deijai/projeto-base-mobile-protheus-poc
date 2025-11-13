import { ThemedView } from '@/src/components/layout/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedSafeArea } from '../../src/components/layout/ThemedSafeArea';
import { useAppContext } from '../../src/hooks/useAppContext';
import { useTheme } from '../../src/hooks/useTheme';
import { useToast } from '../../src/hooks/useToast';
import { useAuthStore } from '../../src/store/authStore';
import { useBranchStore } from '../../src/store/branchStore';
import { useConnectionStore } from '../../src/store/connectionStore';
import { useModuleStore } from '../../src/store/moduleStore';

export default function SettingsScreen() {
    const { theme, toggleTheme } = useTheme();
    const { user, selectedBranch, selectedModule } = useAppContext();
    const router = useRouter();
    const toast = useToast();

    const {
        biometricEnabled,
        biometricType,
        enableBiometric,
        disableBiometric,
        logout
    } = useAuthStore();
    const { clear: clearBranch } = useBranchStore();
    const { clear: clearModule } = useModuleStore();
    const { clear: clearConnection, config } = useConnectionStore();

    const handleChangeBranch = () => {
        router.push({
            pathname: '/branches',
            params: { fromSettings: 'true' }
        });
    };

    const handleChangeModule = () => {
        router.push({
            pathname: '/modules',
            params: { fromSettings: 'true' }
        });
    };

    const handleEditRest = () => {
        router.push({
            pathname: '/config-rest',
            params: { fromSettings: 'true' }
        });
    };

    const handleClearAll = () => {
        Alert.alert(
            'Apagar dados',
            'Isso vai apagar REST, filial e módulo salvos. Você precisará configurar de novo.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Apagar',
                    style: 'destructive',
                    onPress: () => {
                        clearBranch();
                        clearModule();
                        clearConnection();
                        toast.info('Dados apagados.');
                        router.replace('/config-rest');
                    },
                },
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert('Sair', 'Deseja realmente sair do aplicativo?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair',
                style: 'destructive',
                onPress: () => {
                    clearBranch();
                    clearModule();
                    logout();
                    toast.success('Sessão encerrada.');
                    router.replace('/(auth)/signin');
                },
            },
        ]);
    };

    return (
        <ThemedSafeArea style={{ flex: 1, backgroundColor: theme.background }}>
            <ThemedView>
                {/* HEADER / PERFIL */}
                <View style={[styles.profileCard, { backgroundColor: theme.surface, shadowColor: theme.text }]}>
                    <View style={styles.profileLeft}>
                        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                            <Text style={styles.avatarLetter}>
                                {(user?.name || user?.username || 'U').slice(0, 1).toUpperCase()}
                            </Text>
                        </View>

                        <View style={styles.profileInfo}>
                            <Text style={[styles.userName, { color: theme.text }]}>
                                {user?.name || user?.username || 'Usuário Protheus'}
                            </Text>
                            <Text style={[styles.userEmail, { color: theme.muted }]}>
                                {user?.email || 'sem e-mail cadastrado'}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Ionicons name="log-out-outline" size={24} color={theme.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.headerTextContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>Configurações</Text>
                    <Text style={[styles.subtitle, { color: theme.muted }]}>
                        Gerencie sua conta e o ambiente Protheus
                    </Text>
                </View>


                {/* AMBIENTE ATUAL */}
                <Text style={[styles.sectionTitle, { color: theme.muted }]}>
                    Ambiente atual
                </Text>
                <View
                    style={[
                        styles.card,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                >
                    {/* REST */}
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: theme.muted }]}>
                                Servidor REST
                            </Text>
                            <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>
                                {config
                                    ? `${config.protocol.toLowerCase()}://${config.address}${config.port ? ':' + config.port : ''}/${config.endpoint}`
                                    : 'Não configurado'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={handleEditRest} style={styles.actionBtn}>
                            <Ionicons name="pencil-outline" size={16} color={theme.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* FILIAL */}
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: theme.muted }]}>Filial</Text>
                            <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>
                                {selectedBranch?.Description || 'Nenhuma selecionada'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={handleChangeBranch} style={styles.actionBtn}>
                            <Ionicons name="swap-horizontal-outline" size={16} color={theme.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* MÓDULO */}
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: theme.muted }]}>Módulo</Text>
                            <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>
                                {selectedModule?.name || 'Nenhum selecionado'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={handleChangeModule} style={styles.actionBtn}>
                            <Ionicons name="grid-outline" size={16} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* PREFERÊNCIAS */}
                <Text style={[styles.sectionTitle, { color: theme.muted }]}>Preferências</Text>
                <View
                    style={[
                        styles.card,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                >
                    <TouchableOpacity style={styles.listItem} onPress={toggleTheme}>
                        <Ionicons name="moon-outline" size={20} color={theme.text} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.itemTitle, { color: theme.text }]}>
                                Alternar tema
                            </Text>
                            <Text style={{ color: theme.muted, fontSize: 12 }}>
                                Troque entre tema claro e escuro
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={theme.muted} />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.muted }]}>
                    Segurança
                </Text>
                <View
                    style={[
                        styles.card,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                >
                    <View style={styles.listItem}>
                        <Ionicons name="finger-print-outline" size={20} color={theme.text} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.itemTitle, { color: theme.text }]}>
                                Login com biometria
                            </Text>
                            <Text style={{ color: theme.muted, fontSize: 12 }}>
                                {biometricEnabled
                                    ? `Usando ${biometricType === 'face' ? 'Face ID' : 'biometria'}`
                                    : 'Ative para entrar sem digitar senha'}
                            </Text>
                        </View>
                        <Switch
                            value={biometricEnabled}
                            onValueChange={async (value) => {
                                if (value) {
                                    const result = await enableBiometric();
                                    if (!result.ok) {
                                        // garante que visualmente volte
                                        disableBiometric();
                                        switch (result.reason) {
                                            case 'no-refresh':
                                                toast.error('Faça login novamente para ativar a biometria.');
                                                break;
                                            case 'no-hardware':
                                                toast.error('Este dispositivo não liberou biometria para o app.');
                                                break;
                                            case 'not-enrolled':
                                                toast.error('Cadastre Face ID / Touch ID nas configurações do iPhone.');
                                                break;
                                            default:
                                                toast.error('Não foi possível ativar a biometria.');
                                        }
                                        return;
                                    }
                                    toast.success('Biometria ativada.');
                                } else {
                                    disableBiometric();
                                    toast.info('Biometria desativada.');
                                }
                            }}
                            thumbColor={biometricEnabled ? theme.primary : '#fff'}
                            trackColor={{ false: theme.border, true: theme.primary + '50' }}
                        />
                    </View>
                </View>


                {/* DADOS DO APP */}
                <Text style={[styles.sectionTitle, { color: theme.muted }]}>
                    Dados do aplicativo
                </Text>
                <View
                    style={[
                        styles.card,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                >
                    <TouchableOpacity style={styles.listItem} onPress={handleClearAll}>
                        <Ionicons name="trash-outline" size={20} color="#f43f5e" />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.itemTitle, { color: '#f43f5e' }]}>
                                Apagar dados
                            </Text>
                            <Text style={{ color: theme.muted, fontSize: 12 }}>
                                Remove REST, filial e módulo salvos
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.listItem} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={20} color="#f43f5e" />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.itemTitle, { color: '#f43f5e' }]}>
                                Sair
                            </Text>
                            <Text style={{ color: theme.muted, fontSize: 12 }}>
                                Finalizar sessão neste dispositivo
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingTop: 6,
        paddingBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    profileCard: {
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },

    profileLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    avatarLetter: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 20,
    },

    profileInfo: {
        flex: 1,
    },

    userName: {
        fontSize: 16,
        fontWeight: '700',
    },

    userEmail: {
        fontSize: 12,
        marginTop: 2,
    },

    logoutButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,0,0,0.08)',
    },

    headerTextContainer: {
        marginHorizontal: 20,
        marginTop: 18,
        marginBottom: 10,
    },
    card: {
        marginHorizontal: 20,
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        marginBottom: 16,
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 999,
        backgroundColor: '#f87171',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        marginHorizontal: 20,
        marginBottom: 6,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    label: {
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionBtn: {
        width: 30,
        height: 30,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listItem: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '500',
    },
});
