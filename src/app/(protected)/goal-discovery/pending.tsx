import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import {
  GoalDiscoveryFailure,
  GoalDiscoveryPending,
} from '@/components/goal-discovery/GoalDiscoveryPending';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useGetJobStatusQuery } from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  completeRoadmapCreationAction,
  resetCreationStateAction,
  selectAIRoadmapCreationStatus,
  selectCreatedRoadmap,
  setCreationErrorAction,
} from '@/store/slices/aiRoadmapCreationSlice';
import {
  resetGoalDiscoveryAction,
  selectGoalDiscoveryDraft,
} from '@/store/slices/goalDiscoverySlice';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { AppState, AppStateStatus, ScrollView } from 'react-native';

/**
 * The Goal Discovery pending state for the FINAL roadmap.
 *
 * Goal discovery hands its roadmap job to the shared aiRoadmapCreation slice so
 * it inherits the existing polling, websocket reconnect, app-resume refetch and
 * completion handling. What it must NOT inherit is the chat screen: this is
 * where a goal-discovery user waits, instead of being dropped into a
 * conversation they never had.
 *
 * This screen owns no job logic of its own. It renders the shared slice's state
 * and, on completion, forwards to the SAME roadmap destination the chat flow
 * uses — the result of a goal discovery roadmap is an ordinary roadmap.
 */
const GoalDiscoveryRoadmapPending = () => {
  const dispatch = useAppDispatch();
  const { t } = useLocalization();
  const draft = useAppSelector(selectGoalDiscoveryDraft);
  const status = useAppSelector(selectAIRoadmapCreationStatus);
  const createdRoadmap = useAppSelector(selectCreatedRoadmap);

  const isCompleted = status === 'completed' && Boolean(createdRoadmap);
  const isFailed = status === 'error';

  /**
   * Poll the roadmap job from THIS screen.
   *
   * The Progress-tab banner does the same polling, but it is only mounted on
   * that tab — a user sitting here would otherwise watch a spinner that never
   * resolves, because nothing was advancing the shared creation slice. The two
   * pollers are safe together: RTK Query dedupes the request, and both funnel
   * into the same completion action.
   */
  const { data: jobStatus, refetch } = useGetJobStatusQuery(
    { jobId: draft.roadmapJobId ?? '' },
    {
      skip: !draft.roadmapJobId || status === 'completed' || status === 'error',
      pollingInterval: 4000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    },
  );

  useEffect(() => {
    if (!jobStatus?.job_id) return;
    // Only act on the job this draft is actually waiting for.
    if (jobStatus.job_id !== draft.roadmapJobId) return;

    if (jobStatus.status === 'failed') {
      dispatch(setCreationErrorAction(t('common.something_went_wrong')));
      return;
    }
    if (jobStatus.status === 'completed' && jobStatus.result?.roadmap_id) {
      const roadmap = {
        roadmap_id: jobStatus.result.roadmap_id,
        goal: '',
        description: '',
        days: 0,
        completed: false,
        start_date: '',
        milestones: [],
        reason: '',
      };
      dispatch(setDraftRoadmapAction(roadmap));
      dispatch(completeRoadmapCreationAction(roadmap));
    }
  }, [jobStatus, draft.roadmapJobId, dispatch, t]);

  // Returning from the background re-checks at once rather than waiting for the
  // next tick, so a roadmap that finished while away is not still "building".
  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === 'active' && draft.roadmapJobId) void refetch();
    };
    const subscription = AppState.addEventListener('change', onChange);
    return () => subscription.remove();
  }, [draft.roadmapJobId, refetch]);

  /**
   * Completion hands off to the existing roadmap destination rather than
   * rendering a result here. The banner may already have done this if the user
   * was on the Progress tab when the job finished; navigating again from the
   * same completed state is harmless and keeps the two entry points consistent.
   */
  useEffect(() => {
    if (!isCompleted || !createdRoadmap) return;

    dispatch(setDraftRoadmapAction(createdRoadmap));
    dispatch(resetCreationStateAction());
    dispatch(
      roadmapApi.endpoints.getRoadmaps.initiate(undefined, {
        forceRefetch: true,
      }),
    );
    router.replace('/roadmap/roadmap-execution');
  }, [isCompleted, createdRoadmap, dispatch]);

  /**
   * A failed roadmap generation leaves the user's stage-2 answers intact, so
   * the way back is the form they already filled in — not the start of the
   * flow, and never the chat screen.
   */
  const onRetry = () => {
    router.replace('/goal-discovery/roadmap-details');
  };

  const onStartOver = () => {
    dispatch(resetGoalDiscoveryAction());
    dispatch(resetCreationStateAction());
    router.replace('/goal-discovery');
  };

  return (
    <AppScreen safeArea>
      <AppView paddingT-8>
        <HeaderWithBack headerKey="goal_discovery.roadmap_pending.header" />
      </AppView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="always">
        <Divider />
        {!!draft.stage2?.selectedGoal && (
          <>
            <TranslatedText
              xsm
              translationKey="goal_discovery.roadmap_pending.goal_label"
            />
            <AppText body2 marginT-4 textColor>
              {draft.stage2.selectedGoal}
            </AppText>
            <Divider />
          </>
        )}

        {isFailed ? (
          <GoalDiscoveryFailure
            titleKey="goal_discovery.roadmap_pending.failed_title"
            bodyKey="goal_discovery.roadmap_pending.failed_body"
            retryKey="goal_discovery.roadmap_pending.retry"
            onRetry={onRetry}
            secondaryKey="goal_discovery.start_over_confirm"
            onSecondary={onStartOver}
          />
        ) : (
          <GoalDiscoveryPending
            titleKey="goal_discovery.roadmap_pending.title"
            bodyKey="goal_discovery.roadmap_pending.body"
            hintKey="goal_discovery.roadmap_pending.leave_hint"
          />
        )}
        <Divider margin-24 />
      </ScrollView>
    </AppScreen>
  );
};

export default GoalDiscoveryRoadmapPending;
