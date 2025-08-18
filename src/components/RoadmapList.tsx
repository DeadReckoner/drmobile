import { AppList } from '@/components/AppList';
import { Divider } from '@/components/Divider';
import { RoadmapListItem } from '@/components/roadmap/RoadmapListItem';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { LegendListProps, LegendListRenderItemProps } from '@legendapp/list';

interface RoadmapListProps extends LegendListProps<RoadmapType> {
  data: RoadmapType[];
  onItemPress: (_roadmap: RoadmapType) => void;
}

export const RoadmapList = ({ data = [], onItemPress }: RoadmapListProps) => {
  const renderItem = ({ item }: LegendListRenderItemProps<RoadmapType>) => {
    return <RoadmapListItem roadmap={item} onPress={() => onItemPress(item)} />;
  };
  return (
    <AppList
      data={data}
      keyExtractor={(s) => s.roadmap_id}
      renderItem={renderItem}
      //   ListEmptyComponent={renderEmptyItem}
      //   ListFooterComponent={renderFooterComponent}
      ItemSeparatorComponent={() => <Divider marginV-8 />}
      scrollEnabled={false}
      showsHorizontalScrollIndicator={false}
    />
  );
};
