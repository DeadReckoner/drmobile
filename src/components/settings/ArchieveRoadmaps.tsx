import { AppList } from '@/components/AppList';
import { Divider } from '@/components/Divider';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { ArchivedRoadmapItem } from '@/components/settings/ArchivedRoadmapItem';
import { AppView } from '@/components/ui';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { LegendListRenderItemProps } from '@legendapp/list';
import React from 'react';

interface ArchieveRoadmapsProps {
  archivedRoadmaps?: RoadmapType[];
  showProgress?: boolean;
}

export const ArchieveRoadmaps = ({
  showProgress,
  archivedRoadmaps,
}: ArchieveRoadmapsProps) => {
  const renderItem = ({ item }: LegendListRenderItemProps<RoadmapType>) => (
    <ArchivedRoadmapItem roadmap={item} showProgress={showProgress} />
  );

  const renderEmptyItem = () => (
    <AppView marginT-8>
      <EmptyListItemPlaceholder
        title="habits.no_archived_roadmaps"
        subtitle="habits.no_archived_roadmaps_description"
      />
    </AppView>
  );

  return (
    <AppList<RoadmapType>
      data={archivedRoadmaps || []}
      keyExtractor={(s) => s.roadmap_id}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyItem}
      ItemSeparatorComponent={() => <Divider marginV-8 />}
      scrollEnabled={false}
      showsHorizontalScrollIndicator={false}
    />
  );
};
