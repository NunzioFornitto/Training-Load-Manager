import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Text, Surface, useTheme, ActivityIndicator } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from 'expo-router';
import { StorageService } from '../../src/services/storage';
import { CalculationService } from '../../src/services/calculations';
import { useTranslation } from 'react-i18next';
import { format, subDays, parseISO } from 'date-fns';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function DashboardScreen() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [volumeData, setVolumeData] = useState<{ labels: string[], datasets: { data: number[] }[] } | null>(null);
    const [acwrData, setAcwrData] = useState<{ labels: string[], datasets: { data: number[] }[] } | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const logs = await StorageService.getDailyLogs();

            // Prepare data for the last 14 days
            const DAYS_TO_SHOW = 14;
            const labels: string[] = [];
            const volumes: number[] = [];
            const ratios: number[] = [];

            // We need history for ACWR calculation, effectively all logs
            const history = logs.map(l => ({
                date: l.date,
                load: CalculationService.calculateDailyVolume(l.workouts)
            }));

            for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
                const date = subDays(new Date(), i);
                const dateStr = format(date, 'yyyy-MM-dd');

                // For labels, just show Day/Month to save space
                labels.push(format(date, 'dd/MM'));

                // Volume
                const log = logs.find(l => l.date === dateStr);
                const dailyVol = log ? CalculationService.calculateDailyVolume(log.workouts) : 0;
                volumes.push(dailyVol);

                // ACWR
                const { ratio } = CalculationService.calculateACWR(history, dateStr);
                ratios.push(ratio);
            }

            setVolumeData({
                labels,
                datasets: [{ data: volumes }]
            });

            setAcwrData({
                labels,
                datasets: [{ data: ratios }]
            });

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const chartConfig = {
        backgroundGradientFrom: colors.surface,
        backgroundGradientTo: colors.surface,
        color: (opacity = 1) => colors.primary,
        labelColor: (opacity = 1) => colors.onSurface,
        strokeWidth: 2,
        barPercentage: 0.5,
        decimalPlaces: 1,
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: colors.primary
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <Text variant="headlineMedium" style={styles.header}>Analytics</Text>

            <Surface style={styles.card} elevation={2}>
                <Text variant="titleMedium" style={styles.cardTitle}>Volume Load (Last 14 Days)</Text>
                {volumeData && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <LineChart
                            data={volumeData}
                            width={Math.max(SCREEN_WIDTH - 32, volumeData.labels.length * 50)}
                            height={220}
                            chartConfig={{
                                ...chartConfig,
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(103, 80, 164, ${opacity})`, // Primary
                            }}
                            bezier
                            style={styles.chart}
                        />
                    </ScrollView>
                )}
            </Surface>

            <Surface style={styles.card} elevation={2}>
                <Text variant="titleMedium" style={styles.cardTitle}>ACWR Trend (Last 14 Days)</Text>
                <Text variant="bodySmall" style={{ marginBottom: 8, opacity: 0.7 }}>Optimal Range: 0.8 - 1.3</Text>
                {acwrData && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <LineChart
                            data={acwrData}
                            width={Math.max(SCREEN_WIDTH - 32, acwrData.labels.length * 50)}
                            height={220} // Taller for ACWR including zones?
                            chartConfig={{
                                ...chartConfig,
                                decimalPlaces: 2,
                                color: (opacity = 1) => {
                                    // Dynamic coloring isn't easily supported in simple LineChart config function per point
                                    // So we keep consistent color
                                    return `rgba(180, 0, 0, ${opacity})`;
                                }
                            }}
                            bezier
                            style={styles.chart}
                            fromZero
                        />
                    </ScrollView>
                )}
            </Surface>
            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 16,
        fontWeight: 'bold',
    },
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center'
    },
    cardTitle: {
        alignSelf: 'flex-start',
        marginBottom: 8,
        fontWeight: 'bold'
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    }
});
