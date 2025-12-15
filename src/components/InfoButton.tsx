// @ts-nocheck
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Portal, Dialog, Text, Button, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

interface InfoButtonProps {
    title: string;
    description: string;
}

export const InfoButton = ({ title, description }: InfoButtonProps) => {
    const [visible, setVisible] = useState(false);
    const { colors } = useTheme();
    const { t } = useTranslation();

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    return (
        <View>
            <IconButton
                icon="help-circle-outline"
                size={18}
                onPress={showDialog}
                style={styles.iconButton}
                iconColor={colors.onSurfaceVariant}
            />
            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>{title}</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">{description}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>{t('close')}</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    iconButton: {
        margin: 0,
        marginLeft: 4,
    },
});
