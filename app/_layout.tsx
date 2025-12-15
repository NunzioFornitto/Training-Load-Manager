// @ts-nocheck
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { ThemeProvider, useAppTheme } from '../src/context/ThemeContext';
import '../src/i18n';

function LayoutContent() {
    const { isDark } = useAppTheme();
    const paperTheme = isDark ? MD3DarkTheme : MD3LightTheme;
    const navigationTheme = isDark ? DarkTheme : DefaultTheme;

    return (
        <NavigationThemeProvider value={navigationTheme}>
            <PaperProvider theme={paperTheme}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="input" options={{ title: 'New Entry' }} />
                    <Stack.Screen name="tutorial" options={{ presentation: 'modal', headerShown: false }} />
                    <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style={isDark ? "light" : "dark"} />
            </PaperProvider>
        </NavigationThemeProvider>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <LayoutContent />
        </ThemeProvider>
    );
}
