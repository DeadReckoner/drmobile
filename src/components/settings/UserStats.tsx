import { AppCard } from '@/components/AppCard';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import React from 'react';
import { StyleSheet } from 'react-native';

export const UserStats = () => {
  return (
    <AppCard padding-16 paddingH-16 style={styles.container}>
      <AppView gap-4 row spread centerV>
        <AppView center width={'50%'}>
          <TranslatedText translationKey="settings.streaks" body2 regular />
          <AppText textColor body2 center>
            0 {/* TODO: update from API data */}
          </AppText>
        </AppView>
        <AppView width={1} height={40} bg-textColor />
        <AppView center width={'50%'}>
          <TranslatedText translationKey="settings.performance" body2 regular />
          <AppText textColor body2 center>
            0% {/* TODO: update from API data */}
          </AppText>
        </AppView>
      </AppView>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    alignSelf: 'center',
  },
});
