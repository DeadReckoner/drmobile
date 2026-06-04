import { NextMilestoneGenerationManager } from '@/components/roadmap/ai-roamap/NextMilestoneGenerationManager';
import { resetStackScreenOptions } from '@/utils/navigation.utils';
import { Stack } from 'expo-router';
import React from 'react';

const Layout = () => {
  return (
    <>
      <NextMilestoneGenerationManager />
      <Stack screenOptions={resetStackScreenOptions} />
    </>
  );
};

export default Layout;
