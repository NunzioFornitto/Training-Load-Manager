import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { StorageService } from '../services/storage';
import { CalculationService } from '../services/calculations';
import { DailyLog } from '../types';
import { format } from 'date-fns';

export function useTrainingData() {
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [stats, setStats] = useState({
        acuteLoad: 0,
        chronicLoad: 0,
        ratio: 0,
        suggestionKey: 'maintain',
        riskLevelKey: 'low',
        fatigueWarning: false,
    });
    const [todayLog, setTodayLog] = useState<DailyLog | null>(null);

    const loadData = useCallback(async () => {
        const data = await StorageService.getDailyLogs();
        setLogs(data);

        const today = format(new Date(), 'yyyy-MM-dd');
        const todayEntry = data.find(d => d.date === today);
        setTodayLog(todayEntry || null);

        // Transform logs for generic calculation
        const history = data.map(l => ({ date: l.date, load: l.dailyLoad }));

        // Calculate ACWR
        const { acuteLoad, chronicLoad, ratio } = CalculationService.calculateACWR(history, today);

        // Get suggestions
        // Use yesterday's fatigue/sleep or today's if available for autoregulation
        const latestLog = data.sort((a, b) => b.date.localeCompare(a.date))[0];
        const sleep = latestLog ? latestLog.sleepQuality : 7;
        const fatigue = latestLog ? latestLog.fatigue : 3;

        const { suggestionKey, riskLevelKey, fatigueWarning } = CalculationService.getSuggestions(ratio, fatigue, sleep);

        setStats({
            acuteLoad,
            chronicLoad,
            ratio,
            suggestionKey,
            riskLevelKey,
            fatigueWarning
        });
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    return { logs, stats, todayLog, refresh: loadData };
}
