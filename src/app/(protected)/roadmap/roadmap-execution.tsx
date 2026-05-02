import { AppActionSheetModal } from '@/components/AppActionSheetModal';
import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { AppSegmentControl } from '@/components/AppSegmentControl';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AnchorCard } from '@/components/roadmap/AnchorCard';
import { AnchorSelectionModal } from '@/components/roadmap/AnchorSelectionModal';
import { BadgeInfoContent } from '@/components/roadmap/BadgeInfoContent';
import { RoadmapCurrentStateOverview } from '@/components/roadmap/RoadmapCurrentStateOverview';
import { RoadmapHighlightOverlay } from '@/components/roadmap/RoadmapHighlightOverlay';
import { RoadmapIntroContent } from '@/components/roadmap/RoadmapIntroContent';
import { TodayTab } from '@/components/roadmap/TodayTab';
import { AppView } from '@/components/ui';
import {
  useCreateRoadmapMutation,
  useDeleteRoadmapMutation,
  useGetRoadmapByIdQuery,
  useStartRoadmapMutation,
} from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { useRoadmapHighlightController } from '@/hooks/useRoadmapHighlightController';
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
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const RoadmapExecution = () => {
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const draftRoadmap = useAppSelector(selectDraftRoadmap);
  const currentMilestone = useAppSelector(selectCurrentMilestone);
  const isCustomRoadmap = draftRoadmap?.type === 'custom_made';
  const {
    data,
    isLoading: isRoadmapLoading,
    isFetching: isRoadmapFetching,
    refetch,
  } = useGetRoadmapByIdQuery(draftRoadmap?.roadmap_id ?? '', {
    skip: !draftRoadmap?.roadmap_id,
    refetchOnMountOrArgChange: true,
  });
  const {
    isVisible: isHighlightVisible,
    currentStep,
    steps: highlightSteps,
    totalSteps,
    hasSeenHighlight,
    isPendingHighlightStart,
    startHighlight,
    moveNext,
    scrollViewRef,
    scrollContentRef,
    highlightFrame,
    handleTargetLayout,
    onScrollEnd,
  } = useRoadmapHighlightController(
    isCustomRoadmap,
    isRoadmapLoading || isRoadmapFetching,
  );
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAnchorModalVisible, setIsAnchorModalVisible] = useState(false);

  useEffect(() => {
    if (!isHighlightVisible) {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }
  }, [isHighlightVisible, scrollViewRef]);

  const stepContentOverrides = useMemo<Record<number, React.ReactNode>>(
    () =>
      isCustomRoadmap
        ? {
            0: <RoadmapIntroContent />,
            2: <BadgeInfoContent />,
          }
        : {
            0: <RoadmapIntroContent />,
            2: <BadgeInfoContent showPhase />,
            3: <BadgeInfoContent />,
          },
    [isCustomRoadmap],
  );

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

  const onManuallyRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch().unwrap();
    } catch {
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const onRoadmapOverviewCardPress = useCallback(() => {
    setFirstTabSelected(false);
  }, []);

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
      } else {
        showToast({
          type: 'warning',
          message: t('ai_roadmap.no_active_phase_description'),
        });
      }
    },
    [roadmap.type, showToast, t],
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
          milestone: JSON.stringify(milestone),
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
      <AppView marginT-16>
        <PrimaryButton
          label="tabs.create_tab.submit_roadmap"
          onPress={onCreateRoadmap}
          shouldShowLoader
          isLoading={isCreatingRoadmap || isStartingRoadmap}
        />
      </AppView>
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
      <AppView
        marginT-16
        reanimated
        entering={Animations.Entry.FadeInDownWithSpring()}>
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
      {!hasSeenHighlight && isPendingHighlightStart && <Loader />}

      <ScrollView
        pointerEvents={
          !(!hasSeenHighlight && isPendingHighlightStart) ? 'auto' : 'none'
        }
        ref={scrollViewRef}
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: isHighlightVisible ? 400 : 60 },
        ]}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
        refreshControl={
          <RefreshControl
            refreshing={
              hasSeenHighlight ? isRoadmapFetching || isRefreshing : false
            }
            onRefresh={onManuallyRefresh}
          />
        }>
        <View ref={scrollContentRef} collapsable={false}>
          <AppView row spread centerV>
            <HeaderWithBack />
            <AppView>
              {!!roadmap?.roadmap_id && (
                <AppButton onPress={() => setIsMenuVisible(true)}>
                  <AppIcon set="Feather" name="more-vertical" size={22} />
                </AppButton>
              )}
            </AppView>
          </AppView>
          <Divider />
          <AppSegmentControl
            segments={[t('tabs.today'), t('settings.roadmaps').slice(0, 7)]}
            selectedIndex={firstTabSelected ? 0 : 1}
            onSegmentChange={(index) => setFirstTabSelected(index === 0)}
          />

          <AppView reanimated layout={Animations.Layout.Springify()}>
            {firstTabSelected ? (
              <>
                <Divider />
                <TodayTab
                  roadmap={roadmap}
                  currentMilestone={currentMilestone}
                  todayTasks={todayTasks}
                  onRoadmapOverviewCardPress={onRoadmapOverviewCardPress}
                />
              </>
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
                  onOverviewCardRef={(ref) => handleTargetLayout(0, ref)}
                  onPhaseCardRef={(ref) => handleTargetLayout(2, ref)}
                  onMilestoneCardRef={(ref) => handleTargetLayout(3, ref)}
                  roadmapCreateStartControls={
                    <>
                      <AppView
                        reanimated
                        entering={Animations.Entry.FadeInDownWithSpring()}
                        exiting={Animations.Exit.FadeOutDown()}>
                        <CreateRoadmapButton />
                        <StartRoadmapButton />
                      </AppView>
                      <Divider />
                      <View
                        onLayout={() => startHighlight()}
                        ref={(ref) => handleTargetLayout(1, ref)}>
                        <AnchorCard
                          onAddAnchor={() => setIsAnchorModalVisible(true)}
                          onManageAnchor={() => setIsAnchorModalVisible(true)}
                          anchorName={roadmap?.anchor?.name}
                        />
                      </View>
                    </>
                  }
                  onOverviewPress={handleOverviewPress}
                  onPhasePress={handlePhasePress}
                  onMilestonePress={handleMilestonePress}
                />
              </AppView>
            )}
          </AppView>
        </View>
      </ScrollView>

      <RoadmapHighlightOverlay
        visible={isHighlightVisible}
        currentStep={currentStep}
        totalSteps={totalSteps}
        steps={highlightSteps}
        contentOverrides={stepContentOverrides}
        highlightFrame={highlightFrame}
        nextLabel={t('feature_highlight.next')}
        doneLabel={t('feature_highlight.got_it')}
        onNext={moveNext}
      />

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
      <AnchorSelectionModal
        isLoading={isRoadmapLoading || isRoadmapFetching}
        roadmapId={roadmap?.roadmap_id || draftRoadmap?.roadmap_id}
        isAnchorSheetVisible={isAnchorModalVisible}
        setIsAnchorSheetVisible={setIsAnchorModalVisible}
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
  highlightLoader: {
    ...StyleSheet.absoluteFill,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
