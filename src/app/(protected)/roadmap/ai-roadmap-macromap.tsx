import { AppScreen } from '@/components/AppScreen';
import { MacroMapList } from '@/components/roadmap/ai-roamap/MacroMapList';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectDraftRoadmap } from '@/store/slices/roadmapDraftSlice';
import React from 'react';

const AIRoadmapMacroView = () => {
  const roadmap = useAppSelector(selectDraftRoadmap);

  return (
    <AppScreen>
      {roadmap?.macro_map && <MacroMapList macroMap={roadmap.macro_map} />}
    </AppScreen>
  );
};

export default AIRoadmapMacroView;
