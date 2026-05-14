import { AppScreen } from '@/components/AppScreen';
import { AppSegmentControl } from '@/components/AppSegmentControl';
import { Divider } from '@/components/Divider';
import { HabitsList } from '@/components/HabitsList';
import { Loader } from '@/components/Loader';
import { InProgressAIRoadmapBanner } from '@/components/roadmap/ai-roamap/InProgressAIRoadmapBanner';
import { RoadmapList } from '@/components/roadmap/RoadmapList';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
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
    dispatch(
      setDraftRoadmapAction({
        ...roadmap,
        milestones: roadmap.milestones || [],
      }),
    );
    dispatch(setSelectedRoadmapIndex(index));
    dispatch(setShouldSyncWithServerAction(true));
    router.navigate('/roadmap/roadmap-execution');
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
        <Divider />
        <AppView flex-1>
          {isRoadmapTabSelected && (
            <AppView
              flex-1
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
                    showProgress={true}
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
