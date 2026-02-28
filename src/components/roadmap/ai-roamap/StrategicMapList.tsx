import { AppList } from '@/components/AppList';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import type { MilestoneType, Phase } from '@/hooks/roadmap/types/roadmap.types';
import React, { useState } from 'react';
import { StrategicMilestoneListItem } from './StrategicMilestoneListItem';

interface StrategicMapListProps {
  phases: Phase[];
}

export const StrategicMapList = ({ phases }: StrategicMapListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  };

  const renderMilestone = ({
    item,
  }: {
    item: MilestoneType;
    index: number;
  }) => {
    const isExpanded = expandedId === item.milestone_id;
    return (
      <StrategicMilestoneListItem
        key={item.milestone_id}
        milestone={item}
        isExpanded={isExpanded}
        onPress={() => handleToggle(item.milestone_id)}
        isCollapsable={false}
      />
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
      data={phases.flatMap((phase) => phase.milestones || [])}
      keyExtractor={(item) => item.milestone_id || item.sub_goal}
      extraData={expandedId}
      renderItem={renderMilestone}
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
