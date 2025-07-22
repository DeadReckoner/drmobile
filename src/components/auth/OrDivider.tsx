import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const OrDivider = () => {
  return (
    <AppView center row margin-32>
      <AppView
        style={[styles.divider, { backgroundColor: Colors.highlight }]}
      />
      <TranslatedText marginH-16 translationKey="common.or" />
      <AppView
        style={[styles.divider, { backgroundColor: Colors.highlight }]}
      />
    </AppView>
  );
};

export default OrDivider;

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '40%',
  },
});
