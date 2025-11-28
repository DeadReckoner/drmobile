import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { TranslatedText } from '@/components/TranslatedText';
import { AppImage, AppText, AppView } from '@/components/ui';
import { useGetFriendProfileQuery } from '@/hooks/friends';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Assets, Colors } from 'react-native-ui-lib';

const AllowedRoadmaps = () => {
  const params = useLocalSearchParams<{ threadUserId: string }>();
  const { data } = useGetFriendProfileQuery(params['threadUserId']);

  const renderHeader = () => <HeaderWithBack marginB-16 />;

  const renderItem = ({ item: roadmap }: { item: RoadmapType }) => (
    <AppCard paddingV-20 onPress={() => {}}>
      <AppView row gap-16>
        <AppView bg-primary br30 center style={styles.iconContainer}>
          {roadmap.type === 'ai_generated' && (
            <AppImage
              style={[StyleSheet.absoluteFillObject]}
              source={Assets.logo.aiRoadmapBG}
            />
          )}
          <AppIcon set="Feather" name="map" color={Colors.white} size={18} />
        </AppView>
        <AppView flex gap-8 centerV>
          <AppText body1 textColor>
            {roadmap.goal}
          </AppText>
        </AppView>
      </AppView>
    </AppCard>
  );
  const renderItemSeparator = () => <Divider />;

  const renderEmptyRoadmaps = useCallback(() => {
    return (
      <AppCard paddingV-48 center>
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

  return (
    <AppScreen>
      <AppView flex>
        <AppList<RoadmapType>
          contentContainerStyle={styles.container}
          contentInsetAdjustmentBehavior="always"
          data={data?.allowed_roadmaps || []}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyRoadmaps}
          ItemSeparatorComponent={renderItemSeparator}
        />
      </AppView>
    </AppScreen>
  );
};

export default AllowedRoadmaps;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: { width: 36, height: 36 },
  roadmapProgressBar: {
    height: 5,
    width: '60%',
  },
});
