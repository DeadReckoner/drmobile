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
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
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
}

export const MilestoneListItem = ({
  milestone,
  onMilestonePress,
  onTaskPress,
}: MilestoneListItemProps) => {
  const theme = useAppTheme();
  const selectedMilestone = useAppSelector(selectSelectedMilestone);
  const sharedHeight = useSharedValue(0);
  const chevronDeg = useSharedValue('0deg');
  const menuRef = useRef<MenuComponentRef>(null);

  const isExpanded = useMemo(
    () => milestone.milestone_id === selectedMilestone?.milestone_id,
    [milestone.milestone_id, selectedMilestone?.milestone_id],
  );

  const onPress = () => {
    onMilestonePress(
      milestone.milestone_id === selectedMilestone?.milestone_id
        ? null
        : milestone,
    );
  };

  useEffect(() => {
    chevronDeg.value = withTiming(isExpanded ? '180deg' : '0deg', {
      duration: 250,
    });
  }, [isExpanded, chevronDeg]);

  const bodyStyle = useAnimatedStyle(
    () => ({
      height: withTiming(isExpanded ? sharedHeight.value : 0, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
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
    [selectedMilestone],
  );

  const handleOnAddNewTask = () => {
    router.navigate('/(protected)/task/add-edit-task');
  };

  const renderTaskItem = ({
    item,
    index,
  }: LegendListRenderItemProps<TaskType>) => (
    <MilestoneTaskItem task={item} onPress={() => onTaskPress(item, index)} />
  );

  const renderItemSeparator = () => <LineDivider marginV-0 />;

  const renderFooterComponent = () => {
    return (
      <AppButton onPress={handleOnAddNewTask}>
        <LineDivider marginV-0 />
        <AppView row padding-16 paddingL-32 centerV gap-16>
          <ListAddItemIcon />
          <TranslatedText body2 translationKey="tabs.create_tab.add_new_task" />
        </AppView>
      </AppButton>
    );
  };

  const onMenuAction = ({ nativeEvent }: NativeActionEvent) => {
    if (nativeEvent.event === 'open') {
      onMilestonePress(milestone);
      router.navigate({
        pathname: '/roadmap/add-edit-milestone',
        params: { mode: 'edit' },
      });
    }
  };

  return (
    <AppView key={milestone.milestone_id}>
      <AppButton onPress={onPress}>
        <MenuView
          ref={menuRef}
          themeVariant={theme.theme}
          onPressAction={onMenuAction}
          actions={MENU_ACTIONS}
          shouldOpenOnLongPress={true}>
          <AppView row padding-16 gap-16 center>
            <AppCheckbox value={milestone.reached} />
            <AppText flex textColor body2>
              {milestone.sub_goal}
            </AppText>
            <AppButton onPress={onPress} style={{ pointerEvents: 'box-only' }}>
              <AppView reanimated style={chevronStyle}>
                <AppIcon set="Feather" name={'chevron-down'} />
              </AppView>
            </AppButton>
          </AppView>
        </MenuView>
      </AppButton>

      <AppView style={{ overflow: 'hidden' }}>
        <Animated.View style={bodyStyle}>
          <AppView
            style={[styles.content, { backgroundColor: Colors.lightCardBG }]}>
            <AppList
              keyExtractor={(task) => task.task_id}
              scrollEnabled={false}
              data={milestone.tasks || []}
              ListFooterComponent={renderFooterComponent}
              ItemSeparatorComponent={renderItemSeparator}
              renderItem={renderTaskItem}
            />
          </AppView>
        </Animated.View>
        <AppView
          onLayout={({ nativeEvent }) => {
            sharedHeight.value = nativeEvent.layout.height;
          }}
          style={[
            styles.hiddenMeasurer,
            { backgroundColor: Colors.lightCardBG },
          ]}>
          <AppList
            keyExtractor={(task) => task.task_id}
            scrollEnabled={false}
            data={milestone.tasks || []}
            ListFooterComponent={renderFooterComponent}
            ItemSeparatorComponent={renderItemSeparator}
            renderItem={renderTaskItem}
          />
        </AppView>
      </AppView>
    </AppView>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
    position: 'relative',
  },
  hiddenMeasurer: {
    position: 'absolute',
    opacity: 0,
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
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
