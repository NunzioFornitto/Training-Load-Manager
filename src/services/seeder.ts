import { StorageService } from './storage';
import { DailyLog } from '../types';
import { subDays, format } from 'date-fns';

export const Seeder = {
    async seedData() {
        await StorageService.clearAll();

        const logs: DailyLog[] = [];
        const today = new Date();

        // Generate 30 days of history
        for (let i = 30; i >= 0; i--) {
            const date = subDays(today, i);
            const dateStr = format(date, 'yyyy-MM-dd');

            // Random volume load fluctuating
            // Base load around 5000kg, increasing slowly
            const baseLoad = 5000 + (30 - i) * 50;
            const noise = (Math.random() - 0.5) * 1000;
            const volume = Math.max(0, baseLoad + noise);

            // Random rest days
            if (Math.random() > 0.8) {
                // Rest day
                logs.push({
                    date: dateStr,
                    sleepQuality: 8,
                    fatigue: 2,
                    workouts: [],
                    totalVolumeLoad: 0,
                    dailyLoad: 0,
                });
            } else {
                logs.push({
                    date: dateStr,
                    sleepQuality: Math.floor(Math.random() * 5) + 5, // 5-10
                    fatigue: Math.floor(Math.random() * 5) + 1, // 1-5
                    workouts: [{
                        id: dateStr,
                        date: dateStr,
                        exercises: [], // Empty exercises but load is set
                    }],
                    totalVolumeLoad: volume,
                    dailyLoad: volume,
                });
            }
        }

        for (const log of logs) {
            await StorageService.saveDailyLog(log);
        }

        return logs.length;
    }
};
