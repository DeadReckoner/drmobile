import { AppAvatar } from '@/components/AppAvatar';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { RecurrenceBadge } from '@/components/roadmap/ReccurenceBadge';
import { TranslatedText } from '@/components/TranslatedText';
import { AppImage, AppText, AppView } from '@/components/ui';
import {
  AnchoringRoadmap,
  AnchoringUser,
} from '@/hooks/friends/types/friends.types';
import { TaskType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { HabitType } from '@/store/apis/types/habitsApi.types';
import { storeHabit, storeTasks } from '@/utils/roadmapTransfer';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface RoadmapRowProps {
  roadmap: AnchoringRoadmap;
}

const RoadmapRow = ({ roadmap }: RoadmapRowProps) => {
  const { t } = useLocalization();
  const handlePress = useCallback(() => {
    storeTasks(roadmap.tasks);
    router.navigate({
      pathname: '/settings/anchoring-roadmap-tasks',
      params: { goal: roadmap.goal, roadmapId: roadmap.roadmap_id },
    });
  }, [roadmap]);

  return (
    <AppButton
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.roadmapRow}>
      <AppView flex row centerV gap-8>
        <AppView
          style={[
            styles.roadmapDot,
            {
              backgroundColor: Colors.textColor,
            },
          ]}
        />
        <AppView row paddingR-16>
          <AppText flex body2 textColor numberOfLines={2}>
            {roadmap.goal}
          </AppText>
          <AppIcon set="Ionicons" name="arrow-forward-outline" size={22} />
        </AppView>
      </AppView>
      {roadmap.tasks.length > 0 && (
        <AppView style={styles.taskList}>
          {roadmap.tasks.map((task: TaskType) => (
            <AppView
              key={task.task_id}
              row
              centerV
              gap-8
              style={styles.taskRow}>
              <AppView style={styles.taskBullet} />
              <AppText xsm secondary numberOfLines={1} flex>
                {task.title}
              </AppText>
            </AppView>
          ))}
        </AppView>
      )}
      {roadmap.tasks.length === 0 && (
        <AppView style={styles.taskList}>
          <AppText xsm secondary style={styles.noTasksText}>
            {t('roadmap.no_tasks_today')}
          </AppText>
        </AppView>
      )}
    </AppButton>
  );
};

interface HabitRowProps {
  habit: HabitType;
}

const HabitRow = ({ habit }: HabitRowProps) => {
  const handlePress = useCallback(() => {
    storeHabit(habit);
    router.navigate({ pathname: '/settings/readonly-habit-details' });
  }, [habit]);

  return (
    <AppButton
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.habitRow}>
      <AppView row centerV gap-8>
        <AppView
          style={[styles.roadmapDot, { backgroundColor: Colors.textColor }]}
        />
        <AppView flex gap-4>
          <AppView row>
            <AppView row flex centerV>
              <AppText
                body2
                textColor
                numberOfLines={2}
                style={styles.habitTitle}>
                {habit.title}
              </AppText>
              <AppView centerV>
                <RecurrenceBadge type={habit.recurrence_type} />
              </AppView>
            </AppView>
            <AppIcon set="Ionicons" name="arrow-forward-outline" size={22} />
          </AppView>
          {!!habit.description && (
            <AppText xsm secondary numberOfLines={2}>
              {habit.description}
            </AppText>
          )}
        </AppView>
      </AppView>
    </AppButton>
  );
};

interface AnchoringItemProps {
  anchoringUser: AnchoringUser;
}

export const AnchoringItem = ({ anchoringUser }: AnchoringItemProps) => {
  const { user, roadmaps, habits } = anchoringUser;
  const fullName = `${user.first_name} ${user.last_name}`.trim();

  return (
    <AppCard marginB-12 paddingV-16 paddingH-16>
      <AppButton
        onPress={() =>
          router.navigate({
            pathname: '/settings/friend-details/[friendId]',
            params: {
              friendId: user.user_id,
            },
          })
        }>
        <AppView row centerV gap-12 marginB-12>
          {user.profile_image_url ? (
            <AppImage
              source={{ uri: user.profile_image_url }}
              style={styles.avatar}
            />
          ) : (
            <AppAvatar size={16} />
          )}
          <AppView flex>
            <AppText body2 textColor>
              {fullName}
            </AppText>
          </AppView>
        </AppView>
      </AppButton>

      <AppView style={styles.divider} />

      {roadmaps.length > 0 ? (
        <AppView marginT-12 gap-4>
          {roadmaps.map((roadmap, index) => (
            <AppView key={roadmap.roadmap_id}>
              <RoadmapRow roadmap={roadmap} />
              {index < roadmaps.length - 1 && (
                <AppView style={styles.roadmapDivider} />
              )}
            </AppView>
          ))}
        </AppView>
      ) : (
        <AppView marginT-12>
          <TranslatedText
            xsm
            secondary
            translationKey="settings.no_roadmaps_shared"
          />
        </AppView>
      )}

      {habits && habits.length > 0 && (
        <>
          <AppView style={[styles.divider, styles.sectionDivider]} />
          <AppView gap-4>
            {habits.map((habit, index) => (
              <AppView key={habit.habit_id}>
                <HabitRow habit={habit} />
                {index < habits.length - 1 && (
                  <AppView style={styles.roadmapDivider} />
                )}
              </AppView>
            ))}
          </AppView>
        </>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.grey60,
    opacity: 0.4,
  },
  sectionDivider: {
    marginVertical: 12,
  },
  roadmapRow: {
    paddingVertical: 4,
  },
  roadmapDot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    flexShrink: 0,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  taskList: {
    marginTop: 6,
    paddingLeft: 16,
    gap: 4,
  },
  taskRow: {
    paddingVertical: 2,
  },
  taskBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.grey40,
    flexShrink: 0,
  },
  noTasksText: {
    fontStyle: 'italic',
  },
  roadmapDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.grey60,
    opacity: 0.25,
    marginVertical: 6,
    marginLeft: 16,
  },
  habitRow: {
    paddingVertical: 4,
  },
  habitTitle: {
    marginRight: 8,
  },
});
