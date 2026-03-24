import { AppActionSheetModal } from '@/components/AppActionSheetModal';
import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { RoadmapCurrentStateOverview } from '@/components/roadmap/RoadmapCurrentStateOverview';
import { TodayTab } from '@/components/roadmap/TodayTab';
import { AppView } from '@/components/ui';
import {
  useCreateRoadmapMutation,
  useDeleteRoadmapMutation,
  useGetRoadmapByIdQuery,
  useStartRoadmapMutation,
} from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  resetDraftAction,
  selectCurrentMilestone,
  selectDraftRoadmap,
  setDraftRoadmapAction,
} from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { DateUtils } from '@/utils/date.utils';
import { getAllMilestones, isRoadmapStarted } from '@/utils/roadmap.utils';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors, SegmentedControl, Typography } from 'react-native-ui-lib';

const RoadmapExecution = () => {
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const draftRoadmap = useAppSelector(selectDraftRoadmap);
  const currentMilestone = useAppSelector(selectCurrentMilestone);
  const {
    data,
    isLoading: isRoadmapLoading,
    isFetching: isRoadmapFetching,
  } = useGetRoadmapByIdQuery(draftRoadmap?.roadmap_id ?? '', {
    skip: !draftRoadmap?.roadmap_id,
    refetchOnMountOrArgChange: true,
  });
  const roadmap = data ?? draftRoadmap;
  const { showToast } = useToast();
  const [deleteRoadmap] = useDeleteRoadmapMutation();
  const [createRoadmap, { isLoading: isCreatingRoadmap }] =
    useCreateRoadmapMutation();

  const [startRoadmap, { isLoading: isStartingRoadmap }] =
    useStartRoadmapMutation();

  const [firstTabSelected, setFirstTabSelected] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
      if (roadmap.type === 'custom_made') {
        router.navigate({
          pathname: '/roadmap/phase-milestones',
        });
        return;
      }
      if (phase) {
        router.navigate({
          pathname: '/roadmap/phase-details',
          params: { phaseId: phase.phase_id },
        });
      }
    },
    [roadmap.type],
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
      const phaseLabel = phase?.order_index;
      const milestoneNumber = milestone.order_index;
      router.navigate({
        pathname: '/roadmap/phase-milestones-tasks',
        params: {
          milestoneId: milestone.milestone_id,
          phaseId: phase?.phase_id,
          phaseLabel,
          milestoneLabel: String(milestoneNumber),
        },
      });
    },
    [],
  );
  const onCreateRoadmap = async () => {
    try {
      const {
        goal,
        description,
        days,
        completed,
        milestones,
        phases,
        reason,
        type,
      } = roadmap;

      const createdRoadmap = await createRoadmap({
        goal,
        description,
        days,
        completed,
        milestones,
        phases,
        reason,
        type,
      }).unwrap();
      dispatch(setDraftRoadmapAction(createdRoadmap));
      showToast({
        type: 'success',
        message: t('common.created_successfully'),
      });
    } catch (error) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(error),
      });
    }
  };

  const onStartRoadmap = async () => {
    try {
      const finalRoadmap = await startRoadmap(roadmap.roadmap_id).unwrap();
      dispatch(
        setDraftRoadmapAction({
          ...finalRoadmap,
          phases: finalRoadmap?.phases,
        }),
      );
      showToast({
        type: 'success',
        message: t('common.started_successfully'),
      });
      router.replace(`/roadmap/roadmap-execution`);
    } catch (error) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(error),
      });
    }
  };

  const onDeleteRoadmap = async () => {
    try {
      await deleteRoadmap(roadmap.roadmap_id).unwrap();
      dispatch(resetDraftAction());
      showToast({
        type: 'success',
        message: t('common.deleted_successfully'),
      });
      router.replace('/progress');
    } catch (error) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(error),
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const milestones = getAllMilestones(roadmap);
  const hasMilestones = milestones.length > 0;

  const CreateRoadmapButton = () => {
    if (
      roadmap?.type === 'ai_generated' ||
      !!roadmap?.roadmap_id ||
      !hasMilestones
    ) {
      return null;
    }

    return (
      <PrimaryButton
        label="tabs.create_tab.submit_roadmap"
        onPress={onCreateRoadmap}
        shouldShowLoader
        isLoading={isCreatingRoadmap || isStartingRoadmap}
      />
    );
  };

  const StartRoadmapButton = () => {
    if (!hasMilestones) return null;
    if (isRoadmapLoading || isRoadmapStarted(roadmap)) return null;
    if (isRoadmapFetching)
      return (
        <Loader
          marginT-16
          transparent
          containerStyle={{ position: 'relative', marginTop: 16 }}
        />
      );
    return (
      <AppView reanimated entering={Animations.Entry.FadeInDownWithSpring()}>
        <PrimaryButton
          label="common.start_roadmap"
          shouldShowLoader
          isLoading={isStartingRoadmap || isCreatingRoadmap}
          onPress={onStartRoadmap}
        />
      </AppView>
    );
  };

  return (
    <AppScreen safeArea>
      <ScrollView
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <AppView row spread centerV>
          <HeaderWithBack />
          <AppView>
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
          <AppView>
            {!!roadmap?.roadmap_id && (
              <AppButton onPress={() => setIsMenuVisible(true)}>
                <AppIcon set="Feather" name="more-vertical" size={22} />
              </AppButton>
            )}
          </AppView>
        </AppView>
        <Divider />

        <AppView reanimated layout={Animations.Layout.Springify()}>
          {firstTabSelected ? (
            <TodayTab
              roadmap={roadmap}
              currentMilestone={currentMilestone}
              todayTasks={todayTasks}
              isRoadmapFeching={isRoadmapFetching}
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
                roadmapCreateStartControls={
                  <>
                    {isRoadmapFetching &&
                    roadmap.goal &&
                    roadmap?.type !== 'ai_generated' ? (
                      <Loader marginV-16 transparent />
                    ) : (
                      <AppView
                        reanimated
                        entering={Animations.Entry.FadeInDownWithSpring()}
                        exiting={Animations.Exit.FadeOutDown()}>
                        <CreateRoadmapButton />
                        <StartRoadmapButton />
                      </AppView>
                    )}
                  </>
                }
                onOverviewPress={handleOverviewPress}
                onPhasePress={handlePhasePress}
                onMilestonePress={handleMilestonePress}
              />
            </AppView>
          )}
        </AppView>
      </ScrollView>
      <AppActionSheetModal
        options={[
          {
            label: t('roadmap.delete_roadmap_label'),
            onPress: () => {
              setIsMenuVisible(false);
              setTimeout(() => setIsDeleteDialogOpen(true), 400);
            },
            icon: <AppIcon name="delete" color={Colors.error} size={20} />,
          },
        ]}
        title={t('roadmap.options')}
        visible={isMenuVisible}
        onDismiss={() => setIsMenuVisible(false)}
      />
      <ConfirmationDialog
        isDialogOpen={isDeleteDialogOpen}
        title="common.are_you_sure"
        subtitle="common.delete_roadmap"
        onPositivePress={onDeleteRoadmap}
        onNegativePress={() => setIsDeleteDialogOpen(false)}
        onDismiss={() => setIsDeleteDialogOpen(false)}
        negativeText="common.cancel"
        positiveText="common.remove"
        positiveButtonIcon={
          <AppIcon name="delete" color={Colors.textOnPrimary} size={14} />
        }
      />
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
