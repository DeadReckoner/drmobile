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
import { router } from 'expo-router';
import React from 'react';

const AIRoadmapMilestoneDetails = () => {
  const roadmap = useAppSelector(selectDraftRoadmap);
  const dispatch = useAppDispatch();
  const handleOnTaskPress = (task: TaskType, index: number) => {
    dispatch(setSelectedTaskAction({ task, index }));
    router.navigate({
      pathname: '/task/add-edit-task',
      params: { mode: 'edit' },
    });
  };
  const handleMilestonePress = (
    milestone: MilestoneType | null,
    index: number,
  ) => {
    dispatch(setSelectedMilestoneAction({ milestone, index }));
  };

  const handleOnAddNewMilestone = () => {
    router.navigate('/(protected)/roadmap/add-edit-milestone');
  };

  return (
    <AppScreen safeArea>
      <HeaderWithBack headerKey="common.milestones" />
      <Divider marginV-8 />
      <MilestonesList
        milestones={roadmap?.milestones}
        onMilestonePress={handleMilestonePress}
        onTaskPress={handleOnTaskPress}
        onAddNewMilestonePress={handleOnAddNewMilestone}
      />
    </AppScreen>
  );
};

export default AIRoadmapMilestoneDetails;
