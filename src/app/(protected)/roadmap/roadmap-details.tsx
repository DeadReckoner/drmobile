import { AppKeyboardController } from '@/components/AppKeyboardController';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { RoadmapDetails } from '@/components/roadmap/RoadmapDetails';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectDraftRoadmap } from '@/store/slices/roadmapDraftSlice';

const RoadmapDetailsPage = () => {
  const roadmap = useAppSelector(selectDraftRoadmap);
  return (
    <AppKeyboardController>
      <HeaderWithBack headerText={roadmap.goal} />
      <Divider marginT-16 />
      <RoadmapDetails roadmap={roadmap} />
    </AppKeyboardController>
  );
};

export default RoadmapDetailsPage;
