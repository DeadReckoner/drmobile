import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { RoadmapList } from '@/components/RoadmapList';
import { TranslatedText } from '@/components/TranslatedText';
import { useGetRoadmapsQuery } from '@/hooks/roadmap';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { router } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native';
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
      <ScrollView
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
        <Divider />
        <RoadmapList data={data} onItemPress={onItemPress} />
      </ScrollView>
    </AppScreen>
  );
};

export default Progress;
