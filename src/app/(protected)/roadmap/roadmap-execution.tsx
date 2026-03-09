import { AppCard } from '@/components/AppCard';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { PrimaryButton } from '@/components/PrimaryButton';
import { RoadmapCurrentStateOverview } from '@/components/roadmap/RoadmapCurrentStateOverview';
import { TranslatedText } from '@/components/TranslatedText';
import { AppProgressBar, AppText, AppView } from '@/components/ui';
import { useGetRoadmapsQuery } from '@/hooks/roadmap';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectDraftRoadmap,
  setSelectedTaskAction,
} from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { DateUtils } from '@/utils/date.utils';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors, SegmentedControl, Typography } from 'react-native-ui-lib';

const RoadmapExecution = () => {
  const { theme } = useAppTheme();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const draftRoadmap = useAppSelector(selectDraftRoadmap);
  const { data: roadmaps } = useGetRoadmapsQuery();
  const [firstTabSelected, setFirstTabSelected] = useState(true);
  const roadmap =
    roadmaps?.find((r) => r.roadmap_id === draftRoadmap?.roadmap_id) ||
    draftRoadmap;
  const currentMilestone = roadmap?.milestones?.find(
    (milestone) => !milestone.reached,
  );

  const totalTasks = currentMilestone?.tasks || [];
  const completedTasks = totalTasks.filter((task) => task.completed);
  const allTasksCompleted = completedTasks.length === totalTasks.length;

  const handleTaskClick = () => {
    const todayTask = totalTasks.find((task) => {
      if (!task.date) return false;
      return DateUtils.isSameDate(task.date, new Date());
    });

    const task = todayTask || totalTasks.find((t) => !t.completed);

    if (!task) return;

    dispatch(setSelectedTaskAction({ task }));
    router.navigate(`/task/today-task-details`);
  };

  return (
    <AppScreen safeArea>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
            <AppView
              key="today-tab"
              flex
              gap-12
              useSafeArea
              reanimated
              entering={Animations.Entry.FadeInDown()}
              exiting={Animations.Exit.FadeOutDown()}>
              <AppCard>
                <AppView flex gap-12>
                  <AppView row centerV spread>
                    <AppText subtitle1 regular textColor>
                      {t('roadmap.goal')}: {roadmap?.goal}
                    </AppText>
                  </AppView>
                  <AppView row flex centerV gap-16 marginT-8>
                    <AppText subtitle2 light textColor flex-0>
                      {t('roadmap.progress')}:
                    </AppText>
                    <AppProgressBar
                      style={[
                        styles.progressBar,
                        { backgroundColor: Colors.outline },
                      ]}
                      fullWidth={true}
                      progress={roadmap?.progress || 0}
                      progressColor={
                        theme === 'dark' ? Colors.white : Colors.primary
                      }
                    />
                    <AppText subtitle2 light textColor>
                      {roadmap?.progress || 0}%
                    </AppText>
                  </AppView>
                  {currentMilestone && (
                    <AppView marginT-8 row centerV style={{ flexWrap: 'wrap' }}>
                      <AppText subtitle2 light textColor flex-1>
                        {t('common.current_milestone')}:{' '}
                        {currentMilestone.sub_goal}
                      </AppText>
                    </AppView>
                  )}
                </AppView>
              </AppCard>
              {allTasksCompleted && currentMilestone && (
                <AppCard marginT-16>
                  <AppView row centerV spread>
                    <TranslatedText
                      subtitle2
                      light
                      textColor
                      translationKey="roadmap.all_tasks_completed"
                    />
                    <AppView
                      row
                      centerV
                      paddingH-12
                      paddingV-4
                      br100
                      style={{ backgroundColor: Colors.success }}>
                      <AppText textColor xsm semibold>
                        {completedTasks.length} / {totalTasks.length}
                      </AppText>
                    </AppView>
                  </AppView>
                </AppCard>
              )}
              <AppView marginT-16 flex useSafeArea>
                {!allTasksCompleted && currentMilestone && (
                  <PrimaryButton
                    label="roadmap.continue_current_task"
                    onPress={handleTaskClick}
                  />
                )}
              </AppView>
            </AppView>
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
                onRoadmapPress={() => {
                  router.navigate('/roadmap/roadmap-details');
                }}
                onPhasePress={(phase) => {
                  router.navigate({
                    pathname: '/roadmap/phase-details',
                    params: { phaseId: phase.phase_id },
                  });
                }}
                onMilestonePress={() => {
                  router.navigate({
                    pathname: '/roadmap/phase-milestones',
                    params: {
                      milestones: JSON.stringify(roadmap.milestones || []),
                    },
                  });
                }}
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
  progressBar: {
    height: 6,
    borderRadius: 3,
    width: '50%',
  },
});
