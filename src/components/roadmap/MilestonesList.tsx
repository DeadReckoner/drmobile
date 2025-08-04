import { AppList } from '@/components/AppList';
import { LineDivider } from '@/components/LineDivider';
import { EmptyMilestoneListPlaceholder } from '@/components/roadmap/EmptyMilestoneListPlaceholder';
import { MilestoneListItem } from '@/components/roadmap/MilestoneListItem';
import { TranslatedText } from '@/components/TranslatedText';
import { MilestoneType } from '@/hooks/create/types/roadmap.types';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setSelectedMilestoneAction } from '@/store/slices/roadmapDraftSlice';
import { LegendListRenderItemProps } from '@legendapp/list';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

interface MilestonesListProps {
  milestones: MilestoneType[];
}

export const MilestonesList = ({ milestones = [] }: MilestonesListProps) => {
  const dispatch = useAppDispatch();
  const onMilestonePress = (milestone: MilestoneType | null) => {
    dispatch(setSelectedMilestoneAction(milestone));
  };

  const onEmptyMilestoneButtonPress = () => {
    router.push('/roadmap/add-milestone');
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
    <EmptyMilestoneListPlaceholder onPress={onEmptyMilestoneButtonPress} />
  );

  return (
    <>
      <TranslatedText body1 marginB-32 translationKey="common.milestones" />
      <AppList
        data={milestones}
        keyExtractor={(item) => item.MilestoneId}
        renderItem={renderMilestone}
        ItemSeparatorComponent={() => <LineDivider marginV-0 />}
        ListEmptyComponent={renderEmptyMilestoneComponent}
        contentContainerStyle={styles.listContentContainer}
      />
    </>
  );
};

const styles = StyleSheet.create({
  listContentContainer: { borderRadius: 10, overflow: 'hidden' },
});
