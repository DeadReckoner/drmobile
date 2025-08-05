import AppButton from '@/components/AppButton';
import { AppList } from '@/components/AppList';
import { LineDivider } from '@/components/LineDivider';
import { ListAddItemIcon } from '@/components/ListAddItemIcon';
import { EmptyMilestoneListPlaceholder } from '@/components/roadmap/EmptyMilestoneListPlaceholder';
import { MilestoneListItem } from '@/components/roadmap/MilestoneListItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import type { MilestoneType } from '@/hooks/roadmap/types/roadmap.types';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setSelectedMilestoneAction } from '@/store/slices/roadmapDraftSlice';
import { LegendListRenderItemProps } from '@legendapp/list';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface MilestonesListProps {
  milestones: MilestoneType[];
  handleOnAddNewMilestone: () => void;
}

export const MilestonesList = ({
  milestones = [],
  handleOnAddNewMilestone,
}: MilestonesListProps) => {
  const dispatch = useAppDispatch();
  const onMilestonePress = (milestone: MilestoneType | null) => {
    dispatch(setSelectedMilestoneAction(milestone));
  };

  const renderMilestone = ({
    item,
  }: LegendListRenderItemProps<MilestoneType>) => {
    return (
      <MilestoneListItem
        key={item.MilestoneId}
        milestone={item}
        onMilestonePress={onMilestonePress}
      />
    );
  };

  const renderEmptyMilestoneComponent = () => (
    <EmptyMilestoneListPlaceholder onPress={handleOnAddNewMilestone} />
  );

  const renderItemSeparator = () => <LineDivider marginV-0 />;

  const renderFooterComponent = () => {
    return (
      <AppButton onPress={handleOnAddNewMilestone}>
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
