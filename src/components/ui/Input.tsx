import { useTheme } from '@/src/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type Props = TextInputProps & {
    error?: string;
};

export const Input: React.FC<Props> = ({ style, error, ...rest }) => {
    const { theme } = useTheme();

    const styles = getStyles(theme);

    return (
        <View style={styles.wrapper}>
            <TextInput
                style={[styles.input, style]}
                placeholderTextColor={theme.muted}
                {...rest}
            />
            {!!error && <View><Text style={styles.error}>{error}</Text></View>}
        </View>
    );
};

const getStyles = (theme: any) =>
    StyleSheet.create({
        wrapper: {
            marginBottom: 12,
        },
        input: {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: theme.text,
        },
        error: {
            color: '#F43F5E',
            marginTop: 4,
            fontSize: 12,
        },
    });
