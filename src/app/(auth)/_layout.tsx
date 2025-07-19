import { screenOptions } from '@/utils/navigation.utils';
import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return <Stack screenOptions={screenOptions} />;
}
