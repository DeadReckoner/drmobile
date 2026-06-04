import ArchivedHabits from '@/app/(protected)/settings/archived-habits';
import { AppScreen } from '@/components/AppScreen';
import { AppSegmentControl } from '@/components/AppSegmentControl';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { ArchieveRoadmaps } from '@/components/settings/ArchieveRoadmaps';
import { AppView } from '@/components/ui';
import { useGetRoadmapsQuery } from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { useGetHabitsQuery } from '@/store/apis/habitsApi';
import { Animations } from '@/utils/animation.utils';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const Archieved = () => {
  const { t } = useLocalization();
  const [selectedTab, setSelectedTab] = useState('roadmap');

  const {
    data: roadmaps,
    refetch,
    isFetching: isFetchingRoadmaps,
  } = useGetRoadmapsQuery({
    include_archived: true,
  });

  const {
    data: habits,
    refetch: refetchHabits,
    isFetching: isFetchingHabits,
  } = useGetHabitsQuery({
    include_archived: true,
  });

  const archivedRoadmaps = useMemo(
    () => roadmaps?.filter((r) => r.archived),
    [roadmaps],
  );
  const archivedHabits = useMemo(
    () => habits?.filter((h) => h.archived),
    [habits],
  );

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
      <AppView row spread center>
        <AppView flex>
          <HeaderWithBack headerKey="habits.archive" />
        </AppView>
        {!manualRefreshing && (isFetchingHabits || isFetchingRoadmaps) && (
          <AppView width={24} height={24} center>
            <Loader transparent style={{ position: 'relative' }} />
          </AppView>
        )}
      </AppView>
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
            paddingT-16
            reanimated
            entering={Animations.Entry.FadeInDownWithSpring().delay(250)}
            exiting={Animations.Exit.FadeOutDown()}>
            <ArchieveRoadmaps
              archivedRoadmaps={archivedRoadmaps || []}
              showProgress={false}
            />
          </AppView>
        )}

        {selectedTab === 'habits' && (
          <AppView
            flex-1
            paddingT-16
            reanimated
            entering={Animations.Entry.FadeInDownWithSpring().delay(250)}
            exiting={Animations.Exit.FadeOutDown()}>
            <ArchivedHabits habits={archivedHabits || []} />
          </AppView>
        )}
      </ScrollView>
    </AppScreen>
  );
};

export default Archieved;
