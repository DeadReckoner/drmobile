import { AppScreen } from '@/components/AppScreen';
import { AppView } from '@/components/ui';
import React, { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardGestureArea,
  KeyboardToolbar,
} from 'react-native-keyboard-controller';

export const AppKeyboardController = ({ children }: PropsWithChildren) => {
  return (
    <>
      <AppScreen>
        <KeyboardGestureArea style={styles.gestureWrapper} interpolator="ios">
          <KeyboardAwareScrollView
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentOffset={{ y: 100, x: 0 }}
            bottomOffset={100}
            contentContainerStyle={styles.contentScrollview}>
            <AppView flex>{children}</AppView>
          </KeyboardAwareScrollView>
        </KeyboardGestureArea>
      </AppScreen>
      <KeyboardToolbar />
    </>
  );
};

const styles = StyleSheet.create({
  gestureWrapper: {
    flexGrow: 1,
  },
  contentScrollview: {
    flexGrow: 1,
  },
});
