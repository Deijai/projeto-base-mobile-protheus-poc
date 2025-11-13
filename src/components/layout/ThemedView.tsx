// src/components/layout/ThemedView.tsx
import { useTheme } from '@/src/hooks/useTheme';
import React from 'react';
import {
    ImageBackground,
    ScrollView,
    StyleSheet,
    View,
    ViewProps,
} from 'react-native';

type Props = ViewProps & {
    surface?: boolean;
    withBackground?: boolean; // habilita a imagem padrão
    contentContainerStyle?: any;
};

export const ThemedView: React.FC<Props> = ({
    style,
    surface = false,
    withBackground = false,
    contentContainerStyle,
    children,
    ...rest
}) => {
    const { theme, isDark } = useTheme();

    const backgroundColor = surface ? theme.surface : theme.background;

    if (!withBackground) {
        return (
            <ScrollView
                style={[{ backgroundColor }, styles.container, style]}
                contentContainerStyle={contentContainerStyle}
                {...rest}
            >
                {children}
            </ScrollView>
        );
    }

    // Se usar imagem
    return (
        <ImageBackground
            source={require('../../../assets/images/background.png')}
            resizeMode="cover"
            style={styles.background}
        >
            {/* Overlay que adapta à cor do tema */}
            <View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        backgroundColor: isDark
                            ? 'rgba(0,0,0,0.4)'
                            : 'rgba(255,255,255,0.4)',
                    }, {
                        flex: 1,
                    }
                ]}
            />

            <ScrollView
                style={[{ backgroundColor: backgroundColor + '00' }, styles.container, style]}
                contentContainerStyle={contentContainerStyle}
                {...rest}
            >
                {children}
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
});
