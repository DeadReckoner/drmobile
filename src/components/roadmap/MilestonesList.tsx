import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppList } from '@/components/AppList';
import { LineDivider } from '@/components/LineDivider';
import { ListAddItemIcon } from '@/components/ListAddItemIcon';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { MilestoneListItem } from '@/components/roadmap/MilestoneListItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import type {
  MilestoneType,
  TaskType,
} from '@/hooks/roadmap/types/roadmap.types';
import { LegendListRenderItemProps } from '@legendapp/list';

interface MilestonesListProps {
  milestones: MilestoneType[];
  onAddNewMilestonePress: () => void;
  onMilestonePress: (_milestone: MilestoneType | null, _index: number) => void;
  onTaskPress: (_task: TaskType, _index: number) => void;
}

export const MilestonesList = ({
  milestones = [],
  onAddNewMilestonePress,
  onMilestonePress,
  onTaskPress,
}: MilestonesListProps) => {
  const renderMilestone = ({
    item,
    index,
  }: LegendListRenderItemProps<MilestoneType>) => {
    return (
      <MilestoneListItem
        key={item.milestone_id}
        milestone={item}
        onMilestonePress={(item) => onMilestonePress(item, index)}
        onTaskPress={onTaskPress}
      />
    );
  };

  const renderEmptyMilestoneComponent = () => (
    <EmptyListItemPlaceholder
      title="tabs.create_tab.no_milestones_yet"
      subtitle="tabs.create_tab.add_new_milestone_desc"
      btnText="tabs.create_tab.add_new_milestone"
      onPress={onAddNewMilestonePress}
    />
  );

  const renderItemSeparator = () => <LineDivider marginV-0 />;

  const renderFooterComponent = () => {
    if (milestones.length === 0) return;
    return (
      <AppButton onPress={onAddNewMilestonePress}>
        <LineDivider marginV-0 />
        <AppView bg- row padding-16 centerV gap-16>
          <ListAddItemIcon />
          <TranslatedText
            body2
            translationKey="tabs.create_tab.add_new_milestone"
          />
        </AppView>
      </AppButton>
    );
  };

  return (
    <AppCard padding-0>
      <AppList
        scrollEnabled={false}
        data={milestones}
        keyExtractor={(item) => item.milestone_id}
        renderItem={renderMilestone}
        ItemSeparatorComponent={renderItemSeparator}
        ListFooterComponent={renderFooterComponent}
        ListEmptyComponent={renderEmptyMilestoneComponent}
      />
    </AppCard>
  );
};
