// @ts-nocheck
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Appbar, Card, Text, useTheme, Chip, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StorageService } from '../../src/services/storage';
import { DailyLog } from '../../src/types';

export default function HistoryScreen() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const router = useRouter();
    const [logs, setLogs] = useState<DailyLog[]>([]);

    const loadLogs = async () => {
        const data = await StorageService.getDailyLogs();
        // Sort by date descending
        const sorted = data.sort((a, b) => b.date.localeCompare(a.date));
        setLogs(sorted);
    };

    useFocusEffect(
        useCallback(() => {
            loadLogs();
        }, [])
    );

    const renderItem = ({ item }: { item: DailyLog }) => (
        <Card
            style={[styles.card, { backgroundColor: colors.elevation.level1 }]}
            onPress={() => router.push({ pathname: '/input', params: { date: item.date } })}
        >
            <Card.Content style={styles.cardContent}>
                <View>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.date}</Text>
                    <Text variant="bodySmall" style={{ color: colors.secondary }}>
                        {t('sleep_label')}: {item.sleepQuality}/5 • {t('fatigue_label')}: {item.fatigue}/5
                    </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="headlineSmall" style={{ color: colors.primary, fontWeight: 'bold' }}>
                        {item.dailyLoad}
                    </Text>
                    <Text variant="labelSmall">{t('today_title')}</Text>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Appbar.Header elevated>
                <Appbar.Content title={t('history')} />
            </Appbar.Header>
            <FlatList
                data={logs}
                keyExtractor={item => item.date}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyLarge" style={{ opacity: 0.6 }}>{t('no_sets')}</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    card: {
        marginBottom: 12,
        borderRadius: 12,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    }
});
