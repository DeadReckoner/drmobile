import { AppList } from '@/components/AppList';
import { Divider } from '@/components/Divider';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { RoadmapListItem } from '@/components/roadmap/RoadmapListItem';
import { AppView } from '@/components/ui';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { LegendListProps, LegendListRenderItemProps } from '@legendapp/list';
import { router } from 'expo-router';

interface RoadmapListProps extends LegendListProps<RoadmapType> {
  data: RoadmapType[];
  onItemPress: (_roadmap: RoadmapType, _index: number) => void;
  showProgress?: boolean;
}

export const RoadmapList = ({
  data = [],
  onItemPress,
  showProgress = true,
}: RoadmapListProps) => {
  const renderItem = ({
    item,
    index,
  }: LegendListRenderItemProps<RoadmapType>) => {
    return (
      <RoadmapListItem
        roadmap={item}
        onPress={() => onItemPress(item, index)}
        showProgress={showProgress}
      />
    );
  };

  const renderEmptyItem = () => (
    <AppView marginT-8>
      <EmptyListItemPlaceholder
        title="tabs.create_tab.no_roadmaps_yet"
        subtitle="tabs.create_tab.add_new_roadmap_desc"
        btnText="tabs.create_tab.add_new_roadmap"
        onPress={() => {
          router.navigate('/create');
        }}
      />
    </AppView>
  );
  return (
    <AppList
      data={data}
      keyExtractor={(s) => s.roadmap_id}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyItem}
      ItemSeparatorComponent={() => <Divider marginV-8 />}
      scrollEnabled={false}
      showsHorizontalScrollIndicator={false}
    />
  );
};
