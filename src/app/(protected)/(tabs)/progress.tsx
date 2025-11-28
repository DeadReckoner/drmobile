import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { InProgressAIRoadmapBanner } from '@/components/roadmap/ai-roamap/InProgressAIRoadmapBanner';
import { RoadmapList } from '@/components/roadmap/RoadmapList';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { useGetRoadmapsQuery } from '@/hooks/roadmap';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { selectShouldShowAIRoadmapBanner } from '@/store/slices/aiRoadmapCreationSlice';
import {
  setDraftRoadmapAction,
  setSelectedRoadmapIndex,
} from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

const Progress = () => {
  const dispatch = useAppDispatch();
  const { data = [], isLoading, refetch, isFetching } = useGetRoadmapsQuery();
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const shouldShowAIRoadmapBanner = useAppSelector(
    selectShouldShowAIRoadmapBanner,
  );

  const onItemPress = (roadmap: RoadmapType, index: number) => {
    dispatch(setDraftRoadmapAction(roadmap));
    dispatch(setSelectedRoadmapIndex(index));
    router.navigate('/roadmap/roadmap-details');
  };

  const handleRefresh = useCallback(async () => {
    setManualRefreshing(true);
    try {
      await refetch().unwrap();
    } finally {
      setManualRefreshing(false);
    }
  }, [refetch]);

  return (
    <AppScreen>
      <Animated.ScrollView
        layout={Animations.Layout.Springify()}
        entering={Animations.Entry.FadeInDown()}
        exiting={Animations.Exit.FadeOutDown()}
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
            <Loader transparent containerStyle={style.scrollContainer} />
          )}
        </AppView>
        <Divider />
        {shouldShowAIRoadmapBanner && (
          <>
            <InProgressAIRoadmapBanner />
            <Divider />
          </>
        )}
        <AppView flex-1>
          {isLoading && (
            <AppView height={100}>
              <Loader transparent />
            </AppView>
          )}
          {!isLoading && (
            <AppView
              pointerEvents={isFetching ? 'none' : 'auto'}
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring()}
              exiting={Animations.Exit.FadeOutDown()}>
              <RoadmapList data={data} onItemPress={onItemPress} />
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
  },
});
