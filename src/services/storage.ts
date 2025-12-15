import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyLog, TrainingStats } from '../types';

const KEYS = {
    DAILY_LOGS: 'tlm_daily_logs',
    STATS: 'tlm_stats',
    THEME: 'tlm_theme_pref',
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
};
