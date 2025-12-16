// @ts-nocheck
import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Button, Text, TextInput, Surface, useTheme, Chip, List, Divider, IconButton, Portal, Modal, Dialog, Checkbox } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ExerciseInput } from '../src/components/ExerciseInput';
import { ExerciseEntry, DailyLog, WorkoutTemplate } from '../src/types';
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

    // Template State
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [showTemplateList, setShowTemplateList] = useState(false);
    const [showSaveTemplate, setShowSaveTemplate] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');

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
        setFatigue('');
        setExercises([]);

        StorageService.getLogForDate(date).then(log => {
            if (log) {
                setSleep(log.sleepQuality.toString());
                setFatigue(log.fatigue.toString());
                // Do NOT load previous exercises. We want a clean slate for new workouts.
            }
        });
    }, [date]);

    const handleAddExercise = (exercise: ExerciseEntry) => {
        setExercises([...exercises, exercise]);
        setShowExerciseForm(false);
    };

    const loadTemplates = async () => {
        const stored = await StorageService.getTemplates();
        setTemplates(stored);
    };

    const handleSaveTemplate = async () => {
        if (!newTemplateName || exercises.length === 0) {
            Alert.alert(t('error'), t('template_error', { defaultValue: 'Name and exercises required' }));
            return;
        }
        await StorageService.saveTemplate({
            id: Date.now().toString(),
            name: newTemplateName,
            exercises: exercises
        });
        setNewTemplateName('');
        setShowSaveTemplate(false);
        Alert.alert(t('success'), t('template_saved', { defaultValue: 'Template Saved!' }));
    };

    const handleLoadTemplate = (template: WorkoutTemplate) => {
        setExercises(prev => [...prev, ...template.exercises]);
        setShowTemplateList(false);
        // Ensure form is closed and footer is visible
        setShowExerciseForm(false);
    };

    const handleDeleteTemplate = async (id: string) => {
        await StorageService.deleteTemplate(id);
        loadTemplates();
    };

    useEffect(() => {
        if (showTemplateList) {
            loadTemplates();
        }
    }, [showTemplateList]);

    const handleStartLive = async () => {
        if (exercises.length === 0) {
            Alert.alert(t('error'), t('no_exercises', { defaultValue: 'No exercises added' }));
            return;
        }

        await StorageService.saveCurrentWorkout({
            exercises: exercises,
            completedIndices: [],
            startTime: new Date().toISOString(),
            templateName: 'Custom Session' // Could track template name if loaded
        });

        // Go to home first then live workout, or directly live workout?
        // Directly to live workout is better UX
        router.push('/live-workout');
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

        // Check for existing log to append
        const existingLog = await StorageService.getLogForDate(date);
        let log: DailyLog;

        if (existingLog) {
            const updatedWorkouts = [...existingLog.workouts, workout];
            const newTotalVolume = CalculationService.calculateDailyVolume(updatedWorkouts);

            log = {
                ...existingLog,
                sleepQuality: parseInt(sleep),
                fatigue: parseInt(fatigue),
                workouts: updatedWorkouts,
                totalVolumeLoad: newTotalVolume,
                dailyLoad: newTotalVolume
            };
        } else {
            log = {
                date,
                sleepQuality: parseInt(sleep),
                fatigue: parseInt(fatigue),
                workouts: [workout],
                totalVolumeLoad: dailyVolume,
                dailyLoad: dailyVolume,
            };
        }

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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text variant="titleLarge">{t('workout')}</Text>
                        <Button mode="text" onPress={() => setShowTemplateList(true)} icon="download">
                            {t('load_template', { defaultValue: 'Load Template' })}
                        </Button>
                    </View>

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
                            right={props => (
                                <IconButton {...props} icon="delete" onPress={() => {
                                    const newExercises = exercises.filter((_, idx) => idx !== i);
                                    setExercises(newExercises);
                                }} />
                            )}
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
                        <Button mode="contained" onPress={handleStartLive} contentStyle={{ height: 50 }} icon="play-circle" style={{ marginBottom: 12 }}>
                            {t('start_live_workout', { defaultValue: 'Start Live Workout' })}
                        </Button>

                        <Text variant="bodySmall" style={{ textAlign: 'center', opacity: 0.5, marginBottom: 4 }}>
                            {t('or_log_manually', { defaultValue: 'OR Log manually' })}
                        </Text>

                        <Button mode="outlined" onPress={handleSaveLog}>
                            {t('save')}
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => router.back()}
                            style={{ marginTop: 12 }}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            mode="text"
                            onPress={() => setShowSaveTemplate(true)}
                            style={{ marginTop: 8 }}
                            disabled={exercises.length === 0}
                        >
                            {t('save_as_template', { defaultValue: 'Save as Template' })}
                        </Button>
                    </View>
                )}
            </ScrollView>

            <Portal>
                {/* Save Template Dialog */}
                <Dialog visible={showSaveTemplate} onDismiss={() => setShowSaveTemplate(false)}>
                    <Dialog.Title>{t('save_template')}</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label={t('template_name')}
                            value={newTemplateName}
                            onChangeText={setNewTemplateName}
                            mode="outlined"
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowSaveTemplate(false)}>{t('cancel')}</Button>
                        <Button onPress={handleSaveTemplate}>{t('save')}</Button>
                    </Dialog.Actions>
                </Dialog>

                {/* Load Template Modal */}
                <Modal visible={showTemplateList} onDismiss={() => setShowTemplateList(false)} contentContainerStyle={[styles.modalContent, { backgroundColor: colors.surface }]}>
                    <Text variant="headlineSmall" style={{ marginBottom: 16 }}>{t('select_template')}</Text>
                    <ScrollView style={{ maxHeight: 300 }}>
                        {templates.length === 0 ? (
                            <Text style={{ textAlign: 'center', margin: 20 }}>No templates found.</Text>
                        ) : (
                            templates.map(t => (
                                <List.Item
                                    key={t.id}
                                    title={t.name}
                                    description={`${t.exercises.length} Exercises`}
                                    onPress={() => handleLoadTemplate(t)}
                                    right={props => <IconButton {...props} icon="delete" onPress={() => handleDeleteTemplate(t.id)} />}
                                    style={{ borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}
                                />
                            ))
                        )}
                    </ScrollView>
                    <Button onPress={() => setShowTemplateList(false)} style={{ marginTop: 16 }} mode="outlined">
                        {t('close')}
                    </Button>
                </Modal>
            </Portal>
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
    },
    modalContent: {
        padding: 20,
        margin: 20,
        borderRadius: 12,
    }
});
