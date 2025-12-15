// @ts-nocheck
import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Button, Text, TextInput, Surface, useTheme, Chip, List, Divider, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ExerciseInput } from '../src/components/ExerciseInput';
import { ExerciseEntry, DailyLog } from '../src/types';
import { CalculationService } from '../src/services/calculations';
import { StorageService } from '../src/services/storage';
import { format, addDays, subDays } from 'date-fns';
import { InfoButton } from '../src/components/InfoButton';

export default function InputScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [sleep, setSleep] = useState('');
    const [fatigue, setFatigue] = useState('');
    const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
    const [showExerciseForm, setShowExerciseForm] = useState(false);

    // Date navigation
    const changeDate = (days: number) => {
        const currentDate = new Date(date);
        const newDate = addDays(currentDate, days);
        setDate(format(newDate, 'yyyy-MM-dd'));
    };

    useEffect(() => {
        // Reset form when date changes
        setSleep('');
        setFatigue('');
        setExercises([]);

        StorageService.getLogForDate(date).then(log => {
            if (log) {
                setSleep(log.sleepQuality.toString());
                setFatigue(log.fatigue.toString());
                if (log.workouts.length > 0) {
                    setExercises(log.workouts[0].exercises);
                }
            }
        });
    }, [date]);

    const handleAddExercise = (exercise: ExerciseEntry) => {
        setExercises([...exercises, exercise]);
        setShowExerciseForm(false);
    };

    const handleSaveLog = async () => {
        if (!sleep || !fatigue) {
            Alert.alert(t('error_title', { defaultValue: 'Error' }), t('missing_info', { defaultValue: 'Please enter sleep and fatigue levels.' }));
            return;
        }

        const dailyVolume = CalculationService.calculateDailyVolume([{ exercises }]);
        const workout = {
            id: Date.now().toString(),
            date: date,
            exercises: exercises,
        };

        const log: DailyLog = {
            date,
            sleepQuality: parseInt(sleep),
            fatigue: parseInt(fatigue),
            workouts: [workout],
            totalVolumeLoad: dailyVolume,
            dailyLoad: dailyVolume,
        };

        await StorageService.saveDailyLog(log);
        router.back();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ title: t('new_entry_title') }} />
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineMedium" style={{ marginBottom: 4, fontWeight: 'bold' }}>{t('input_title')}</Text>

                {/* Date Selector */}
                <View style={[styles.dateRow, { backgroundColor: colors.surfaceVariant, marginBottom: 20 }]}>
                    <IconButton icon="chevron-left" onPress={() => changeDate(-1)} />
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{date}</Text>
                    <IconButton icon="chevron-right" onPress={() => changeDate(1)} />
                </View>

                <Surface style={[styles.section, { backgroundColor: colors.elevation.level1 }]} elevation={1}>
                    <Text variant="titleLarge" style={{ marginBottom: 16 }}>{t('wellness')}</Text>
                    <View style={styles.inputRow}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <View style={styles.labelRow}>
                                <Text>{t('sleep_label')}</Text>
                                <InfoButton title={t('explanation.sleep_title')} description={t('explanation.sleep_desc')} />
                            </View>
                            <TextInput
                                mode="outlined"
                                keyboardType="numeric"
                                value={sleep}
                                onChangeText={setSleep}
                                maxLength={2}
                                dense
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <View style={styles.labelRow}>
                                <Text>{t('fatigue_label')}</Text>
                                <InfoButton title={t('explanation.fatigue_title')} description={t('explanation.fatigue_desc')} />
                            </View>
                            <TextInput
                                mode="outlined"
                                keyboardType="numeric"
                                value={fatigue}
                                onChangeText={setFatigue}
                                maxLength={2}
                                dense
                            />
                        </View>
                    </View>
                </Surface>

                <Surface style={[styles.section, { backgroundColor: colors.elevation.level1 }]} elevation={1}>
                    <Text variant="titleLarge" style={{ marginBottom: 16 }}>{t('workout')}</Text>

                    {exercises.length === 0 && !showExerciseForm && (
                        <Text variant="bodyMedium" style={{ fontStyle: 'italic', opacity: 0.6, marginBottom: 16 }}>
                            {t('no_exercises')}
                        </Text>
                    )}

                    {exercises.map((ex, i) => (
                        <List.Item
                            key={i}
                            title={ex.exerciseName}
                            description={`${ex.sets.length} ${t('sets')}`}
                            left={props => <List.Icon {...props} icon="dumbbell" />}
                            style={{ backgroundColor: colors.elevation.level3, marginBottom: 8, borderRadius: 8 }}
                        />
                    ))}

                    {showExerciseForm ? (
                        <ExerciseInput
                            onSave={handleAddExercise}
                            onCancel={() => setShowExerciseForm(false)}
                        />
                    ) : (
                        <Button
                            mode="contained-tonal"
                            onPress={() => setShowExerciseForm(true)}
                            icon="plus"
                            style={{ marginTop: 8 }}
                        >
                            {t('add_exercise')}
                        </Button>
                    )}
                </Surface>

                {!showExerciseForm && (
                    <View style={styles.footer}>
                        <Button mode="contained" onPress={handleSaveLog} contentStyle={{ height: 50 }}>
                            {t('save')}
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => router.back()}
                            style={{ marginTop: 12 }}
                        >
                            {t('cancel')}
                        </Button>
                    </View>
                )}
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
    section: {
        marginBottom: 24,
        padding: 16,
        borderRadius: 12,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footer: {
        marginVertical: 24,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 4,
        borderRadius: 8,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    }
});
