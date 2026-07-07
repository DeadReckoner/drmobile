import { AppAvatar } from '@/components/AppAvatar';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppText, AppView } from '@/components/ui';
import {
  AnchoringRoadmap,
  AnchoringUser,
} from '@/hooks/friends/types/friends.types';
import {
  MilestoneType,
  RoadmapType,
  TaskType,
} from '@/hooks/roadmap/types/roadmap.types';
import { storeRoadmap } from '@/utils/roadmapTransfer';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const toRoadmapType = (roadmap: AnchoringRoadmap): RoadmapType => ({
  roadmap_id: roadmap.roadmap_id,
  goal: roadmap.goal,
  description: roadmap.description,
  days: 0,
  completed: false,
  start_date: new Date().toISOString(),
  milestones:
    roadmap.tasks.length > 0
      ? [
          {
            milestone_id: 'anchoring-today',
            roadmap_id: roadmap.roadmap_id,
            sub_goal: 'Today',
            description: '',
            day: 0,
            tasks: roadmap.tasks,
            status: 'in_progress',
          } as MilestoneType,
        ]
      : [],
});

interface RoadmapRowProps {
  roadmap: AnchoringRoadmap;
}

const RoadmapRow = ({ roadmap }: RoadmapRowProps) => {
  const handlePress = useCallback(() => {
    storeRoadmap(toRoadmapType(roadmap));
    router.navigate({ pathname: '/settings/readonly-roadmap-details' });
  }, [roadmap]);

  return (
    <AppButton
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.roadmapRow}>
      <AppView row centerV gap-8>
        <AppView
          style={[
            styles.roadmapDot,
            {
              backgroundColor: Colors.textColor,
            },
          ]}
        />
        <AppView flex row centerV>
          <AppText
            flex
            body2
            textColor
            numberOfLines={2}
            style={styles.roadmapGoal}>
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
            No tasks today
          </AppText>
        </AppView>
      )}
    </AppButton>
  );
};

interface AnchoringItemProps {
  anchoringUser: AnchoringUser;
}

export const AnchoringItem = ({ anchoringUser }: AnchoringItemProps) => {
  const { user, roadmaps } = anchoringUser;
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
            <Image
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
            <AppText xsm secondary>
              {roadmaps.length} roadmap{roadmaps.length !== 1 ? 's' : ''}
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
          <AppText xsm secondary>
            No roadmaps shared
          </AppText>
        </AppView>
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
  roadmapGoal: {
    fontWeight: '600',
    marginRight: 16,
    maxWidth: '85%',
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
});
