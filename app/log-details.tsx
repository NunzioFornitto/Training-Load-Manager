import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Appbar, Text, Surface, useTheme, List, Divider, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StorageService } from '../src/services/storage';
import { DailyLog } from '../src/types';
import { format, parseISO } from 'date-fns';

export default function LogDetailsScreen() {
    const { date } = useLocalSearchParams<{ date: string }>();
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [log, setLog] = useState<DailyLog | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (date) {
            StorageService.getLogForDate(date).then(l => {
                setLog(l);
                setLoading(false);
            });
        }
    }, [date]);

    if (loading) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
    if (!log) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
            <Text>{t('not_found_message')}</Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ title: log.date }} />
            <Appbar.Header elevated>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title={log.date} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Summary Card */}
                <Surface style={[styles.card, { backgroundColor: colors.elevation.level1 }]} elevation={1}>
                    <View style={styles.row}>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text variant="labelMedium">{t('today_title')}</Text>
                            <Text variant="headlineSmall" style={{ color: colors.primary, fontWeight: 'bold' }}>{log.dailyLoad}</Text>
                        </View>
                        <Divider style={{ width: 1, height: '100%' }} />
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text variant="labelMedium">{t('wellness')}</Text>
                            <View style={{ flexDirection: 'row', marginTop: 4 }}>
                                <Chip icon="bed" compact style={{ marginRight: 4 }}>{log.sleepQuality}/5</Chip>
                                <Chip icon="lightning-bolt" compact>{log.fatigue}/5</Chip>
                            </View>
                        </View>
                    </View>
                </Surface>

                {/* Workouts List */}
                {log.workouts.map((workout, index) => (
                    <View key={index} style={{ marginBottom: 24 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 }}>
                            <Chip icon="clock-outline" style={{ backgroundColor: colors.tertiaryContainer }}>
                                {t('session', { defaultValue: 'Session' })} {index + 1}
                            </Chip>
                            {workout.id && !isNaN(Number(workout.id)) && (
                                <Text variant="bodySmall" style={{ marginLeft: 8, opacity: 0.6 }}>
                                    {format(new Date(parseInt(workout.id)), 'HH:mm')}
                                </Text>
                            )}
                        </View>

                        <Surface style={[styles.card, { backgroundColor: colors.elevation.level2, padding: 0 }]} elevation={2}>
                            {workout.exercises.map((ex, i) => (
                                <React.Fragment key={i}>
                                    <List.Item
                                        title={ex.exerciseName}
                                        titleStyle={{ fontWeight: 'bold' }}
                                        description={props => (
                                            <View style={{ marginTop: 4 }}>
                                                {ex.sets.map((s, si) => (
                                                    <Text key={si} variant="bodySmall" style={{ color: colors.secondary }}>
                                                        {si + 1}. {s.reps} x {s.weight}{t('kg')} @ RPE {s.rpe || '-'}
                                                    </Text>
                                                ))}
                                            </View>
                                        )}
                                        left={props => <List.Icon {...props} icon="dumbbell" />}
                                    />
                                    {i < workout.exercises.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </Surface>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
});
