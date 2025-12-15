export interface Set {
    reps: number;
    weight: number;
    rpe?: number; // Optional per-set RPE
}

export interface ExerciseEntry {
    exerciseName: string;
    sets: Set[];
}

export interface Workout {
    id: string;
    date: string; // ISO Date String
    exercises: ExerciseEntry[];
    sessionRPE?: number; // 1-10
    durationMinutes?: number;
    notes?: string;
}

export interface DailyLog {
    date: string; // ISO Date String (YYYY-MM-DD)
    sleepQuality: number; // 1-10
    fatigue: number; // 1-10 (1 = fresh, 10 = exhausted)
    workouts: Workout[];
    totalVolumeLoad: number;
    dailyLoad: number; // Could be volume load or sRPE
}

export interface TrainingStats {
    date: string;
    acuteLoad: number; // 7-day average
    chronicLoad: number; // 28-day average (or EWMA)
    acwr: number;
    freshnessIndex: number; // Derived from ACWR or separate
}
