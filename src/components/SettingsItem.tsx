import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import React from 'react';
import { StyleSheet } from 'react-native';

interface SettingsItemProps {
  translationKey: TranslationKeysType;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  centerElement?: React.ReactNode;
  textColor?: string;
}

export const SettingsItem = ({
  translationKey,
  leftElement,
  centerElement,
  rightElement,
  textColor,
}: SettingsItemProps) => {
  return (
    <AppView
      row
      centerV
      paddingH-16
      paddingV-16
      gap-16
      style={styles.container}>
      {leftElement && <AppView left>{leftElement}</AppView>}
      <AppView flex gap-4>
        <TranslatedText
          body2
          color={textColor}
          translationKey={translationKey}
        />
        {centerElement}
      </AppView>
      {rightElement && <AppView right>{rightElement}</AppView>}
    </AppView>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
  },
});
