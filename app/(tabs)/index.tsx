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

export default function Dashboard() {
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { stats, todayLog, refresh } = useTrainingData();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style="auto" />
            <Appbar.Header elevated>
                <Appbar.Content title={t('welcome')} />
                {/* Tutorial is still useful here */}
                <Appbar.Action icon="help-circle-outline" onPress={() => router.push('/tutorial')} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.scrollContent}>

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
                        {todayLog ? t('edit_log') : t('start_training')}
                    </Button>
                </View>

                {/* Dev Tools */}
                <Divider style={{ marginVertical: 20 }} />
                <Text variant="labelSmall" style={{ textAlign: 'center', opacity: 0.5, marginBottom: 8 }}>{t('dev_tools')}</Text>
                <View style={styles.devActions}>
                    <Button
                        mode="outlined"
                        compact
                        textColor={colors.error}
                        style={{ borderColor: colors.error }}
                        onPress={async () => {
                            const { StorageService } = require('../../src/services/storage');
                            await StorageService.clearAll();
                            await refresh();
                            alert(t('cleared'));
                        }}
                    >
                        {t('clear_data')}
                    </Button>
                </View>

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
