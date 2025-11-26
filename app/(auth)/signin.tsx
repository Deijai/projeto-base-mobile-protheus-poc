// app/(auth)/signin.tsx - COM TOGGLE DE BIOMETRIA (VERSÃO FUNCIONAL)
import { ThemedView } from '@/src/components/layout/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedSafeArea } from '../../src/components/layout/ThemedSafeArea';
import { LoadingOverlay } from '../../src/components/ui/LoadingOverlay';
import { useTheme } from '../../src/hooks/useTheme';
import { useToast } from '../../src/hooks/useToast';
import { useAuthStore } from '../../src/store/authStore';
import { useConnectionStore } from '../../src/store/connectionStore';

export default function SignInScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const toast = useToast();

    const { isValid: restOk } = useConnectionStore();

    const {
        login,
        biometricLogin,
        enableBiometric,
        disableBiometric,
        biometricEnabled,
        biometricType,
        user,
    } = useAuthStore();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [secure, setSecure] = useState(true);
    const [loading, setLoading] = useState(false);
    const [bioLoading, setBioLoading] = useState(false);

    // ✅ Estado local do toggle (não afeta o store até login)
    const [wantsBiometric, setWantsBiometric] = useState(biometricEnabled);

    const handleLogin = async () => {
        if (!restOk) {
            toast.error('Configure o endereço REST primeiro.');
            router.push('/config-rest');
            return;
        }

        if (!username.trim() || !password.trim()) {
            toast.error('Informe usuário e senha.');
            return;
        }

        setLoading(true);
        const ok = await login(username.trim(), password.trim());
        setLoading(false);

        if (!ok) {
            toast.error('Usuário ou senha inválidos.');
            return;
        }

        // ✅ Após login bem-sucedido, verifica se usuário quer ativar biometria
        if (wantsBiometric) {
            const result = await enableBiometric();

            if (result.ok) {
                toast.success('Biometria ativada! ✅');
            } else {
                // Não conseguiu ativar, mostra erro específico
                switch (result.reason) {
                    case 'no-hardware':
                        toast.error('Este dispositivo não tem biometria disponível.');
                        break;
                    case 'not-enrolled':
                        toast.error('Cadastre Face ID/Touch ID nas configurações do iPhone primeiro.');
                        break;
                    default:
                        toast.error('Não foi possível ativar biometria.');
                }
                setWantsBiometric(false); // Desmarca o toggle
            }
        }

        toast.success('Bem-vindo 👋');
        router.replace('/branches');
    };

    const handleBiometricLogin = async () => {
        if (!restOk) {
            toast.error('Configure o endereço REST primeiro.');
            router.push('/config-rest');
            return;
        }

        setBioLoading(true);
        const ok = await biometricLogin();
        setBioLoading(false);

        if (ok) {
            toast.success('Autenticado com biometria ✅');
            router.replace('/branches');
        } else {
            toast.error('Não foi possível autenticar com biometria.');
        }
    };

    // ✅ Toggle local - só muda o estado, não ativa ainda
    const handleToggleBiometric = (value: boolean) => {
        setWantsBiometric(value);

        // Se já tem biometria ativa e usuário desativou
        if (!value && biometricEnabled) {
            disableBiometric();
            toast.info('Biometria desativada.');
        }
    };

    const showBiometricButton = biometricEnabled && user?.refreshToken;

    return (
        <ThemedSafeArea style={{ flex: 1, backgroundColor: theme.background }}>
            <ThemedView withBackground>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => router.push('/config-rest')}>
                        <Ionicons name="settings-outline" size={23} color={theme.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={[styles.logoWrapper, { backgroundColor: '#ffffff' }]}>
                        <Image
                            source={require('../../assets/images/react-logo.png')}
                            style={{ width: 48, height: 48, tintColor: '#38BDF8' }}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={[styles.title, { color: theme.text }]}>Meu backoffice protheus</Text>
                    <Text style={[styles.subtitle, { color: theme.muted }]}>
                        Entre com seu usuário Protheus.
                    </Text>

                    {/* ✅ Botão de biometria (se já configurado) */}
                    {showBiometricButton && (
                        <>
                            <TouchableOpacity
                                style={[
                                    styles.biometricButton,
                                    { backgroundColor: theme.primary },
                                ]}
                                onPress={handleBiometricLogin}
                                disabled={bioLoading}
                            >
                                <Ionicons
                                    name={
                                        biometricType === 'face'
                                            ? 'ios-scan-outline'
                                            : ('finger-print-outline' as any)
                                    }
                                    size={22}
                                    color="#fff"
                                />
                                <Text style={styles.biometricButtonText}>
                                    {bioLoading
                                        ? 'Autenticando...'
                                        : biometricType === 'face'
                                            ? 'Entrar com Face ID'
                                            : 'Entrar com digital'}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.divider}>
                                <View style={[styles.line, { backgroundColor: theme.border }]} />
                                <Text style={{ color: theme.muted, paddingHorizontal: 12 }}>ou</Text>
                                <View style={[styles.line, { backgroundColor: theme.border }]} />
                            </View>
                        </>
                    )}

                    {/* USER */}
                    <View
                        style={[
                            styles.inputBox,
                            { backgroundColor: theme.surface, borderColor: theme.border },
                        ]}
                    >
                        <Text style={[styles.inputLabel, { color: theme.muted }]}>
                            Usuário
                        </Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                value={username}
                                onChangeText={setUsername}
                                placeholder="ex: maria"
                                placeholderTextColor={theme.muted}
                                style={[styles.input, { color: theme.text }]}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {username.length > 0 && (
                                <TouchableOpacity onPress={() => setUsername('')}>
                                    <Ionicons name="close-circle" size={20} color={theme.muted} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* PASSWORD */}
                    <View
                        style={[
                            styles.inputBox,
                            { backgroundColor: theme.surface, borderColor: theme.border },
                        ]}
                    >
                        <Text style={[styles.inputLabel, { color: theme.muted }]}>
                            Senha
                        </Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="********"
                                placeholderTextColor={theme.muted}
                                secureTextEntry={secure}
                                style={[styles.input, { color: theme.text }]}
                            />
                            <TouchableOpacity onPress={() => setSecure((p) => !p)}>
                                <Ionicons
                                    name={secure ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={theme.muted}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => router.push('/(auth)/recovery-password')}>
                        <Text style={[styles.forgot, { color: theme.primary }]}>
                            Esqueci minha senha
                        </Text>
                    </TouchableOpacity>

                    {/* ✅ TOGGLE DE BIOMETRIA (antes de logar) */}
                    <View
                        style={[
                            styles.biometricRow,
                            { backgroundColor: theme.surface, borderColor: theme.border },
                        ]}
                    >
                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flex: 1 }}>
                            <Ionicons
                                name="finger-print-outline"
                                size={20}
                                color={theme.text}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: theme.text, fontWeight: '600' }}>
                                    Ativar biometria
                                </Text>
                                <Text style={{ color: theme.muted, fontSize: 12 }}>
                                    {wantsBiometric
                                        ? 'Será ativada após o login'
                                        : 'Use Face ID / digital nos próximos acessos'}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={wantsBiometric}
                            onValueChange={handleToggleBiometric}
                            thumbColor={wantsBiometric ? theme.primary : '#fff'}
                            trackColor={{ false: theme.border, true: theme.primary + '50' }}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.primary }]}
                        onPress={handleLogin}
                        disabled={loading || bioLoading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <LoadingOverlay visible={loading || bioLoading} text="Autenticando..." />
            </ThemedView>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        paddingHorizontal: 18,
        paddingTop: 8,
        marginBottom: 6,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        gap: 16,
    },
    logoWrapper: {
        width: 76,
        height: 76,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 6,
        marginBottom: 18,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'left',
        marginBottom: 4,
    },
    biometricButton: {
        marginTop: 8,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    biometricButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    line: {
        flex: 1,
        height: 1,
    },
    inputBox: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        gap: 4,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    input: {
        flex: 1,
        paddingVertical: 6,
        fontSize: 15,
    },
    forgot: {
        textAlign: 'center',
        marginTop: 4,
        fontWeight: '600',
    },
    button: {
        marginTop: 14,
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    biometricRow: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
});