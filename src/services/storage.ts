import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyLog, TrainingStats, WorkoutTemplate, WorkoutSession } from '../types';

const KEYS = {
    DAILY_LOGS: 'tlm_daily_logs',
    STATS: 'tlm_stats',
    THEME: 'tlm_theme_pref',
    TEMPLATES: 'tlm_templates',
    CURRENT_WORKOUT: 'tlm_current_workout',
};

export const StorageService = {
    async saveTheme(theme: 'light' | 'dark' | 'auto'): Promise<void> {
        try {
            await AsyncStorage.setItem(KEYS.THEME, theme);
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    },

    async getTheme(): Promise<'light' | 'dark' | 'auto'> {
        try {
            const theme = await AsyncStorage.getItem(KEYS.THEME);
            return (theme as 'light' | 'dark' | 'auto') || 'auto';
        } catch (e) {
            return 'auto';
        }
    },

    async saveDailyLog(log: DailyLog): Promise<void> {
        try {
            const existingLogs = await this.getDailyLogs();
            // Update or push
            const index = existingLogs.findIndex(l => l.date === log.date);
            if (index >= 0) {
                existingLogs[index] = log;
            } else {
                existingLogs.push(log);
            }
            await AsyncStorage.setItem(KEYS.DAILY_LOGS, JSON.stringify(existingLogs));
        } catch (e) {
            console.error('Failed to save daily log', e);
        }
    },

    async getDailyLogs(): Promise<DailyLog[]> {
        try {
            const data = await AsyncStorage.getItem(KEYS.DAILY_LOGS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to get daily logs', e);
            return [];
        }
    },

    async getLogForDate(date: string): Promise<DailyLog | null> {
        const logs = await this.getDailyLogs();
        return logs.find(l => l.date === date) || null;
    },

    async clearAll(): Promise<void> {
        await AsyncStorage.clear();
    },

    async saveTemplate(template: WorkoutTemplate): Promise<void> {
        try {
            const templates = await this.getTemplates();
            // Check if exists update, else push
            const index = templates.findIndex(t => t.id === template.id);
            if (index >= 0) {
                templates[index] = template;
            } else {
                templates.push(template);
            }
            await AsyncStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
        } catch (e) {
            console.error('Failed to save template', e);
        }
    },

    async getTemplates(): Promise<WorkoutTemplate[]> {
        try {
            const data = await AsyncStorage.getItem(KEYS.TEMPLATES);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to get templates', e);
            return [];
        }
    },

    async deleteTemplate(id: string): Promise<void> {
        try {
            const templates = await this.getTemplates();
            const newTemplates = templates.filter(t => t.id !== id);
            await AsyncStorage.setItem(KEYS.TEMPLATES, JSON.stringify(newTemplates));
        } catch (e) {
            console.error('Failed to delete template', e);
        }
    },

    async saveCurrentWorkout(session: WorkoutSession): Promise<void> {
        try {
            await AsyncStorage.setItem(KEYS.CURRENT_WORKOUT, JSON.stringify(session));
        } catch (e) {
            console.error('Failed to save current workout', e);
        }
    },

    async getCurrentWorkout(): Promise<WorkoutSession | null> {
        try {
            const data = await AsyncStorage.getItem(KEYS.CURRENT_WORKOUT);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to get current workout', e);
            return null;
        }
    },

    async clearCurrentWorkout(): Promise<void> {
        try {
            await AsyncStorage.removeItem(KEYS.CURRENT_WORKOUT);
        } catch (e) {
            console.error('Failed to clear current workout', e);
        }
    }
};
