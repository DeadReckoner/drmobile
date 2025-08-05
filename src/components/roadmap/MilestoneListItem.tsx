import AppButton from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { ListAddItemIcon } from '@/components/ListAddItemIcon';
import { TranslatedText } from '@/components/TranslatedText';
import { AppCheckbox, AppText, AppView } from '@/components/ui';
import type {
  MilestoneType,
  TaskType,
} from '@/hooks/roadmap/types/roadmap.types';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectSelectedMilestone } from '@/store/slices/roadmapDraftSlice';
import { LegendListRenderItemProps } from '@legendapp/list';
import { router } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
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

  const isExpanded = useMemo(
    () => Number(milestone.MilestoneId === selectedMilestone?.MilestoneId),
    [milestone.MilestoneId, selectedMilestone?.MilestoneId],
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

  const handleOnAddNewTask = () => {
    router.navigate('/(protected)/task/add-task');
  };

  const renderItem = ({ item }: LegendListRenderItemProps<TaskType>) => (
    <AppView>
      <AppText>{item.Title}</AppText>
    </AppView>
  );

  const renderFooterComponent = () => {
    return (
      <AppButton onPress={handleOnAddNewTask}>
        <AppView row padding-16 centerV gap-16>
          <ListAddItemIcon />
          <TranslatedText
            body2
            translationKey="tabs.create_tab.add_new_task_btn"
          />
        </AppView>
      </AppButton>
    );
  };

  return (
    <AppView bg-cardBG key={milestone.MilestoneId}>
      <AppButton onPress={onPress}>
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

      <Animated.View
        entering={FadeInUp.duration(300)}
        exiting={FadeOutUp.duration(300)}
        style={[bodyStyle, { backgroundColor: Colors.lightCardBG }]}>
        <Animated.View
          onLayout={({ nativeEvent }) => {
            sharedHeight.value = nativeEvent.layout.height;
          }}
          style={styles.content}>
          <AppList
            scrollEnabled={false}
            data={milestone.Tasks}
            ListFooterComponent={renderFooterComponent}
            renderItem={renderItem}
          />
        </Animated.View>
      </Animated.View>
    </AppView>
  );
};

export const MilestoneListItem = React.memo(MilestoneListI);

const styles = StyleSheet.create({
  content: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 16,
  },
});
