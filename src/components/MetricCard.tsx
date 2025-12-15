import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';
import { Card } from './Card';

interface MetricProps {
    label: string;
    value: string | number;
    unit?: string;
    description?: string;
    status?: 'Optimal' | 'High' | 'Low' | 'Moderate';
}

export function MetricCard({ label, value, unit, description, status }: MetricProps) {
    let statusColor = Colors.textSecondary;
    if (status === 'Optimal') statusColor = Colors.success;
    if (status === 'High') statusColor = Colors.error;
    if (status === 'Moderate') statusColor = Colors.warning;
    if (status === 'Low') statusColor = Colors.secondary;

    return (
        <Card>
            <Text style={Typography.caption}>{label.toUpperCase()}</Text>
            <View style={styles.valueContainer}>
                <Text style={[Typography.h1, { color: statusColor }]}>{value}</Text>
                {unit && <Text style={[Typography.body, styles.unit]}>{unit}</Text>}
            </View>
            {description && <Text style={styles.description}>{description}</Text>}
        </Card>
    );
}

const styles = StyleSheet.create({
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: Spacing.xs,
    },
    unit: {
        marginLeft: Spacing.xs,
        color: Colors.textSecondary,
    },
    description: {
        ...Typography.caption, // merged
        marginTop: Spacing.s,
    },
});
