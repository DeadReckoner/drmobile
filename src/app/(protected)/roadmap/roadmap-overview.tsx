import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { MilestonesList } from '@/components/roadmap/MilestonesList';
import { RoadmapOverview } from '@/components/roadmap/RoadmapOverview';
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

const RoadmapOverviewPage = () => {
  const roadmap = useAppSelector(selectDraftRoadmap);
  const dispatch = useAppDispatch();

  const handleMilestonePress = useCallback(
    (milestone: MilestoneType | null, index: number) => {
      dispatch(setSelectedMilestoneAction({ milestone, index }));
    },
    [dispatch],
  );

  const handleTaskPress = useCallback(
    (task: TaskType, index: number) => {
      dispatch(setSelectedTaskAction({ task, index }));
      router.navigate({
        pathname: '/task/add-edit-task',
        params: { mode: 'edit' },
      });
    },
    [dispatch],
  );

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="always">
        <HeaderWithBack headerKey="common.roadmap_overview" />
        <Divider marginV-8 />
        <RoadmapOverview roadmap={roadmap} toggleEditMode={() => {}} readonly />
        <MilestonesList
          milestones={getAllMilestones(roadmap)}
          onMilestonePress={handleMilestonePress}
          onTaskPress={handleTaskPress}
          onAddNewMilestonePress={() => {}}
        />
      </ScrollView>
    </AppScreen>
  );
};

export default RoadmapOverviewPage;
