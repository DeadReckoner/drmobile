import { AppButton } from '@/components/AppButton';
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
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface MilestonesListProps {
  milestones: MilestoneType[];
  onAddNewMilestonePress: () => void;
  onMilestonePress: (_milestone: MilestoneType | null) => void;
  onTaskPress: (_task: TaskType) => void;
}

export const MilestonesList = ({
  milestones = [],
  onAddNewMilestonePress,
  onMilestonePress,
  onTaskPress,
}: MilestonesListProps) => {
  const renderMilestone = ({
    item,
  }: LegendListRenderItemProps<MilestoneType>) => {
    return (
      <MilestoneListItem
        key={item.MilestoneId}
        milestone={item}
        onMilestonePress={onMilestonePress}
        onTaskPress={onTaskPress}
      />
    );
  };

  const renderEmptyMilestoneComponent = () => (
    <EmptyListItemPlaceholder
      title="tabs.create_tab.no_milestones_yet"
      subtitle="tabs.create_tab.milestone_desc_placeholder"
      btnText="tabs.create_tab.add_new_milestone"
      onPress={onAddNewMilestonePress}
    />
  );

  const renderItemSeparator = () => <LineDivider marginV-0 />;

  const renderFooterComponent = () => {
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
    <AppList
      scrollEnabled={false}
      data={milestones}
      keyExtractor={(item) => item.MilestoneId}
      renderItem={renderMilestone}
      ItemSeparatorComponent={renderItemSeparator}
      ListFooterComponent={milestones.length > 0 ? renderFooterComponent : null}
      ListEmptyComponent={renderEmptyMilestoneComponent}
      contentContainerStyle={[
        styles.listContentContainer,
        { backgroundColor: Colors.cardBG },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  listContentContainer: { borderRadius: 10, overflow: 'hidden' },
});
