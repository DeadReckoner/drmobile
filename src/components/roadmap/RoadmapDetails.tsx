import { Divider } from '@/components/Divider';
import { MilestonesList } from '@/components/roadmap/MilestonesList';
import { RoadmapOverview } from '@/components/roadmap/RoadmapOverview';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import type { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { router } from 'expo-router';

interface RoadmapDetailsProps {
  roadmap: RoadmapType;
}
export const RoadmapDetails = ({ roadmap }: RoadmapDetailsProps) => {
  const handleOnAddNewMilestone = () => {
    router.navigate({
      pathname: '/(protected)/roadmap/add-milestone',
    });
  };
  return (
    <AppView flex>
      <RoadmapOverview roadmap={roadmap} />
      <Divider marginT-16 />
      <TranslatedText body1 marginB-16 translationKey="common.milestones" />
      <Divider marginT-16 />
      <MilestonesList
        milestones={roadmap.Milestones}
        handleOnAddNewMilestone={handleOnAddNewMilestone}
      />
    </AppView>
  );
};
