import { AppScreen } from '@/components/AppScreen';
import { AiRoadmapCreationList } from '@/components/roadmap/ai-roamap/AiRoadmapCreationList';

const AIRoadmap = () => {
  return (
    <AppScreen paddingH-0 safeArea>
      <AiRoadmapCreationList />
    </AppScreen>
  );
};

export default AIRoadmap;
