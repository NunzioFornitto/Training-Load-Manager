import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { Button, Text, Surface, useTheme, List, Checkbox, IconButton, Portal, Dialog, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StorageService } from '../src/services/storage';
import { CalculationService } from '../src/services/calculations';
import { WorkoutSession, DailyLog } from '../src/types';
import { format } from 'date-fns';
import { InfoButton } from '../src/components/InfoButton';

export default function LiveWorkoutScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [session, setSession] = useState<WorkoutSession | null>(null);
    const [loading, setLoading] = useState(true);

    // Finish Dialog State
    const [showFinishDialog, setShowFinishDialog] = useState(false);
    const [sleep, setSleep] = useState('');
    const [fatigue, setFatigue] = useState('');

    const loadSession = async () => {
        setLoading(true);
        const current = await StorageService.getCurrentWorkout();
        if (current) {
            setSession(current);
        } else {
            // Should not happen if routed correctly, but handle gracefully
            router.replace('/');
        }
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadSession();

            // Override back button to preventing accidental exit without awareness
            const onBackPress = () => {
                // Just go back to home, keeping session active
                router.replace('/');
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    const toggleComplete = async (index: number) => {
        if (!session) return;

        const newCompletedIndices = [...session.completedIndices];
        if (newCompletedIndices.includes(index)) {
            const idx = newCompletedIndices.indexOf(index);
            newCompletedIndices.splice(idx, 1);
        } else {
            newCompletedIndices.push(index);
        }

        const newSession = { ...session, completedIndices: newCompletedIndices };
        setSession(newSession);

        // Persist immediately
        await StorageService.saveCurrentWorkout(newSession);
    };

    const handleFinish = async () => {
        if (!session) return;

        if (!sleep || !fatigue) {
            Alert.alert(t('error', { defaultValue: 'Error' }), t('missing_info', { defaultValue: 'Please enter sleep and fatigue levels.' }));
            return;
        }

        const dailyVolume = CalculationService.calculateDailyVolume([{ exercises: session.exercises }]);
        const workout = {
            id: session.startTime, // Use start time as ID
            date: format(new Date(), 'yyyy-MM-dd'),
            exercises: session.exercises,
            // Could add session duration diff here if we wanted
        };

        // Check if log exists for today
        const existingLog = await StorageService.getLogForDate(workout.date);
        let log: DailyLog;

        if (existingLog) {
            // Append workout
            const updatedWorkouts = [...existingLog.workouts, workout];
            const newTotalVolume = CalculationService.calculateDailyVolume(updatedWorkouts);

            log = {
                ...existingLog,
                sleepQuality: parseInt(sleep) || existingLog.sleepQuality, // Update if provided, else keep old
                fatigue: parseInt(fatigue) || existingLog.fatigue,
                workouts: updatedWorkouts,
                totalVolumeLoad: newTotalVolume,
                dailyLoad: newTotalVolume
            };
        } else {
            // Create new
            log = {
                date: workout.date,
                sleepQuality: parseInt(sleep),
                fatigue: parseInt(fatigue),
                workouts: [workout],
                totalVolumeLoad: dailyVolume,
                dailyLoad: dailyVolume,
            };
        }

        await StorageService.saveDailyLog(log);
        await StorageService.clearCurrentWorkout();

        setShowFinishDialog(false);
        router.replace('/');
    };

    if (loading) {
        return <View style={{ flex: 1, backgroundColor: colors.background }} />;
    }

    if (!session) return null;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <Surface style={[styles.header, { backgroundColor: colors.elevation.level2 }]} elevation={2}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                        <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: colors.primary }}>
                            {t('live_workout', { defaultValue: 'Live Workout' })}
                        </Text>
                        {session.templateName && (
                            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                                {session.templateName}
                            </Text>
                        )}
                    </View>
                    <Button mode="contained" onPress={() => setShowFinishDialog(true)}>
                        {t('finish', { defaultValue: 'Finish' })}
                    </Button>
                </View>
            </Surface>

            <ScrollView contentContainerStyle={styles.content}>
                {session.exercises.map((ex, i) => {
                    const isCompleted = session.completedIndices.includes(i);
                    return (
                        <Surface key={i} style={[styles.exerciseCard, { backgroundColor: isCompleted ? colors.elevation.level1 : colors.elevation.level3, opacity: isCompleted ? 0.7 : 1 }]} elevation={1}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ flex: 1 }}>
                                    <Text variant="titleMedium" style={{ fontWeight: 'bold', textDecorationLine: isCompleted ? 'line-through' : 'none' }}>
                                        {ex.exerciseName}
                                    </Text>
                                    <Text variant="bodyMedium">
                                        {ex.sets.length} {t('sets')}
                                    </Text>
                                </View>
                                <Checkbox
                                    status={isCompleted ? 'checked' : 'unchecked'}
                                    onPress={() => toggleComplete(i)}
                                />
                            </View>

                            {/* Expanded details could go here, but keeping it simple for now as requested: "Select exercise" */}
                            {!isCompleted && (
                                <View style={{ marginTop: 8, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: colors.primary }}>
                                    {ex.sets.map((s, idx) => (
                                        <Text key={idx} variant="bodySmall">
                                            {idx + 1}. {s.reps} x {s.weight}{t('kg')} @ RPE {s.rpe || '-'}
                                        </Text>
                                    ))}
                                </View>
                            )}
                        </Surface>
                    );
                })}
            </ScrollView>

            <Portal>
                <Dialog visible={showFinishDialog} onDismiss={() => setShowFinishDialog(false)}>
                    <Dialog.Title>{t('finish_workout', { defaultValue: 'Finish Workout' })}</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ marginBottom: 16 }}>{t('enter_wellness', { defaultValue: 'Please enter your wellness stats to complete the log.' })}</Text>

                        <View style={{ marginBottom: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
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

                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
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

                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowFinishDialog(false)}>{t('cancel')}</Button>
                        <Button onPress={handleFinish} mode="contained">{t('save_and_finish', { defaultValue: 'Save & Finish' })}</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        marginBottom: 16,
    },
    content: {
        padding: 16,
    },
    exerciseCard: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
    }
});
