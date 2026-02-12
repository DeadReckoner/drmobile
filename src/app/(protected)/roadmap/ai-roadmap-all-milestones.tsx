import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { MilestonesList } from '@/components/roadmap/MilestonesList';
import { MilestoneType, TaskType } from '@/hooks/roadmap/types/roadmap.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectDraftRoadmap,
  setSelectedMilestoneAction,
  setSelectedTaskAction,
} from '@/store/slices/roadmapDraftSlice';
import { getAllMilestones } from '@/utils/roadmap.utils';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView } from 'react-native';

const AIRoadmapMilestoneDetails = () => {
  const roadmap = useAppSelector(selectDraftRoadmap);
  const dispatch = useAppDispatch();

  const handleOnTaskPress = useCallback(
    (task: TaskType, index: number) => {
      dispatch(setSelectedTaskAction({ task, index }));
      router.navigate({
        pathname: '/task/add-edit-task',
        params: { mode: 'edit' },
      });
    },
    [dispatch],
  );

  const handleMilestonePress = useCallback(
    (milestone: MilestoneType | null, index: number) => {
      dispatch(setSelectedMilestoneAction({ milestone, index }));
    },
    [dispatch],
  );

  const handleOnAddNewMilestone = useCallback(() => {
    router.navigate('/(protected)/roadmap/add-edit-milestone');
  }, []);

  return (
    <AppScreen>
      <ScrollView
        contentInsetAdjustmentBehavior="always"
        showsVerticalScrollIndicator={false}>
        <HeaderWithBack headerKey="common.milestones" />
        <Divider marginV-8 />
        <MilestonesList
          milestones={getAllMilestones(roadmap)}
          onMilestonePress={handleMilestonePress}
          onTaskPress={handleOnTaskPress}
          onAddNewMilestonePress={handleOnAddNewMilestone}
        />
      </ScrollView>
    </AppScreen>
  );
};

export default AIRoadmapMilestoneDetails;
