import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useToastStore } from '../../store/toastStore';

export const Toast: React.FC = () => {
    const { theme } = useTheme();
    const { visible, message, type, hide } = useToastStore();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-40)).current;

    const colors = {
        success: '#16A34A',
        error: '#DC2626',
        info: theme.primary,
    };

    const icons = {
        success: 'checkmark-circle-outline',
        error: 'alert-circle-outline',
        info: 'information-circle-outline',
    };

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                }),
            ]).start();

            const timer = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateY, {
                        toValue: -40,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                ]).start(() => hide());
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible) return null;

    const backgroundColor =
        type === 'success'
            ? colors.success
            : type === 'error'
                ? colors.error
                : colors.info;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY }],
                },
            ]}
        >
            <View
                style={[
                    styles.toast,
                    {
                        backgroundColor,
                        shadowColor: '#000',
                        shadowOpacity: 0.25,
                        shadowRadius: 6,
                        elevation: 6,
                    },
                ]}
            >
                <Ionicons
                    name={icons[type || 'info'] as any}
                    size={20}
                    color="#fff"
                    style={{ marginRight: 8 }}
                />
                <Text style={styles.text}>{message}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.select({ ios: 70, android: 50 }),
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        minWidth: '80%',
    },
    text: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 14,
        flexShrink: 1,
    },
});
