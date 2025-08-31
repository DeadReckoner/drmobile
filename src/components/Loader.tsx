import { AppView } from '@/components/ui';
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

export const Loader = () => {
  return (
    <AppView
      style={[
        StyleSheet.absoluteFillObject,
        styles.loader,
        { backgroundColor: Colors.dialogOverlay },
      ]}>
      <ActivityIndicator color={Colors.white} />
    </AppView>
  );
};

const styles = StyleSheet.create({
  loader: {
    zIndex: 1000,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
