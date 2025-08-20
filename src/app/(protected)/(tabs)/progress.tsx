import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { RoadmapList } from '@/components/roadmap/RoadmapList';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { useGetRoadmapsQuery } from '@/hooks/roadmap';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { router } from 'expo-router';
import { RefreshControl } from 'react-native';
import Animated from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

const Progress = () => {
  const dispatch = useAppDispatch();
  const { data = [], isLoading, isFetching, refetch } = useGetRoadmapsQuery();

  const onItemPress = (roadmap: RoadmapType) => {
    dispatch(setDraftRoadmapAction(roadmap));
    router.navigate('/roadmap/roadmap-details');
  };

  return (
    <AppScreen>
      {isLoading && <Loader />}
      <Animated.ScrollView
        layout={Animations.Layout.Springify}
        entering={Animations.Entry.FadeInDown}
        exiting={Animations.Exit.FadeOutDown}
        contentInsetAdjustmentBehavior="always"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={Colors.secondary}
          />
        }>
        <Divider />
        <TranslatedText h2 translationKey="tabs.progress" />
        {data?.length > 0 && (
          <AppView
            reanimated
            entering={Animations.Entry.FadeInDownWithSpring}
            exiting={Animations.Exit.FadeOutDown}>
            <Divider />
            <RoadmapList data={data} onItemPress={onItemPress} />
          </AppView>
        )}
      </Animated.ScrollView>
    </AppScreen>
  );
};

export default Progress;
