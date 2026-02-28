import { AppScreen } from '@/components/AppScreen';
import { StrategicMapList } from '@/components/roadmap/ai-roamap/StrategicMapList';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectDraftRoadmap } from '@/store/slices/roadmapDraftSlice';
import React from 'react';

const AIRoadmapMacroView = () => {
  const roadmap = useAppSelector(selectDraftRoadmap);

  return (
    <AppScreen>
      {roadmap?.phases && roadmap.phases.length > 0 && (
        <StrategicMapList phases={roadmap.phases} />
      )}
    </AppScreen>
  );
};

export default AIRoadmapMacroView;
