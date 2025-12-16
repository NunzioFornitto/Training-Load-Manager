// @ts-nocheck
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Appbar, Card, Text, Button, useTheme, Avatar, IconButton, Menu, Divider } from 'react-native-paper';
import { useTrainingData } from '../../src/hooks/useTrainingData';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import i18n from '../../src/i18n';
import { InfoButton } from '../../src/components/InfoButton';
import { useFocusEffect } from 'expo-router';
import { StorageService } from '../../src/services/storage';
import { WorkoutSession } from '../../src/types';

export default function Dashboard() {
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { stats, todayLog, refresh } = useTrainingData();
    const [currentSession, setCurrentSession] = React.useState<WorkoutSession | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            refresh();
            StorageService.getCurrentWorkout().then(setCurrentSession);
        }, [])
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style="auto" />
            <Appbar.Header elevated>
                <Appbar.Content title={t('welcome')} />
                {/* Tutorial is still useful here */}
                <Appbar.Action icon="help-circle-outline" onPress={() => router.push('/tutorial')} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {currentSession && (
                    <Card style={[styles.card, { backgroundColor: colors.tertiaryContainer, marginBottom: 16 }]} onPress={() => router.push('/live-workout')}>
                        <Card.Content style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View>
                                <Text variant="titleMedium" style={{ color: colors.onTertiaryContainer, fontWeight: 'bold' }}>
                                    {t('current_workout', { defaultValue: 'Current Workout' })}
                                </Text>
                                <Text variant="bodyMedium" style={{ color: colors.onTertiaryContainer }}>
                                    {currentSession.exercises.length} {t('exercises', { defaultValue: 'Exercises' })}
                                </Text>
                            </View>
                            <IconButton icon="arrow-right" iconColor={colors.onTertiaryContainer} />
                        </Card.Content>
                    </Card>
                )}

                {/* Risk Status Card */}
                <Card style={[styles.card, { backgroundColor: stats.riskLevelKey === 'high' ? colors.errorContainer : colors.primaryContainer }]}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ textAlign: 'center', color: colors.onPrimaryContainer }}>
                            {t('load_suggestions')}
                        </Text>
                        <Text variant="displaySmall" style={{ textAlign: 'center', fontWeight: 'bold', marginVertical: 10, color: colors.onPrimaryContainer }}>
                            {t(`risk.${stats.riskLevelKey}`).toUpperCase()}
                        </Text>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', color: colors.onPrimaryContainer }}>
                            {t(`suggestion.${stats.suggestionKey}`)}
                            {stats.fatigueWarning && ` ${t('suggestion.fatigue_warning')}`}
                        </Text>
                    </Card.Content>
                </Card>

                {/* Metrics Grid */}
                <View style={styles.grid}>
                    <Card style={[styles.metricCard, { flex: 1, marginRight: 8 }]}>
                        <Card.Content>
                            <View style={styles.labelRow}>
                                <Text variant="labelMedium">{t('acwr')}</Text>
                                <InfoButton title={t('explanation.acwr_title')} description={t('explanation.acwr_desc')} />
                            </View>
                            <Text variant="headlineMedium" style={{ color: colors.primary }}>{stats.ratio.toFixed(2)}</Text>
                        </Card.Content>
                    </Card>
                    <Card style={[styles.metricCard, { flex: 1, marginLeft: 8 }]}>
                        <Card.Content>
                            <View style={styles.labelRow}>
                                <Text variant="labelMedium">{t('chronic_load')}</Text>
                                <InfoButton title={t('explanation.chronic_title')} description={t('explanation.chronic_desc')} />
                            </View>
                            <Text variant="headlineMedium" style={{ color: colors.secondary }}>{Math.round(stats.chronicLoad)}</Text>
                        </Card.Content>
                    </Card>
                </View>

                <View style={[styles.grid, { marginTop: 16 }]}>
                    <Card style={[styles.metricCard, { flex: 1, marginRight: 8 }]}>
                        <Card.Content>
                            <View style={styles.labelRow}>
                                <Text variant="labelMedium">{t('acute_load')}</Text>
                                <InfoButton title={t('explanation.acute_title')} description={t('explanation.acute_desc')} />
                            </View>
                            <Text variant="headlineMedium" style={{ color: colors.tertiary }}>{Math.round(stats.acuteLoad)}</Text>
                        </Card.Content>
                    </Card>
                    <Card style={[styles.metricCard, { flex: 1, marginLeft: 8 }]}>
                        <Card.Content>
                            <View style={styles.labelRow}>
                                <Text variant="labelMedium">{t('today')}</Text>
                                <InfoButton title={t('explanation.today_title')} description={t('explanation.today_desc')} />
                            </View>
                            <Text variant="headlineMedium">{todayLog ? todayLog.dailyLoad : 0}</Text>
                        </Card.Content>
                    </Card>
                </View>

                {/* Main Action */}
                <View style={styles.actions}>
                    <Button
                        mode="contained"
                        onPress={() => router.push('/input')}
                        style={styles.actionBtn}
                        contentStyle={{ height: 50 }}
                        icon="plus"
                    >
                        {t('start_training')}
                    </Button>
                </View>

                {/* Dev Tools Removed */}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    actions: {
        marginTop: 32,
    },
    actionBtn: {
        borderRadius: 8,
    },
    devActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    }
});
