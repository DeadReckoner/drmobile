import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Colors } from 'react-native-ui-lib';

interface AndroidSystemBarsInsetProps {
  children: React.ReactNode;
}

/**
 * Keeps the whole app clear of Android's status bar and navigation bar.
 *
 * Android now always draws apps edge-to-edge, i.e. underneath both system
 * bars. Most screens here were laid out before that and do not pad for the
 * bars themselves (Today relies on an iOS-only scroll view setting, the tab
 * bar has a fixed height, Login uses a fixed top padding), so on Android the
 * header sat under the clock and the bottom of every screen sat under the
 * navigation buttons.
 *
 * Rather than fix each screen, this pads the root once and then reports the
 * top and bottom insets to everything below as zero, so screens that do read
 * the insets (AppScreen's `safeArea`, the tab bar, bottom sheets) do not pad
 * a second time.
 *
 * iOS is untouched: it renders the children as they are.
 */
export const AndroidSystemBarsInset = ({
  children,
}: AndroidSystemBarsInsetProps) => {
  const insets = useSafeAreaInsets();

  const consumedInsets = useMemo(
    () => ({ ...insets, top: 0, bottom: 0 }),
    [insets],
  );

  if (Platform.OS !== 'android') {
    return <>{children}</>;
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: Colors.screenBG,
        },
      ]}>
      <SafeAreaInsetsContext.Provider value={consumedInsets}>
        {children}
      </SafeAreaInsetsContext.Provider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
