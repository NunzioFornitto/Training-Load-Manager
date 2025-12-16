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
        let acuteDays = 0;
        for (let i = 0; i < 7; i++) {
            const dateStr = format(subDays(parseISO(targetDate), i), 'yyyy-MM-dd');
            if (loadMap.has(dateStr)) {
                acuteSum += loadMap.get(dateStr) || 0;
                acuteDays++;
            }
        }
        // If we have very few days of data, average only over present days to avoid underestimation,
        // BUT for ACWR we usually want the trailing 7 days regardless. 
        // However, standard ACWR assumes a history.
        // Handling cold start:
        const acuteLoad = acuteSum / 7;

        // Calculate Chronic Load (28 days)
        let chronicSum = 0;
        for (let i = 0; i < 28; i++) {
            const dateStr = format(subDays(parseISO(targetDate), i), 'yyyy-MM-dd');
            chronicSum += loadMap.get(dateStr) || 0;
        }
        const chronicLoad = chronicSum / 28;

        // COLD START FIX:
        // If Chronic Load is very low (e.g. first week), ratio blows up.
        // We can use the "average of valid days" for the first month?
        // Or simply clamp the ratio or use Acute as Chronic for the first week.

        let ratio = 0;
        if (chronicLoad === 0) {
            // New user: Ratio is 1.0 (neutral) if acute is present, else 0
            ratio = acuteLoad > 0 ? 1.0 : 0;
        } else {
            ratio = acuteLoad / chronicLoad;
        }

        // Safety clamp for very first few days where chronic is tiny compared to acute
        // e.g. Day 1: Acute = L/7, Chronic = L/28 -> Ratio 4.0.
        // We detect this "ramp up" phase if history length is short? 
        // We don't have history length passed plainly here, but we can see chronic is small.
        // Heuristic: If chronicLoad is significantly smaller than acuteLoad (> 2x) AND raw chronic is small, 
        // it might be startup. 
        // Better approach: Uncoupled ACWR often uses EWMA. 
        // For simple RA:
        // Let's soft-clamp the denominator to be at least (AcuteLoad * 0.5) to prevent explosion?
        // Or simply: If history is short, trust Acute directly?
        // Let's implement a "Startup Period" Logic:
        // If Chronic < Acute / 1.5 (Ratio > 1.5) AND we have less than 4 weeks of data...
        // Assuming we can't easily know "total days of data" without scanning history keys.
        // Let's Count total history entries.

        if (history.length < 28 && ratio > 1.5) {
            // Startup phase correction: 
            // Regress ratio towards 1.0 based on how few data points we have?
            // Simple fix: If history < 7 days, Ratio = 1.0 (Building baseline).
            // If history < 28 days, dampen the high ratio.
            ratio = 1.0 + (ratio - 1.0) * (history.length / 28);
        }

        return {
            acuteLoad,
            chronicLoad,
            ratio,
        };
    },

    getSuggestions(ratio: number, fatigue: number, sleep: number) {
        let suggestionKey = "maintain";
        let riskLevelKey = "low";

        // WELLNESS WEIGHTING
        // Sleep: 1 (Bad) - 5 (Good). 
        // Fatigue: 1 (Fresh) - 5 (Exhausted).
        // Let's normalize to a "Readiness Score" (0-100) or usage penalty.
        // Poor Sleep (<3) is bad. High Fatigue (>3) is bad.

        const isPoorSleep = sleep <= 2;
        const isHighFatigue = fatigue >= 4;
        const isTerribleSleep = sleep === 1;
        const isExhausted = fatigue === 5;

        // Base Logic on Ratio
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

        // Apply Wellness Modifiers
        // If readiness is very low, ESCALATE risk.
        if (isExhausted || isTerribleSleep) {
            // Instant High Risk regardless of ratio (unless ratio is very low? No, injury risk is high if exhausted)
            riskLevelKey = "high";
            suggestionKey = "fatigue_warning"; // We might want a specific key or override
        } else if ((isPoorSleep || isHighFatigue) && riskLevelKey === 'optimal') {
            // Downgrade optimal to moderate risk due to fatigue
            riskLevelKey = "moderate";
            suggestionKey = "maintain"; // Don't push it
        }

        return {
            suggestionKey,
            riskLevelKey,
            fatigueWarning: isPoorSleep || isHighFatigue
        };
    }
};
