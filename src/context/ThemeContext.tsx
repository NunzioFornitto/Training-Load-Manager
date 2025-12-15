import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { StorageService } from '../services/storage';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    themeMode: 'auto',
    setThemeMode: () => { },
    isDark: false,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');

    useEffect(() => {
        StorageService.getTheme().then(mode => {
            setThemeModeState(mode);
        });
    }, []);

    const setThemeMode = async (mode: ThemeMode) => {
        setThemeModeState(mode);
        await StorageService.saveTheme(mode);
    };

    const isDark = themeMode === 'auto'
        ? systemScheme === 'dark'
        : themeMode === 'dark';

    return (
        <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useAppTheme = () => useContext(ThemeContext);
