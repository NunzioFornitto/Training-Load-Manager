// @ts-nocheck
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, Title, Paragraph, Button, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TutorialScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Surface style={[styles.surface, { backgroundColor: colors.surface }]} elevation={2}>
                    <Title style={[styles.title, { color: colors.primary }]}>{t('welcome')}</Title>
                    <Paragraph style={[styles.text, { color: colors.onSurface }]}>
                        {t('tutorial_content')}
                    </Paragraph>
                    <Button
                        mode="contained"
                        onPress={() => router.back()}
                        style={styles.button}
                    >
                        {t('close')}
                    </Button>
                </Surface>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        flexGrow: 1,
        justifyContent: 'center',
    },
    surface: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 30,
        textAlign: 'left',
    },
    button: {
        width: '100%',
        borderRadius: 8,
    },
});
