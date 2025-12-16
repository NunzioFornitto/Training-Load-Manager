// @ts-nocheck
import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme, IconButton, List } from 'react-native-paper';
import { ExerciseEntry, Set } from '../types';
import { useTranslation } from 'react-i18next';
import { InfoButton } from './InfoButton';
import { EXERCISES } from '../data/exercises';

interface ExerciseInputProps {
    onSave: (exercise: ExerciseEntry) => void;
    onCancel: () => void;
}

export function ExerciseInput({ onSave, onCancel }: ExerciseInputProps) {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [sets, setSets] = useState<Set[]>([]);

    // Current Set Input
    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');
    const [rpe, setRpe] = useState('');

    const addSet = () => {
        if (!reps || !weight) return;
        setSets([...sets, {
            reps: parseInt(reps),
            weight: parseFloat(weight),
            rpe: rpe ? parseFloat(rpe) : undefined
        }]);
        setReps('');
    };

    const handleSave = () => {
        if (!name || sets.length === 0) return;
        onSave({ exerciseName: name, sets });
    };

    return (
        <Surface style={styles.container} elevation={2}>
            <Text variant="headlineSmall" style={{ marginBottom: 16, color: colors.primary }}>{t('add_exercise')}</Text>

            <TextInput
                mode="outlined"
                label={t('exercise_name_placeholder')}
                value={name}

                onChangeText={(text) => {
                    setName(text);
                    if (text.length > 1) {
                        const matches = EXERCISES.filter(ex => ex.toLowerCase().includes(text.toLowerCase()));
                        setSuggestions(matches.slice(0, 5));
                    } else {
                        setSuggestions([]);
                    }
                }}
                style={styles.input}
            />

            {suggestions.length > 0 && (
                <Surface style={[styles.suggestions, { backgroundColor: colors.elevation.level3 }]} elevation={3}>
                    {suggestions.map((suggestion, index) => (
                        <List.Item
                            key={index}
                            title={suggestion}
                            onPress={() => {
                                setName(suggestion);
                                setSuggestions([]);
                            }}
                            style={{ padding: 0 }}
                            titleStyle={{ fontSize: 14 }}
                        />
                    ))}
                </Surface>
            )}

            <View style={styles.setForm}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text variant="labelMedium">{t('add_set')}</Text>
                    <InfoButton title={t('explanation.rpe_title')} description={t('explanation.rpe_desc')} />
                </View>
                <View style={styles.row}>
                    <TextInput
                        mode="outlined"
                        label={t('reps')}
                        keyboardType="numeric"
                        value={reps}
                        onChangeText={setReps}
                        style={[styles.input, styles.smallInput]}
                        dense
                    />
                    <TextInput
                        mode="outlined"
                        label={t('kg')}
                        keyboardType="numeric"
                        value={weight}
                        onChangeText={setWeight}
                        style={[styles.input, styles.smallInput]}
                        dense
                    />
                    <TextInput
                        mode="outlined"
                        label={t('rpe')}
                        keyboardType="numeric"
                        value={rpe}
                        onChangeText={setRpe}
                        style={[styles.input, styles.smallInput]}
                        dense
                        maxLength={2}
                    />
                    <IconButton
                        icon="plus-circle"
                        size={30}
                        iconColor={colors.primary}
                        onPress={addSet}
                        disabled={!reps || !weight}
                        style={{ margin: 0, alignSelf: 'center' }}
                    />
                </View>
            </View>

            <ScrollView style={styles.setsList} nestedScrollEnabled>
                {sets.map((s, i) => (
                    <View key={i} style={[styles.setRow, { borderBottomColor: colors.outlineVariant }]}>
                        <Text variant="bodyMedium">{t('set')} {i + 1}:</Text>
                        <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}> {s.reps} x {s.weight}{t('kg')}</Text>
                        <Text variant="bodySmall"> @ {t('rpe')} {s.rpe || '-'}</Text>
                        <IconButton
                            icon="delete"
                            size={20}
                            iconColor={colors.error}
                            onPress={() => setSets(sets.filter((_, idx) => idx !== i))}
                        />
                    </View>
                ))}
                {sets.length === 0 && (
                    <Text variant="bodySmall" style={{ fontStyle: 'italic', textAlign: 'center', opacity: 0.6 }}>{t('no_sets')}</Text>
                )}
            </ScrollView>

            <View style={styles.actions}>
                <Button mode="contained" onPress={handleSave} disabled={!name || sets.length === 0} style={{ marginBottom: 8 }}>
                    {t('save_exercise')}
                </Button>
                <Button mode="outlined" onPress={onCancel}>
                    {t('cancel')}
                </Button>
            </View>
        </Surface>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    input: {
        marginBottom: 8,
        backgroundColor: 'transparent',
    },
    setForm: {
        marginTop: 8,
    },
    suggestions: {
        position: 'absolute',
        top: 130, // Adjust based on input height
        left: 16,
        right: 16,
        zIndex: 1000,
        borderRadius: 8,
        zIndex: 1000,
        borderRadius: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    smallInput: {
        flex: 1,
    },
    setsList: {
        maxHeight: 200,
        marginVertical: 16,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 8,
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderBottomWidth: 1,
    },
    actions: {
        marginTop: 8,
    }
});
