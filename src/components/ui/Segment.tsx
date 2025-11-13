// src/components/ui/Segment.tsx
import { useTheme } from '@/src/hooks/useTheme';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

type SegmentItem = {
    label: string;
    value: string;
    badge?: number;
};

type Props = {
    items: SegmentItem[];
    value: string;
    onChange: (v: string) => void;
    style?: ViewStyle;
};

export const Segment: React.FC<Props> = ({ items, value, onChange, style }) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, style]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {items.map((item) => {
                    const active = item.value === value;
                    return (
                        <TouchableOpacity
                            key={item.value}
                            onPress={() => onChange(item.value)}
                            style={[
                                styles.item,
                                {
                                    backgroundColor: active ? theme.primary + '15' : 'transparent',
                                    borderColor: active ? theme.primary : theme.border,
                                },
                            ]}
                        >
                            <Text
                                style={{
                                    color: active ? theme.primary : theme.text,
                                    fontWeight: active ? '700' : '500',
                                    fontSize: 13,
                                }}
                            >
                                {item.label}
                            </Text>
                            {typeof item.badge === 'number' ? (
                                <View
                                    style={{
                                        backgroundColor: active ? theme.primary : theme.border,
                                        paddingHorizontal: 6,
                                        paddingVertical: 1,
                                        borderRadius: 999,
                                        marginLeft: 6,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: active ? '#fff' : theme.text,
                                            fontSize: 11,
                                            fontWeight: '600',
                                        }}
                                    >
                                        {item.badge}
                                    </Text>
                                </View>
                            ) : null}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 14,
        paddingBottom: 6,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
});
