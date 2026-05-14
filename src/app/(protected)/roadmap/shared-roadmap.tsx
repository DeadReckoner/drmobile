import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { AppSegmentControl } from '@/components/AppSegmentControl';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { RoadmapCurrentStateOverview } from '@/components/roadmap/RoadmapCurrentStateOverview';
import { TaskItem } from '@/components/roadmap/TaskItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppProgressBar, AppText, AppView } from '@/components/ui';
import {
  useCopySharedRoadmapMutation,
  useGetRoadmapsQuery,
  useGetSharedRoadmapQuery,
} from '@/hooks/roadmap';
import {
  MilestoneType,
  Phase,
  TaskType,
} from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { DateUtils } from '@/utils/date.utils';
import { findOngoingMilestone } from '@/utils/roadmap.utils';
import { LegendListRenderItemProps } from '@legendapp/list';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const SharedRoadmapScreen = () => {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { t } = useLocalization();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = !!user?.id;

  const [firstTabSelected, setFirstTabSelected] = useState(true);

  const {
    data: roadmap,
    isLoading,
    error,
  } = useGetSharedRoadmapQuery(token ?? '', { skip: !token });

  const { data: myRoadmaps } = useGetRoadmapsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [copySharedRoadmap, { isLoading: isCopying }] =
    useCopySharedRoadmapMutation();

  const alreadyOwned = useMemo(() => {
    if (!roadmap || !myRoadmaps) return false;
    return myRoadmaps.some(
      (r) => r.goal === roadmap.goal && r.days === roadmap.days,
    );
  }, [roadmap, myRoadmaps]);

  const currentMilestone = useMemo<MilestoneType | null>(() => {
    if (!roadmap) return null;
    const phases = roadmap.phases ?? [];
    if (phases.length > 0) {
      for (const phase of phases) {
        const m = findOngoingMilestone(phase.milestones ?? []);
        if (m) return m;
      }
      return null;
    }
    return findOngoingMilestone(roadmap.milestones ?? []) ?? null;
  }, [roadmap]);

  const todayTasks = useMemo(
    () =>
      (currentMilestone?.tasks ?? []).filter(
        (task) => task.date && DateUtils.isSameDate(task.date, new Date()),
      ),
    [currentMilestone],
  );

  const handleCopyRoadmap = useCallback(async () => {
    if (!token) return;
    try {
      const newRoadmap = await copySharedRoadmap(token).unwrap();
      dispatch(setDraftRoadmapAction(newRoadmap));
      showToast({
        type: 'success',
        message: t('roadmap.shared_preview.copy_success'),
      });
      router.replace('/roadmap/roadmap-details');
    } catch (err) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(err),
      });
    }
  }, [token, copySharedRoadmap, dispatch, showToast, t]);

  const handleOverviewPress = useCallback(
    (phase?: Phase) => {
      if (!roadmap) return;
      if (roadmap.type === 'custom_made') return;
      if (phase) {
        // read-only; no navigation
      }
    },
    [roadmap],
  );

  const handleTaskPress = useCallback((_task: TaskType) => {
    // read-only preview; no navigation
  }, []);

  const renderTaskItem = useCallback(
    ({ item }: LegendListRenderItemProps<TaskType>) => (
      <TaskItem task={item} onTaskClick={handleTaskPress} />
    ),
    [handleTaskPress],
  );

  if (!token) {
    return (
      <AppScreen safeArea>
        <HeaderWithBack />
        <AppView flex center paddingH-24>
          <TranslatedText
            body1
            secondary
            translationKey="roadmap.shared_preview.not_found"
          />
        </AppView>
      </AppScreen>
    );
  }

  if (isLoading) {
    return (
      <AppScreen safeArea>
        <HeaderWithBack />
        <Loader />
      </AppScreen>
    );
  }

  if (error || !roadmap) {
    return (
      <AppScreen safeArea>
        <HeaderWithBack />
        <AppView flex center paddingH-24 gap-16>
          <AppIcon
            set="Feather"
            name="link-2"
            size={48}
            color={Colors.secondary}
          />
          <TranslatedText
            body1
            secondary
            center
            translationKey="roadmap.shared_preview.not_found"
          />
        </AppView>
      </AppScreen>
    );
  }

  const anchorName = roadmap.anchor ? roadmap.anchor.name : undefined;

  return (
    <AppScreen safeArea>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <AppView row spread centerV>
          <HeaderWithBack />
        </AppView>

        <AppView row centerV gap-6 marginH-16 marginB-4>
          <AppIcon
            set="Feather"
            name="share-2"
            size={14}
            color={Colors.secondary}
          />
          <TranslatedText
            xsm
            secondary
            translationKey="roadmap.shared_preview.title"
          />
          {anchorName && (
            <>
              <AppText xsm secondary>
                ·
              </AppText>
              <AppText xsm secondary>
                {t('roadmap.shared_preview.by_label')} {anchorName}
              </AppText>
            </>
          )}
        </AppView>

        <Divider />

        <AppSegmentControl
          segments={[t('tabs.today'), t('settings.roadmaps').slice(0, 7)]}
          selectedIndex={firstTabSelected ? 0 : 1}
          onSegmentChange={(index) => setFirstTabSelected(index === 0)}
        />

        <AppView reanimated layout={Animations.Layout.Springify()}>
          {firstTabSelected ? (
            <AppView
              key="today-tab"
              flex
              reanimated
              entering={Animations.Entry.FadeInDown()}
              exiting={Animations.Exit.FadeOutDown()}>
              <Divider />
              <AppCard onPress={() => setFirstTabSelected(false)}>
                <AppView flex gap-12>
                  <AppText subtitle1 regular textColor>
                    {roadmap.goal}
                  </AppText>
                  <AppView row flex centerV gap-16>
                    <AppText body1 light textColor flex-0>
                      {t('roadmap.progress')}:
                    </AppText>
                    <AppProgressBar
                      style={[
                        styles.progressBar,
                        { backgroundColor: Colors.outline },
                      ]}
                      fullWidth
                      progress={roadmap.progress ?? 0}
                      progressColor={Colors.primary}
                    />
                    <AppText body1 light textColor>
                      {roadmap.progress ?? 0}%
                    </AppText>
                  </AppView>
                  {currentMilestone && (
                    <AppText body1 light textColor>
                      {t('common.current_milestone')}:{' '}
                      {currentMilestone.sub_goal}
                    </AppText>
                  )}
                </AppView>
              </AppCard>
              <Divider />
              <AppList<TaskType>
                keyExtractor={(i) => i.task_id}
                data={todayTasks}
                renderItem={renderTaskItem}
                ListEmptyComponent={() => (
                  <EmptyListItemPlaceholder
                    title="tabs.create_tab.no_tasks_or_habits_yet"
                    subtitle="tabs.create_tab.no_tasks_or_habits_description"
                  />
                )}
                ItemSeparatorComponent={() => <Divider />}
                ListFooterComponent={() => <Divider />}
              />
            </AppView>
          ) : (
            <AppView
              key="overview-tab"
              flex
              gap-12
              reanimated
              entering={Animations.Entry.FadeInDown()}
              exiting={Animations.Exit.FadeOutDown()}>
              <RoadmapCurrentStateOverview
                key={roadmap.roadmap_id}
                roadmap={roadmap}
                roadmapCreateStartControls={null}
                onOverviewPress={handleOverviewPress}
                onPhasePress={() => {}}
                onMilestonePress={() => {}}
              />
            </AppView>
          )}
        </AppView>
      </ScrollView>

      <AppView paddingH-16 paddingB-24>
        {!isAuthenticated ? (
          <AppView
            padding-16
            br10
            center
            style={[styles.signInBanner, { borderColor: Colors.accent }]}>
            <AppIcon
              set="Feather"
              name="lock"
              size={20}
              color={Colors.accent}
            />
            <TranslatedText
              body2
              center
              textColor
              marginT-8
              translationKey="roadmap.shared_preview.sign_in_prompt"
            />
            <AppButton
              bg-accent
              br20
              center
              paddingH-24
              paddingV-10
              marginT-12
              onPress={() => router.replace('/(auth)/login')}>
              <TranslatedText
                body2
                style={{ color: Colors.white }}
                translationKey="authentication.login"
              />
            </AppButton>
          </AppView>
        ) : alreadyOwned ? (
          <AppView
            row
            center
            gap-8
            padding-14
            br10
            style={[
              styles.alreadyOwnedBanner,
              { borderColor: Colors.outline },
            ]}>
            <AppIcon
              set="Feather"
              name="check-circle"
              size={18}
              color={Colors.success}
            />
            <TranslatedText
              body2
              textColor
              translationKey="roadmap.shared_preview.already_added"
            />
          </AppView>
        ) : (
          <PrimaryButton
            label="roadmap.shared_preview.add_button"
            shouldShowLoader
            isLoading={isCopying}
            onPress={handleCopyRoadmap}
          />
        )}
      </AppView>
    </AppScreen>
  );
};

export default SharedRoadmapScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    width: '50%',
  },
  signInBanner: {
    borderWidth: 1,
    borderRadius: 8,
  },
  alreadyOwnedBanner: {
    borderWidth: 1,
    borderRadius: 8,
  },
});
