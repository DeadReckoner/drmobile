import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { TasksList } from '@/components/roadmap/TasksList';
import { useAppSelector } from '@/store/hooks/store.hooks';
import React from 'react';

const AIActiveMilestoneDetails = () => {
  const milestone = useAppSelector(
    (state) => state.roadmapDraft.selectedMilestone,
  );

  return (
    <AppScreen safeArea>
      <HeaderWithBack headerText={'Tasks'} />
      <Divider />
      <TasksList tasks={milestone?.tasks || []} />
    </AppScreen>
  );
};

export default AIActiveMilestoneDetails;
