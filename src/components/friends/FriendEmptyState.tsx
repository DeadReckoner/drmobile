import { AppIcon } from '@/components/AppIcon';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface FriendEmptyStateProps {
  messageKey?: TranslationKeysType;
}

export const FriendEmptyState = ({
  messageKey = 'settings.no_friends_found',
}: FriendEmptyStateProps) => {
  return (
    <AppView style={styles.container}>
      <AppIcon set="Feather" name="user" size={48} color={Colors.secondary} />
      <TranslatedText marginT-16 secondary translationKey={messageKey} />
    </AppView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
  },
});
