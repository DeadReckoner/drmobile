import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { RoadmapDetails } from '@/components/roadmap/RoadmapDetails';
import { AppView } from '@/components/ui';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

const ReadonlyRoadmapDetails = () => {
  const params = useLocalSearchParams<{
    roadmap: string;
  }>();
  const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);

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
        showsVerticalScrollIndicator={false}>
        <HeaderWithBack
          headerText={roadmap?.goal}
          goBackOnPress={false}
          onBackPress={onBackPress}
        />
        <Divider margin-16 />
        {roadmap && (
          <AppView flex>
            <RoadmapDetails
              roadmap={roadmap}
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
