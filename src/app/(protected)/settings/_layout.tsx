import { resetStackScreenOptions } from '@/utils/navigation.utils';
import { Stack } from 'expo-router';
import React from 'react';

const SettingsLayout = () => {
  return <Stack screenOptions={resetStackScreenOptions} />;
};

export default SettingsLayout;
