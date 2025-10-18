import { AppList } from '@/components/AppList';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { MacroMap } from '@/hooks/roadmap/types/roadmap.types';
import React from 'react';
import { MacroMapListItem } from './MacroMapListItem';

interface MacroMapListProps {
  macroMap: MacroMap;
}

export const MacroMapList = ({ macroMap }: MacroMapListProps) => {
  const renderMacroMilestone = ({
    item,
  }: {
    item: MacroMap['phases'][0]['macro_milestones'][0];
    index: number;
  }) => {
    return (
      <MacroMapListItem key={item.macro_milestone_id} macroMilestone={item} />
    );
  };

  const renderEmptyMilestoneComponent = () => (
    <EmptyListItemPlaceholder
      title="tabs.create_tab.no_milestones_yet"
      subtitle="tabs.create_tab.add_new_milestone_desc"
      btnText="tabs.create_tab.add_new_milestone"
      onPress={() => {}}
    />
  );

  const renderItemSeparator = () => <Divider marginV-4 />;

  return (
    <AppList
      data={macroMap.phases.flatMap((phase) => phase.macro_milestones)}
      keyExtractor={(item) => item.macro_milestone_id}
      renderItem={renderMacroMilestone}
      ItemSeparatorComponent={renderItemSeparator}
      ListEmptyComponent={renderEmptyMilestoneComponent}
      contentContainerStyle={{ paddingBottom: 16 }}
      contentInsetAdjustmentBehavior="always"
      ListHeaderComponent={() => (
        <HeaderWithBack headerKey="common.roadmap_overview" marginB-16 />
      )}
    />
  );
};
