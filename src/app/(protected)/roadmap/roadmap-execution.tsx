import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { RoadmapCurrentStateOverview } from '@/components/roadmap/RoadmapCurrentStateOverview';
import { TodayTab } from '@/components/roadmap/TodayTab';
import { AppView } from '@/components/ui';
import { useGetRoadmapByIdQuery } from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectCurrentMilestone,
  selectDraftRoadmap,
  setDraftRoadmapAction,
} from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { DateUtils } from '@/utils/date.utils';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors, SegmentedControl, Typography } from 'react-native-ui-lib';

const RoadmapExecution = () => {
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const draftRoadmap = useAppSelector(selectDraftRoadmap);
  const currentMilestone = useAppSelector(selectCurrentMilestone);
  const { data, isFetching } = useGetRoadmapByIdQuery(
    draftRoadmap?.roadmap_id ?? '',
    {
      skip: !draftRoadmap?.roadmap_id,
      refetchOnMountOrArgChange: true,
    },
  );
  const roadmap = data ?? draftRoadmap;

  const [firstTabSelected, setFirstTabSelected] = useState(true);

  const todayTasks = useMemo(
    () =>
      (currentMilestone?.tasks || []).filter(
        (task) => task.date && DateUtils.isSameDate(task.date, new Date()),
      ),
    [currentMilestone],
  );

  useEffect(() => {
    if (data) {
      dispatch(setDraftRoadmapAction(data));
    }
  }, [data, dispatch]);

  const handleOverviewPress = useCallback(
    (
      phase: Parameters<
        NonNullable<
          React.ComponentProps<
            typeof RoadmapCurrentStateOverview
          >['onOverviewPress']
        >
      >[0],
    ) => {
      if (phase) {
        router.navigate({
          pathname: '/roadmap/phase-details',
          params: { phaseId: phase.phase_id },
        });
      }
    },
    [],
  );

  const handlePhasePress = useCallback(
    (
      phase: Parameters<
        NonNullable<
          React.ComponentProps<
            typeof RoadmapCurrentStateOverview
          >['onPhasePress']
        >
      >[0],
    ) => {
      router.navigate({
        pathname: '/roadmap/phase-milestones',
        params: {
          phaseId: phase.phase_id,
          phaseLabel: String(phase.order_index),
        },
      });
    },
    [],
  );

  const handleMilestonePress = useCallback(
    (
      milestone: Parameters<
        NonNullable<
          React.ComponentProps<
            typeof RoadmapCurrentStateOverview
          >['onMilestonePress']
        >
      >[0],
      phase: Parameters<
        NonNullable<
          React.ComponentProps<
            typeof RoadmapCurrentStateOverview
          >['onMilestonePress']
        >
      >[1],
    ) => {
      const phaseLabel = phase?.order_index ? String(phase.order_index) : '';
      const milestoneNumber =
        milestone.order_index != null ? milestone.order_index : 1;
      router.navigate({
        pathname: '/roadmap/phase-milestones-tasks',
        params: {
          milestoneId: milestone.milestone_id,
          phaseId: phase?.phase_id ?? '',
          phaseLabel,
          milestoneLabel: String(milestoneNumber),
        },
      });
    },
    [],
  );

  return (
    <AppScreen safeArea>
      <ScrollView
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <AppView row spread centerV>
          <HeaderWithBack />
          <SegmentedControl
            style={{
              borderWidth: 0,
            }}
            segments={[
              {
                label: t('tabs.today'),
              },
              {
                label: t('common.overview'),
              },
            ]}
            segmentsStyle={{
              minWidth: 70,
              paddingVertical: 6,
            }}
            segmentLabelStyle={[
              Typography.sm,
              Typography.regular,
              {
                fontWeight: '400',
              },
            ]}
            outlineWidth={0}
            backgroundColor={Colors.lightCardBG}
            activeColor={Colors.textColor}
            inactiveColor={Colors.textColor}
            activeBackgroundColor={Colors.accent}
            onChangeIndex={(index) => setFirstTabSelected(index === 0)}
          />
        </AppView>
        <Divider />

        <AppView reanimated layout={Animations.Layout.Springify()}>
          {firstTabSelected ? (
            <TodayTab
              roadmap={roadmap}
              currentMilestone={currentMilestone}
              todayTasks={todayTasks}
              isRoadmapFeching={isFetching}
            />
          ) : (
            <AppView
              key="overview-tab"
              flex
              gap-12
              useSafeArea
              reanimated
              entering={Animations.Entry.FadeInDown()}
              exiting={Animations.Exit.FadeOutDown()}>
              <RoadmapCurrentStateOverview
                key={roadmap.roadmap_id}
                roadmap={roadmap}
                onOverviewPress={handleOverviewPress}
                onPhasePress={handlePhasePress}
                onMilestonePress={handleMilestonePress}
              />
            </AppView>
          )}
        </AppView>
      </ScrollView>
    </AppScreen>
  );
};

export default RoadmapExecution;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
});
