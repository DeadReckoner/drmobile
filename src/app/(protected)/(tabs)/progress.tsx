import { AppButton } from '@/components/AppButton';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HabitsList } from '@/components/HabitsList';
import { Loader } from '@/components/Loader';
import { InProgressAIRoadmapBanner } from '@/components/roadmap/ai-roamap/InProgressAIRoadmapBanner';
import { RoadmapList } from '@/components/roadmap/RoadmapList';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useGetRoadmapsQuery } from '@/hooks/roadmap';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useGetHabitsQuery } from '@/store/apis/habitsApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { selectShouldShowAIRoadmapBanner } from '@/store/slices/aiRoadmapCreationSlice';
import {
  setDraftRoadmapAction,
  setSelectedRoadmapIndex,
  setShouldSyncWithServerAction,
} from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { getAllMilestones } from '@/utils/roadmap.utils';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

const Progress = () => {
  const dispatch = useAppDispatch();
  const { t } = useLocalization();
  const { data = [], isLoading, refetch, isFetching } = useGetRoadmapsQuery();
  const { refetch: refetchHabits } = useGetHabitsQuery({
    include_archived: false,
  });

  const [manualRefreshing, setManualRefreshing] = useState(false);
  const shouldShowAIRoadmapBanner = useAppSelector(
    selectShouldShowAIRoadmapBanner,
  );
  const [selectedTab, setSelectedTab] = useState('roadmaps');

  const onItemPress = (roadmap: RoadmapType, index: number) => {
    const milestones = getAllMilestones(roadmap);

    dispatch(
      setDraftRoadmapAction({
        ...roadmap,
        milestones: roadmap.milestones || [],
      }),
    );
    dispatch(setSelectedRoadmapIndex(index));
    dispatch(setShouldSyncWithServerAction(true));

    const isRoadmapStarted =
      roadmap.start_date !== '0001-01-01T00:00:00Z' &&
      milestones?.[0]?.date !== '0001-01-01T00:00:00Z' &&
      roadmap.start_date !== null;

    if (!isRoadmapStarted) {
      router.navigate('/roadmap/roadmap-details');
    } else {
      router.navigate('/roadmap/roadmap-execution');
    }
  };

  const handleRefresh = useCallback(async () => {
    setManualRefreshing(true);
    try {
      await Promise.allSettled([refetch().unwrap(), refetchHabits().unwrap()]);
    } catch {
    } finally {
      setManualRefreshing(false);
    }
  }, [refetch, refetchHabits]);

  const HeaderSegment = () => (
    <AppView
      row
      br20
      style={{
        borderWidth: 1,
        borderColor: Colors.primary,
      }}>
      <AppButton
        center
        flex
        paddingV-8
        style={{
          backgroundColor:
            selectedTab === 'roadmaps' ? Colors.primary : 'transparent',
        }}
        onPress={() => setSelectedTab('roadmaps')}>
        <TranslatedText
          color={
            selectedTab === 'roadmaps' ? Colors.textOnPrimary : Colors.textColor
          }
          caption
          translationKey="settings.roadmaps"
        />
      </AppButton>
      <AppView width={1} bg-primary />
      <AppButton
        center
        flex
        paddingV-8
        style={{
          backgroundColor:
            selectedTab === 'habits' ? Colors.primary : 'transparent',
        }}
        onPress={() => setSelectedTab('habits')}>
        <AppText
          color={
            selectedTab === 'habits' ? Colors.textOnPrimary : Colors.textColor
          }
          caption>
          {t('settings.habits')}/{t('common.tasks')}
        </AppText>
      </AppButton>
    </AppView>
  );

  const visibleRoadmaps = data.filter(
    (roadmap) => roadmap.generation_status !== 'failed',
  );
  const isRoadmapTabSelected = selectedTab === 'roadmaps';
  const isHabitsTabSelected = selectedTab === 'habits';

  return (
    <AppScreen>
      <Animated.ScrollView
        contentContainerStyle={style.scrollContainer}
        contentInsetAdjustmentBehavior="always"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={manualRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.secondary}
          />
        }>
        <Divider />
        <AppView row spread>
          <TranslatedText h2 translationKey="tabs.progress" />
          {isFetching && !isLoading && !manualRefreshing && (
            <AppView>
              <Loader transparent containerStyle={style.scrollContainer} />
            </AppView>
          )}
        </AppView>
        <Divider />
        <AppView
          style={{ display: shouldShowAIRoadmapBanner ? 'flex' : 'none' }}>
          <InProgressAIRoadmapBanner />
          <Divider />
        </AppView>
        <HeaderSegment />
        <Divider />
        <AppView flex-1>
          {isRoadmapTabSelected && (
            <AppView
              flex-1
              pointerEvents={isFetching ? 'none' : 'auto'}
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring().delay(250)}
              exiting={Animations.Exit.FadeOutDown()}>
              {isLoading ? (
                <AppView height={100}>
                  <Loader transparent />
                </AppView>
              ) : (
                <AppView>
                  <RoadmapList
                    data={visibleRoadmaps}
                    onItemPress={onItemPress}
                  />
                </AppView>
              )}
            </AppView>
          )}

          {isHabitsTabSelected && (
            <AppView
              flex-1
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring().delay(250)}
              exiting={Animations.Exit.FadeOutDown()}>
              <HabitsList />
            </AppView>
          )}
        </AppView>
      </Animated.ScrollView>
    </AppScreen>
  );
};

export default Progress;

const style = StyleSheet.create({
  scrollContainer: {
    position: 'relative',
    flexGrow: 1,
  },
});
