import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Typography } from '../theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', style }: ButtonProps) {
    let backgroundColor = Colors.primary;
    if (variant === 'secondary') backgroundColor = Colors.surfaceHighlight;
    if (variant === 'danger') backgroundColor = Colors.error;

    return (
        <TouchableOpacity style={[styles.button, { backgroundColor }, style]} onPress={onPress}>
            <Text style={[Typography.body, styles.text]}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: Spacing.m,
        paddingHorizontal: Spacing.l,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '600',
    },
});
