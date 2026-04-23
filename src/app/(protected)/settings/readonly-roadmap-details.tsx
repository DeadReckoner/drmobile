import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { RoadmapDetails } from '@/components/roadmap/RoadmapDetails';
import { RoadmapNudgeButton } from '@/components/roadmap/RoadmapNudgeButton';
import { AppView } from '@/components/ui';
import { useGetRoadmapByIdQuery } from '@/hooks/roadmap';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

const ReadonlyRoadmapDetails = () => {
  const params = useLocalSearchParams<{
    roadmap: string;
  }>();
  const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);
  const user = useAppSelector(selectUser);

  const {
    data: remoteRoadmap,
    isLoading,
    isFetching,
    refetch,
  } = useGetRoadmapByIdQuery(roadmap?.roadmap_id || '', {
    skip: !roadmap?.roadmap_id,
  });

  const finalRoadmap = remoteRoadmap || roadmap;
  const isAnchor = !!user?.id && user.id === finalRoadmap?.anchor_id;

  useEffect(() => {
    if (params.roadmap) {
      try {
        setRoadmap(JSON.parse(params.roadmap));
      } catch {}
    }
  }, [params.roadmap]);

  const onBackPress = () => {
    router.back();
  };

  return (
    <AppScreen>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isFetching}
            onRefresh={refetch}
          />
        }>
        <HeaderWithBack
          headerText={finalRoadmap?.goal}
          goBackOnPress={false}
          onBackPress={onBackPress}
          flex-1
        />

        <Divider margin-16 />
        {finalRoadmap && (
          <AppView flex>
            <RoadmapDetails
              roadmap={finalRoadmap}
              toggleEditMode={() => {}}
              readonly
            />
          </AppView>
        )}
      </ScrollView>

      {isAnchor && finalRoadmap?.roadmap_id && (
        <RoadmapNudgeButton roadmapId={finalRoadmap.roadmap_id} />
      )}
    </AppScreen>
  );
};

export default ReadonlyRoadmapDetails;
