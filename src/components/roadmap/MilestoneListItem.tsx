import AppButton from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { AppCheckbox, AppText, AppView } from '@/components/ui';
import { MilestoneType, TaskType } from '@/hooks/create/types/roadmap.types';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectSelectedMilestone } from '@/store/slices/roadmapDraftSlice';
import { LegendListRenderItemProps } from '@legendapp/list';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

interface MilestoneListItemProps {
  milestone: MilestoneType;
  onMilestonePress: (_milestone: MilestoneType | null) => void;
}

const MilestoneListI = ({
  milestone,
  onMilestonePress,
}: MilestoneListItemProps) => {
  const selectedMilestone = useAppSelector(selectSelectedMilestone);
  const sharedHeight = useSharedValue(0);
  const chevronDeg = useSharedValue('0deg');

  const isExpanded = Number(
    milestone.MilestoneId === selectedMilestone?.MilestoneId,
  );
  const onPress = () => {
    onMilestonePress(
      milestone.MilestoneId === selectedMilestone?.MilestoneId
        ? null
        : milestone,
    );
  };

  useEffect(() => {
    chevronDeg.value = withTiming(isExpanded ? '180deg' : '0deg', {
      duration: 250,
    });
  }, [selectedMilestone, chevronDeg, isExpanded]);

  const value = useDerivedValue(() => {
    return withTiming(sharedHeight.value * isExpanded, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  }, [selectedMilestone]);

  const bodyStyle = useAnimatedStyle(
    () => ({
      height: value.value,
      overflow: 'hidden',
    }),
    [selectedMilestone],
  );
  const chevronStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          rotate: chevronDeg.value,
        },
      ],
    }),
    [selectedMilestone],
  );

  const renderItem = ({ item }: LegendListRenderItemProps<TaskType>) => (
    <AppView>
      <AppText>{item.Title}</AppText>
    </AppView>
  );

  return (
    <AppView bg-cardBG key={milestone.MilestoneId}>
      <Animated.View>
        <AppButton onPress={onPress} style={styles.header}>
          <AppView row padding-16 gap-16 center>
            <AppCheckbox
              bg-primary
              borderRadius={4}
              containerStyle={{ borderWidth: 0 }}
              value={milestone.Reached}
            />
            <AppText flex textColor body2>
              {milestone.SubGoal}
            </AppText>
            <AppView reanimated style={chevronStyle}>
              <AppIcon set="Feather" name={'chevron-down'} />
            </AppView>
          </AppView>
        </AppButton>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(300)}
        exiting={FadeOutUp.duration(300)}
        style={[bodyStyle, { backgroundColor: Colors.lightCardBG }]}>
        <Animated.View
          onLayout={({ nativeEvent }) => {
            sharedHeight.value = nativeEvent.layout.height;
          }}
          style={styles.content}>
          <AppList data={milestone.Tasks} renderItem={renderItem} />
        </Animated.View>
      </Animated.View>
    </AppView>
  );
};

export const MilestoneListItem = React.memo(MilestoneListI);

const styles = StyleSheet.create({
  header: {},

  content: {
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: -1,
  },
});
