import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppText, AppView } from '@/components/ui';
import type { MilestoneType } from '@/hooks/roadmap/types/roadmap.types';
import { Animations } from '@/utils/animation.utils';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { MilestoneMetadata } from './MilestoneMetadata';

interface StrategicMilestoneListItemProps {
  milestone: MilestoneType;
  isExpanded?: boolean;
  onPress?: () => void;
  isCollapsable?: boolean;
}

export const StrategicMilestoneListItem = ({
  milestone,
  isExpanded = false,
  isCollapsable = true,
  onPress,
}: StrategicMilestoneListItemProps) => {
  const isItemExpanded = isCollapsable ? true : isExpanded;
  const chevronDeg = useSharedValue('0deg');
  useEffect(() => {
    chevronDeg.value = withTiming(isItemExpanded ? '180deg' : '0deg', {
      duration: 250,
    });
  }, [isItemExpanded, chevronDeg]);
  const chevronStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          rotate: chevronDeg.value,
        },
      ],
    }),
    [isItemExpanded],
  );
  return (
    <AppView
      reanimated
      layout={Animations.Layout.Springify().damping(30).stiffness(200)}
      key={milestone.milestone_id}
      bg-cardBG
      br30
      style={styles.container}>
      <AppButton disabled={isCollapsable} onPress={onPress} activeOpacity={0.7}>
        <AppView padding-16>
          <AppView row center gap-16 style={styles.header}>
            <AppText textColor body2 style={styles.text}>
              {milestone.sub_goal}
            </AppText>
            {!isCollapsable && (
              <AppView reanimated style={[styles.iconWrapper, chevronStyle]}>
                <AppIcon set="Feather" name={'chevron-down'} />
              </AppView>
            )}
          </AppView>
        </AppView>
      </AppButton>
      {isItemExpanded && (
        <AppView bg-lightCardBG>
          <MilestoneMetadata milestone={milestone} />
        </AppView>
      )}
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
