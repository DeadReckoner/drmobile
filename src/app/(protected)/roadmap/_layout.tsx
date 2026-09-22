import { NextMilestoneGenerationManager } from '@/components/roadmap/ai-roamap/NextMilestoneGenerationManager';
import { PlanImportManager } from '@/components/roadmap/ai-roamap/PlanImportManager';
import { resetStackScreenOptions } from '@/utils/navigation.utils';
import { Stack } from 'expo-router';
import React from 'react';

const Layout = () => {
  return (
    <>
      <NextMilestoneGenerationManager />
      <PlanImportManager />
      <Stack screenOptions={resetStackScreenOptions} />
    </>
  );
};

export default Layout;
