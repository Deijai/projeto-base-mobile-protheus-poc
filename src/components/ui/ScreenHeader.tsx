import { useTheme } from '@/src/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

type LogoPosition = 'left' | 'right';

type ScreenHeaderProps = {
    title: string;
    subtitle?: string;

    // Logo TOTVS
    showLogo?: boolean;
    logoPosition?: LogoPosition;
    logoSource?: ImageSourcePropType;
    logoSize?: number;

    // NOVO: Cor da logo (tintColor)
    logoTintColor?: string;

    // NOVO: Fundo circular atrás da logo
    logoBackgroundColor?: string;

    // Filtros
    showFilterButton?: boolean;
    showBranchFilterButton?: boolean;
    branchCount?: number;

    onPressFilter?: () => void;
    onPressBranchFilter?: () => void;

    style?: ViewStyle;
};

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
    title,
    subtitle,
    showLogo = false,
    logoPosition = 'left',
    logoSource,
    logoSize = 34,
    logoTintColor,
    logoBackgroundColor,

    showFilterButton = false,
    showBranchFilterButton = false,
    branchCount = 0,

    onPressFilter,
    onPressBranchFilter,

    style,
}) => {
    const { theme } = useTheme();

    const renderLogo = () => {
        if (!showLogo) return null;

        return (
            <View
                style={[
                    styles.logoWrapper,
                    logoBackgroundColor && { backgroundColor: logoBackgroundColor },
                ]}
            >
                <Image
                    source={
                        logoSource ||
                        require('../../../assets/images/logo.png')
                    }
                    style={{
                        width: logoSize,
                        height: logoSize,
                        resizeMode: 'contain',
                        tintColor: logoTintColor || undefined, // 👈 TINT COLOR AQUI
                    }}
                />
            </View>
        );
    };

    return (
        <View style={[styles.header, style]}>
            {/* Título + subtítulo */}
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {/* Logo à esquerda */}
                    {showLogo && logoPosition === 'left' && renderLogo()}

                    <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: theme.text }]}>
                            {title}
                        </Text>

                        {subtitle ? (
                            <Text
                                style={{ color: theme.muted, fontSize: 12 }}
                                numberOfLines={2}
                            >
                                {subtitle}
                            </Text>
                        ) : null}
                    </View>
                </View>
            </View>

            {/* Botões + Logo à direita */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {showFilterButton && (
                    <TouchableOpacity
                        onPress={onPressFilter}
                        style={[
                            styles.iconBtn,
                            { backgroundColor: theme.surface, borderColor: theme.border },
                        ]}
                    >
                        <Ionicons name="filter-outline" size={20} color={theme.text} />
                    </TouchableOpacity>
                )}

                {showBranchFilterButton && (
                    <TouchableOpacity
                        onPress={onPressBranchFilter}
                        style={[
                            styles.iconBtn,
                            { backgroundColor: theme.surface, borderColor: theme.border },
                        ]}
                    >
                        <Ionicons
                            name={branchCount > 0 ? 'business' : 'business-outline'}
                            size={20}
                            color={branchCount > 0 ? theme.primary : theme.text}
                        />
                        {branchCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={{ color: '#fff', fontSize: 10 }}>
                                    {branchCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}

                {showLogo && logoPosition === 'right' && renderLogo()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
    },
    iconBtn: {
        width: 34,
        height: 34,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#ef4444',
        borderRadius: 999,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
    },
    logoWrapper: {
        width: 32,
        height: 32,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
});
