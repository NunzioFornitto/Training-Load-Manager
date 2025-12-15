// @ts-nocheck
import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { List, RadioButton, useTheme, Surface, Text, Appbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../src/context/ThemeContext';
import i18n from '../../src/i18n';

export default function SettingsScreen() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { themeMode, setThemeMode } = useAppTheme();

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Appbar.Header elevated>
                <Appbar.Content title={t('settings')} />
            </Appbar.Header>
            <ScrollView contentContainerStyle={styles.content}>

                {/* Theme Selection */}
                <Surface style={[styles.section, { backgroundColor: colors.elevation.level1 }]} elevation={1}>
                    <Text variant="titleMedium" style={{ marginBottom: 16, paddingHorizontal: 16, paddingTop: 16 }}>
                        {t('theme_mode')}
                    </Text>
                    <RadioButton.Group onValueChange={value => setThemeMode(value)} value={themeMode}>
                        <RadioButton.Item label={t('theme.auto')} value="auto" />
                        <RadioButton.Item label={t('theme.light')} value="light" />
                        <RadioButton.Item label={t('theme.dark')} value="dark" />
                    </RadioButton.Group>
                </Surface>

                {/* Language Selection */}
                <Surface style={[styles.section, { backgroundColor: colors.elevation.level1 }]} elevation={1}>
                    <Text variant="titleMedium" style={{ marginBottom: 16, paddingHorizontal: 16, paddingTop: 16 }}>
                        {t('language')}
                    </Text>
                    <RadioButton.Group onValueChange={changeLanguage} value={i18n.language}>
                        <RadioButton.Item label="English" value="en" />
                        <RadioButton.Item label="Italiano" value="it" />
                    </RadioButton.Group>
                </Surface>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    section: {
        borderRadius: 12,
        overflow: 'hidden',
        paddingBottom: 8,
        marginBottom: 16,
    },
});
