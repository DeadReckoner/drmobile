import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { CompleteProfile } from '@/components/auth/CompleteProfile';
import { BottomTabBarButton } from '@/components/BottomTabBarButton';
import { useLocalization } from '@/hooks/useLocalization';
import { useAppSelector } from '@/store/hooks/store.hooks';
import {
  resetDraftAction,
  setShouldSyncWithServerAction,
} from '@/store/slices/roadmapDraftSlice';
import { selectTheme } from '@/store/slices/settingsSlice';
import { store } from '@/store/store';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { Colors, Typography } from 'react-native-ui-lib';

export default function TabLayout() {
  const { t } = useLocalization();
  const theme = useAppSelector(selectTheme);

  const screenOptions: BottomTabNavigationOptions = useMemo(
    () => ({
      tabBarStyle: {
        backgroundColor: Colors.bottomTabBar,
        height: 100,
        paddingTop: 8,
      },
      tabBarInactiveTintColor: Colors.tabInactiveColor,
      tabBarActiveTintColor: Colors.tabActiveColor,
      tabBarLabelStyle: [Typography.tabLabel, { marginTop: 8 }],
      tabBarButton: BottomTabBarButton,
      headerShown: false,
      tabBarHideOnKeyboard: true,
      animation: 'none',
    }),

    // LintRuleDisabledReason
    // The 'theme' dependency is included to ensure tab bar colors update when the theme changes.
    // Although not directly referenced, it triggers re-computation for correct react-native-ui-lib colors.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  return (
    <AppScreen paddingH-0>
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.today'),
            tabBarIcon: ({ color }) => (
              <AppIcon size={28} name="home" color={color} />
            ),
          }}
          listeners={{
            tabPress: () => {
              store.dispatch(resetDraftAction());
            },
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: t('tabs.progress'),
            tabBarIcon: ({ color }) => (
              <AppIcon name="barschart" size={28} color={color} />
            ),
          }}
          listeners={{
            focus: () => {
              store.dispatch(setShouldSyncWithServerAction(true));
            },
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: t('tabs.create'),
            tabBarIcon: ({ color }) => (
              <AppIcon size={28} name="plus" color={color} />
            ),
          }}
          listeners={({ route }) => ({
            tabPress: () => {
              if (route.name === 'create') {
                store.dispatch(resetDraftAction());
              }
            },
            focus: () => {
              store.dispatch(setShouldSyncWithServerAction(false));
            },
          })}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: t('tabs.messages'),
            tabBarIcon: ({ color }) => (
              <AppIcon size={24} name="message1" color={color} />
            ),
          }}
        />
      </Tabs>
      <CompleteProfile />
    </AppScreen>
  );
}
