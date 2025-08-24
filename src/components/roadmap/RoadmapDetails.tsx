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
  toggleEditMode: () => void;
}
export const RoadmapDetails = ({
  roadmap,
  toggleEditMode,
}: RoadmapDetailsProps) => {
  const dispatch = useAppDispatch();

  const handleMilestonePress = (milestone: MilestoneType | null) => {
    dispatch(setSelectedMilestoneAction(milestone));
  };
  const handleOnAddNewMilestone = () => {
    router.navigate('/(protected)/roadmap/add-edit-milestone');
  };

  const handleOnTaskPress = (task: TaskType) => {
    dispatch(setSelectedTaskAction(task));
    router.navigate({
      pathname: '/task/add-edit-task',
      params: { mode: 'edit' },
    });
  };
  return (
    <AppView flex>
      <RoadmapOverview roadmap={roadmap} toggleEditMode={toggleEditMode} />
      <Divider marginT-16 />
      <TranslatedText body1 marginB-16 translationKey="common.milestones" />
      <Divider marginT-4 />
      <MilestonesList
        milestones={roadmap.milestones}
        onAddNewMilestonePress={handleOnAddNewMilestone}
        onMilestonePress={handleMilestonePress}
        onTaskPress={handleOnTaskPress}
      />
    </AppView>
  );
};
