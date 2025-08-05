import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { RoadmapDetails } from '@/components/roadmap/RoadmapDetails';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectDraftRoadmap } from '@/store/slices/roadmapDraftSlice';

const AddTask = () => {
  //TODO: For testing
  const roadmap = useAppSelector(selectDraftRoadmap);
  return (
    <AppScreen>
      <HeaderWithBack headerText={roadmap.Goal} />
      <Divider />
      <RoadmapDetails roadmap={roadmap} />
    </AppScreen>
  );
};

export default AddTask;
