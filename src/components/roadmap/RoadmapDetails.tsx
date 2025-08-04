import { Divider } from '@/components/Divider';
import { MilestonesList } from '@/components/roadmap/MilestonesList';
import { RoadmapOverview } from '@/components/roadmap/RoadmapOverview';
import { AppView } from '@/components/ui';
import { RoadmapType } from '@/hooks/create/types/roadmap.types';

interface RoadmapDetailsProps {
  roadmap: RoadmapType;
}
export const RoadmapDetails = ({ roadmap }: RoadmapDetailsProps) => {
  return (
    <AppView flex>
      <RoadmapOverview roadmap={roadmap} />
      <Divider marginT-32 />
      <MilestonesList milestones={roadmap.Milestones} />
      <Divider marginT-32 />
    </AppView>
  );
};
