import { IconSymbol } from '@/components/ui/IconSymbol';
import { useLocalization } from '@/hooks/useLocalization';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const { t } = useLocalization();
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: t('authentication.login'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="calendar" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
