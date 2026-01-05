import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import React from 'react';
import { StyleSheet } from 'react-native';

const ComingSoonPage = () => {
  return (
    <AppScreen safeArea>
      <HeaderWithBack />
      <AppView flex center absV absH padding-24 marginB-64>
        <AppIcon set="Ionicons" name="rocket" size={120} style={styles.icon} />
        <TranslatedText
          marginT-24
          marginB-8
          h2
          regular
          center
          translationKey="coming_soon.title"
        />
        <TranslatedText light center translationKey="coming_soon.description" />
      </AppView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  icon: {
    opacity: 0.8,
  },
});

export default ComingSoonPage;
