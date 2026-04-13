import { Divider } from '@/components/Divider';
import { RoadmapList } from '@/components/roadmap/RoadmapList';
import { AppText, AppView } from '@/components/ui';
import { useGetRoadmapsQuery } from '@/hooks/roadmap';
import React from 'react';

interface ArchieveRoadmapsProps {
  showProgress?: boolean;
}

const ArchieveRoadmap = ({ showProgress }: ArchieveRoadmapsProps) => {
  const { data } = useGetRoadmapsQuery(); // TODO: get archieve roadmaps only
  return (
    <AppView>
      <AppText textColor center marginV-16>
        TODO: This should list only archieved roadmaps. Currently listing all
        roadmaps as the API needs to be updated to support fetching archieved
        roadmaps only.
      </AppText>
      <Divider />

      <RoadmapList
        data={data || []}
        onItemPress={() => {}}
        showProgress={showProgress}
      />
    </AppView>
  );
};

export default ArchieveRoadmap;
