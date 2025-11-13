import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface LoadingOverlayProps {
    visible: boolean;
    text?: string;
    isbg?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, text, isbg }) => {
    const { theme } = useTheme();

    return (
        <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
            <View style={[styles.overlay, { backgroundColor: isbg ? "transparent" : theme.overlay }]}>
                <View style={[styles.container, { backgroundColor: theme.surface }]}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    {text && <Text style={[styles.text, { color: theme.text }]}>{text}</Text>}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        //backgroundColor: 'rgba(0,0,0,0.3)',
    },
    container: {
        paddingVertical: 20,
        paddingHorizontal: 30,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    text: {
        marginTop: 6,
        fontSize: 15,
        fontWeight: '500',
    },
});
