import { DailyLog, Set } from '../types';
import { differenceInDays, parseISO, subDays, format } from 'date-fns';

export const CalculationService = {
    calculateVolumeLoad(sets: Set[]): number {
        return sets.reduce((acc, set) => acc + (set.reps * set.weight), 0);
    },

    calculateDailyVolume(workouts: { exercises: { sets: Set[] }[] }[]): number {
        let total = 0;
        workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                total += this.calculateVolumeLoad(exercise.sets);
            });
        });
        return total;
    },

    /**
     * Calculates ACWR based on a specific metric (Volume Load or sRPE).
     * @param history Array of { date: string, load: number }
     * @param targetDate The date to calculate stats for (YYYY-MM-DD)
     */
    calculateACWR(history: { date: string; load: number }[], targetDate: string) {
        // Create a map for quick lookup
        const loadMap = new Map<string, number>();
        history.forEach(h => loadMap.set(h.date, h.load));

        // Calculate Acute Load (7 days)
        let acuteSum = 0;
        for (let i = 0; i < 7; i++) {
            const dateStr = format(subDays(parseISO(targetDate), i), 'yyyy-MM-dd');
            acuteSum += loadMap.get(dateStr) || 0;
        }
        const acuteLoad = acuteSum / 7;

        // Calculate Chronic Load (28 days)
        let chronicSum = 0;
        for (let i = 0; i < 28; i++) {
            const dateStr = format(subDays(parseISO(targetDate), i), 'yyyy-MM-dd');
            chronicSum += loadMap.get(dateStr) || 0;
        }
        const chronicLoad = chronicSum / 28;

        const ratio = chronicLoad === 0 ? 0 : acuteLoad / chronicLoad;

        return {
            acuteLoad,
            chronicLoad,
            ratio,
        };
    },

    getSuggestions(ratio: number, fatigue: number, sleep: number) {
        let suggestionKey = "maintain";
        let riskLevelKey = "low";

        if (ratio > 1.5) {
            suggestionKey = "high_risk";
            riskLevelKey = "high";
        } else if (ratio > 1.3) {
            suggestionKey = "increase_rapid";
            riskLevelKey = "moderate";
        } else if (ratio < 0.8) {
            suggestionKey = "decrease";
            riskLevelKey = "low";
        } else {
            suggestionKey = "optimal";
            riskLevelKey = "optimal";
        }

        // Autoregulation modifiers
        let fatigueWarning = false;
        if (fatigue >= 8 || sleep <= 5) {
            fatigueWarning = true;
        }

        return { suggestionKey, riskLevelKey, fatigueWarning };
    }
};
