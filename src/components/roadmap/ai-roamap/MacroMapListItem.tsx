import { AppText, AppView } from '@/components/ui';
import type { MacroMilestone } from '@/hooks/roadmap/types/roadmap.types';
import React from 'react';
import { StyleSheet } from 'react-native';
import { MacroMilestoneMetadata } from './MacroMilestoneMetadata';

interface MacroMapListItemProps {
  macroMilestone: MacroMilestone;
  isExpanded?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
}

export const MacroMapListItem = ({
  macroMilestone,
  icon,
}: MacroMapListItemProps) => {
  return (
    <AppView
      key={macroMilestone.macro_milestone_id}
      bg-cardBG
      br30
      style={styles.container}>
      <AppView padding-16>
        <AppView row center gap-16 style={styles.header}>
          <AppText textColor body2 style={styles.text}>
            {macroMilestone.name}
          </AppText>
          {icon && <AppView style={styles.iconWrapper}>{icon}</AppView>}
        </AppView>
      </AppView>
      <AppView bg-lightCardBG>
        <MacroMilestoneMetadata macroMilestone={macroMilestone} />
      </AppView>
    </AppView>
  );
};

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  header: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    flex: 1,
    flexShrink: 1,
  },
  iconWrapper: {
    marginLeft: 8,
    flexShrink: 0,
  },
});
