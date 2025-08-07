import { Divider } from '@/components/Divider';
import { MilestonesList } from '@/components/roadmap/MilestonesList';
import { RoadmapOverview } from '@/components/roadmap/RoadmapOverview';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import type {
  MilestoneType,
  RoadmapType,
  TaskType,
} from '@/hooks/roadmap/types/roadmap.types';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import {
  setSelectedMilestoneAction,
  setSelectedTaskAction,
} from '@/store/slices/roadmapDraftSlice';
import { router } from 'expo-router';

interface RoadmapDetailsProps {
  roadmap: RoadmapType;
}
export const RoadmapDetails = ({ roadmap }: RoadmapDetailsProps) => {
  const dispatch = useAppDispatch();

  const handleMilestonePress = (milestone: MilestoneType | null) => {
    dispatch(setSelectedMilestoneAction(milestone));
  };
  const handleOnAddNewMilestone = () => {
    router.navigate({
      pathname: '/(protected)/roadmap/add-milestone',
      params: {
        roadmapId: roadmap.RoadmapId,
      },
    });
  };

  const handleOnTaskPress = (task: TaskType) => {
    dispatch(setSelectedTaskAction(task));
    router.navigate({
      pathname: '/task/add-task',
      params: { mode: 'edit' },
    });
  };
  return (
    <AppView flex>
      <RoadmapOverview roadmap={roadmap} />
      <Divider marginT-16 />
      <TranslatedText body1 marginB-16 translationKey="common.milestones" />
      <Divider marginT-4 />
      <MilestonesList
        milestones={roadmap.Milestones}
        onAddNewMilestonePress={handleOnAddNewMilestone}
        onMilestonePress={handleMilestonePress}
        onTaskPress={handleOnTaskPress}
      />
    </AppView>
  );
};
