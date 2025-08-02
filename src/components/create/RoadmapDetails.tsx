import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/ui';
import { RoadmapType } from '@/hooks/create/types/roadmap.types';

interface RoadmapDetailsProps {
  roadmap: RoadmapType;
}
export const RoadmapDetails = ({ roadmap }: RoadmapDetailsProps) => {
  return (
    <AppCard>
      <AppText xsm textColor>
        {roadmap.Description}
      </AppText>
    </AppCard>
  );
};
