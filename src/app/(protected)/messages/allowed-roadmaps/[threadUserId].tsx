import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { AppSegmentControl } from '@/components/AppSegmentControl';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { TranslatedText } from '@/components/TranslatedText';
import { AppImage, AppText, AppView } from '@/components/ui';
import { useGetFriendProfileQuery } from '@/hooks/friends';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { HabitType } from '@/store/apis/types/habitsApi.types';
import { Animations } from '@/utils/animation.utils';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import { Assets, Colors } from 'react-native-ui-lib';

const AllowedRoadmaps = () => {
  const params = useLocalSearchParams<{ threadUserId: string }>();
  const { data, isFetching, refetch } = useGetFriendProfileQuery(
    params['threadUserId'],
    {
      skip: !params['threadUserId'],
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    },
  );

  const { t } = useLocalization();
  const [selectedTab, setSelectedTab] = useState('roadmaps');

  const renderItem = ({ item: roadmap }: { item: RoadmapType }) => (
    <AppCard
      paddingV-20
      onPress={() => {
        router.navigate({
          pathname: '/settings/readonly-roadmap-details',
          params: {
            roadmap: JSON.stringify(roadmap),
          },
        });
      }}>
      <AppView row gap-16>
        <AppView marginT-4 bg-primary br30 center style={styles.iconContainer}>
          {roadmap.type === 'ai_generated' && (
            <AppImage
              style={[StyleSheet.absoluteFill]}
              source={Assets.logo.aiRoadmapBG}
            />
          )}
          <AppIcon set="Feather" name="map" color={Colors.white} size={20} />
        </AppView>
        <AppView flex gap-4 centerV>
          <AppText body1 textColor>
            {roadmap.goal}
          </AppText>
          <AppText xsm light textColor numberOfLines={2}>
            {roadmap.description}
          </AppText>
        </AppView>
      </AppView>
    </AppCard>
  );

  const renderHabitItem = ({ item: habit }: { item: HabitType }) => (
    <AppCard
      padding-20
      onPress={() => {
        router.navigate({
          pathname: '/settings/readonly-habit-details',
          params: { habit: JSON.stringify(habit) },
        });
      }}>
      <AppView row centerV flex-1 gap-4>
        <AppText body2 textColor flex-1>
          {habit.title}
        </AppText>
        <AppView bg-accent paddingH-8 paddingV-4 br100>
          <AppText white sm regular style={{ textTransform: 'capitalize' }}>
            {habit.recurrence_type === 'none'
              ? t('habits.recurrence.none')
              : habit.recurrence_type}
          </AppText>
        </AppView>
      </AppView>
      {habit.description && (
        <AppText xsm textColor marginT-4>
          {habit.description}
        </AppText>
      )}
    </AppCard>
  );
  const renderItemSeparator = () => <Divider />;

  const renderEmptyRoadmaps = useCallback(() => {
    return (
      <AppCard paddingV-48 center onPress={() => {}}>
        <AppView center gap-20>
          <AppIcon set="Feather" name="map" size={48} />
          <AppView center gap-8>
            <TranslatedText
              subtitle2
              translationKey="settings.no_roadmaps_shared"
            />
            <TranslatedText
              xsm
              secondary
              center
              translationKey="settings.no_roadmaps_shared_description"
            />
          </AppView>
        </AppView>
      </AppCard>
    );
  }, []);

  const renderEmptyHabits = useCallback(() => {
    return (
      <AppCard paddingV-48 center onPress={() => {}}>
        <AppView center gap-20>
          <AppView center gap-8>
            <TranslatedText
              subtitle2
              translationKey="settings.no_habits_shared"
            />
            <TranslatedText
              xsm
              secondary
              center
              translationKey="settings.no_habits_shared_description"
            />
          </AppView>
        </AppView>
      </AppCard>
    );
  }, []);

  return (
    <AppScreen safeArea>
      <HeaderWithBack />
      <Divider />
      <AppSegmentControl
        segments={[
          t('settings.roadmaps'),
          `${t('settings.habits')}/${t('common.tasks')}`,
        ]}
        selectedIndex={selectedTab === 'roadmaps' ? 0 : 1}
        onSegmentChange={(index) =>
          setSelectedTab(index === 0 ? 'roadmaps' : 'habits')
        }
      />
      <AppView flex marginT-16>
        {selectedTab === 'roadmaps' && (
          <AppView
            flex-1
            reanimated
            entering={Animations.Entry.FadeInDownWithSpring().delay(250)}
            exiting={Animations.Exit.FadeOutDown()}>
            <AppList<RoadmapType>
              keyExtractor={(i) => i.roadmap_id}
              contentContainerStyle={styles.container}
              contentInsetAdjustmentBehavior="always"
              data={data?.allowed_roadmaps || []}
              renderItem={renderItem}
              ListEmptyComponent={renderEmptyRoadmaps}
              ItemSeparatorComponent={renderItemSeparator}
              refreshControl={
                <RefreshControl refreshing={isFetching} onRefresh={refetch} />
              }
            />
          </AppView>
        )}
        {selectedTab === 'habits' && (
          <AppView
            flex-1
            reanimated
            entering={Animations.Entry.FadeInDownWithSpring().delay(250)}
            exiting={Animations.Exit.FadeOutDown()}>
            <AppList<HabitType>
              keyExtractor={(i) => i.habit_id}
              contentContainerStyle={styles.container}
              contentInsetAdjustmentBehavior="always"
              data={data?.allowed_habits || []}
              renderItem={renderHabitItem}
              ListEmptyComponent={renderEmptyHabits}
              ItemSeparatorComponent={renderItemSeparator}
              refreshControl={
                <RefreshControl refreshing={isFetching} onRefresh={refetch} />
              }
            />
          </AppView>
        )}
      </AppView>
    </AppScreen>
  );
};

export default AllowedRoadmaps;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: { width: 40, height: 40 },
  roadmapProgressBar: {
    height: 5,
    width: '60%',
  },
});
