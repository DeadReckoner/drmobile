import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { RoadmapDetails } from '@/components/roadmap/RoadmapDetails';
import { AppView } from '@/components/ui';
import { useGetRoadmapByIdQuery } from '@/hooks/roadmap';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

const ReadonlyRoadmapDetails = () => {
  const params = useLocalSearchParams<{
    roadmap: string;
  }>();
  const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);

  const {
    data: remoteRoadmap,
    isLoading,
    isFetching,
    refetch,
  } = useGetRoadmapByIdQuery(roadmap?.roadmap_id || '', {
    skip: !roadmap?.roadmap_id,
  });

  const finalRoadmap = remoteRoadmap || roadmap;

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
    </AppScreen>
  );
};

export default ReadonlyRoadmapDetails;
