import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { LineDivider } from '@/components/LineDivider';
import { ListAddItemIcon } from '@/components/ListAddItemIcon';
import { MilestoneTaskItem } from '@/components/roadmap/MilestoneTaskItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppCheckbox, AppText, AppView } from '@/components/ui';
import type {
  MilestoneType,
  TaskType,
} from '@/hooks/roadmap/types/roadmap.types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectSelectedMilestone } from '@/store/slices/roadmapDraftSlice';
import { LegendListRenderItemProps } from '@legendapp/list';
import {
  MenuComponentRef,
  MenuView,
  NativeActionEvent,
} from '@react-native-menu/menu';
import { router, usePathname } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

interface MilestoneListItemProps {
  milestone: MilestoneType;
  onMilestonePress: (_milestone: MilestoneType | null) => void;
  onTaskPress: (_task: TaskType, _index: number) => void;
  readonly?: boolean;
}

const MilestoneListItemComponent = ({
  milestone,
  onMilestonePress,
  onTaskPress,
  readonly = false,
}: MilestoneListItemProps) => {
  const theme = useAppTheme();
  const selectedMilestone = useAppSelector(selectSelectedMilestone);
  const heightValue = useSharedValue(0);
  const chevronDeg = useSharedValue('0deg');
  const menuRef = useRef<MenuComponentRef>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const path = usePathname();

  const isExpanded = useMemo(
    () => milestone.milestone_id === selectedMilestone?.milestone_id,
    [milestone.milestone_id, selectedMilestone?.milestone_id],
  );

  const isRoadmapDetailsPage = path.includes('/roadmap/roadmap-details');

  const onPress = useCallback(() => {
    onMilestonePress(
      milestone.milestone_id === selectedMilestone?.milestone_id
        ? null
        : milestone,
    );
  }, [milestone, selectedMilestone?.milestone_id, onMilestonePress]);

  useEffect(() => {
    heightValue.value = withTiming(isExpanded ? contentHeight : 0, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    chevronDeg.value = withTiming(isExpanded ? '180deg' : '0deg', {
      duration: 250,
    });
  }, [isExpanded, contentHeight, heightValue, chevronDeg]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      height: heightValue.value,
      opacity: withTiming(isExpanded ? 1 : 0, {
        duration: 200,
      }),
    }),
    [isExpanded],
  );

  const chevronStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          rotate: chevronDeg.value,
        },
      ],
    }),
    [],
  );

  const handleOnAddNewTask = useCallback(() => {
    router.navigate('/(protected)/task/add-edit-task');
  }, []);

  const renderTaskItem = useCallback(
    ({ item, index }: LegendListRenderItemProps<TaskType>) => (
      <MilestoneTaskItem
        task={item}
        onPress={() => onTaskPress(item, index)}
        readonly={readonly}
      />
    ),
    [onTaskPress, readonly],
  );

  const renderItemSeparator = useCallback(() => <LineDivider marginV-0 />, []);

  const renderFooterComponent = useCallback(() => {
    if (readonly) return null;
    return (
      <AppButton onPress={handleOnAddNewTask}>
        <LineDivider marginV-0 />
        <AppView row padding-16 paddingL-32 centerV gap-16>
          <ListAddItemIcon />
          <TranslatedText body2 translationKey="tabs.create_tab.add_new_task" />
        </AppView>
      </AppButton>
    );
  }, [readonly, handleOnAddNewTask]);

  const onMenuAction = useCallback(
    ({ nativeEvent }: NativeActionEvent) => {
      if (nativeEvent.event === 'open') {
        onMilestonePress(milestone);
        router.navigate({
          pathname: '/roadmap/add-edit-milestone',
          params: { mode: 'edit' },
        });
      }
    },
    [milestone, onMilestonePress],
  );

  const isMilestoneReached = useMemo(() => {
    return (
      (milestone.tasks?.length || 0) > 0 && milestone.status === 'completed'
    );
  }, [milestone.status, milestone.tasks]);

  const milestoneTasks = useMemo(
    () => milestone.tasks || [],
    [milestone.tasks],
  );

  return (
    <AppView key={milestone.milestone_id}>
      <AppButton
        onPress={
          !readonly || (milestone.tasks?.length || 0) > 0 ? onPress : undefined
        }>
        {readonly ? (
          <AppView row padding-16 gap-16 center>
            <AppCheckbox value={isMilestoneReached} />
            <AppText flex textColor body2>
              {milestone.sub_goal}
            </AppText>
            <AppButton style={{ pointerEvents: 'box-only' }}>
              <AppView reanimated style={chevronStyle}>
                <AppIcon set="Feather" name={'chevron-down'} />
              </AppView>
            </AppButton>
          </AppView>
        ) : (
          <MenuView
            ref={menuRef}
            themeVariant={theme.theme}
            onPressAction={onMenuAction}
            actions={MENU_ACTIONS}
            shouldOpenOnLongPress={true}>
            <AppView row padding-16 gap-16 center>
              <AppCheckbox value={isMilestoneReached} />
              <AppText flex textColor body2>
                {milestone.sub_goal}
              </AppText>
              <AppButton style={{ pointerEvents: 'box-only' }}>
                {milestoneTasks.length > 0 || isRoadmapDetailsPage ? (
                  <AppView reanimated style={chevronStyle}>
                    <AppIcon set="Feather" name={'chevron-down'} />
                  </AppView>
                ) : (
                  <AppView bg-accent paddingH-8 br100>
                    <TranslatedText
                      sm
                      white
                      regular
                      translationKey="common.upcoming"
                    />
                  </AppView>
                )}
              </AppButton>
            </AppView>
          </MenuView>
        )}
      </AppButton>

      <Animated.View style={[styles.contentContainer, animatedStyle]}>
        <AppView
          onLayout={(e) => {
            const height = e.nativeEvent.layout.height;
            if (height > 0 && height !== contentHeight) {
              setContentHeight(height);
            }
          }}
          style={styles.content}>
          <AppView style={{ backgroundColor: Colors.lightCardBG }}>
            <AppList
              keyExtractor={(task) => task.task_id}
              scrollEnabled={false}
              data={milestoneTasks}
              ListFooterComponent={renderFooterComponent}
              ItemSeparatorComponent={renderItemSeparator}
              renderItem={renderTaskItem}
            />
          </AppView>
        </AppView>
      </Animated.View>
    </AppView>
  );
};

export const MilestoneListItem = React.memo(MilestoneListItemComponent);

const styles = StyleSheet.create({
  contentContainer: {
    overflow: 'hidden',
  },
  content: {
    position: 'absolute',
    width: '100%',
    top: 0,
    left: 0,
  },
});

const MENU_ACTIONS = [
  {
    id: 'open',
    title: 'Open Milestone',
  },
  {
    id: 'cancel',
    title: 'Cancel',
    attributes: {
      destructive: true,
    },
  },
];
