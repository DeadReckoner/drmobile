import ArchivedHabits from '@/app/(protected)/settings/archived-habits';
import { AppScreen } from '@/components/AppScreen';
import { AppSegmentControl } from '@/components/AppSegmentControl';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import ArchieveRoadmaps from '@/components/settings/ArchieveRoadmaps';
import { AppView } from '@/components/ui';
import { useGetRoadmapsQuery } from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { useGetHabitsQuery } from '@/store/apis/habitsApi';
import { Animations } from '@/utils/animation.utils';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const Archieved = () => {
  const { t } = useLocalization();
  const [selectedTab, setSelectedTab] = useState('roadmap');

  const { refetch } = useGetRoadmapsQuery(); // TODO: get archieve roadmaps only
  const { refetch: refetchHabits } = useGetHabitsQuery({
    include_archived: false,
  });

  const [manualRefreshing, setManualRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setManualRefreshing(true);
    try {
      await Promise.allSettled([refetch().unwrap(), refetchHabits().unwrap()]);
    } catch {
    } finally {
      setManualRefreshing(false);
    }
  }, [refetch, refetchHabits]);

  return (
    <AppScreen safeArea>
      <HeaderWithBack headerKey="habits.archive" />
      <Divider />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={manualRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.secondary}
          />
        }>
        <AppSegmentControl
          segments={[t('settings.roadmaps'), t('settings.habits')]}
          selectedIndex={selectedTab === 'roadmap' ? 0 : 1}
          onSegmentChange={(index) =>
            setSelectedTab(index === 0 ? 'roadmap' : 'habits')
          }
        />

        {selectedTab === 'roadmap' && (
          <AppView
            flex-1
            reanimated
            entering={Animations.Entry.FadeInDownWithSpring().delay(250)}
            exiting={Animations.Exit.FadeOutDown()}>
            <ArchieveRoadmaps showProgress={false} />
          </AppView>
        )}

        {selectedTab === 'habits' && (
          <AppView
            flex-1
            reanimated
            entering={Animations.Entry.FadeInDownWithSpring().delay(250)}
            exiting={Animations.Exit.FadeOutDown()}>
            <ArchivedHabits />
          </AppView>
        )}
      </ScrollView>
    </AppScreen>
  );
};

export default Archieved;
