import {
  activeOptionsJobId,
  isJobGoneError,
  isStatusForActiveJob,
  shouldPollOptions,
} from '@/hooks/goalDiscovery/draft';
import { useGetGoalOptionsJobStatusQuery } from '@/hooks/goalDiscovery';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  goalOptionsCompletedAction,
  goalOptionsFailedAction,
  selectGoalDiscoveryDraft,
  setGoalOptionsJobStatusAction,
} from '@/store/slices/goalDiscoverySlice';
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Keeps the persisted draft in sync with a goal-options job.
 *
 * Polls the shared /jobs/:jobid/status endpoint, mirroring what the AI roadmap
 * banner already does. Deliberate properties:
 *
 *   - It only READS. A failed poll never starts a new generation, so a flaky
 *     network cannot turn one job into several.
 *   - It resumes from stored state, so leaving the screen or restarting the app
 *     picks the same job back up, including one that finished while away.
 *   - It stops as soon as the job settles.
 */
export const useGoalOptionsJob = () => {
  const dispatch = useAppDispatch();
  const draft = useAppSelector(selectGoalDiscoveryDraft);

  const jobId = activeOptionsJobId(draft);
  const isPolling = shouldPollOptions(draft);

  const { data, refetch, isError, error } = useGetGoalOptionsJobStatusQuery(
    { jobId: jobId ?? '' },
    {
      skip: !jobId || !isPolling,
      // 4s is a compromise: fast enough that a finished job appears promptly,
      // slow enough that a couple of minutes of generation is not hundreds of
      // requests.
      pollingInterval: 4000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    },
  );

  // A job the server no longer knows about is never coming back, so waiting on
  // it forever is the one outcome the pending state must not have. Treat it as a
  // terminal failure, which surfaces the recovery card (retry / edit answers)
  // with the user's answers still intact.
  const isJobGone = isError && isJobGoneError(error);

  useEffect(() => {
    if (isJobGone && isPolling) {
      dispatch(goalOptionsFailedAction());
    }
  }, [isJobGone, isPolling, dispatch]);

  useEffect(() => {
    if (!data?.job_id || !isPolling) return;

    // Only act on a status for the job actually being watched — see
    // isStatusForActiveJob for why a stale response can otherwise arrive here.
    if (!isStatusForActiveJob(jobId, data.job_id)) return;

    if (data.status === 'completed') {
      dispatch(
        goalOptionsCompletedAction({
          options: data.result?.options ?? [],
          safetyMessage: data.result?.safety?.blocked
            ? (data.result.safety.message ?? null)
            : null,
        }),
      );
      return;
    }

    if (data.status === 'failed') {
      dispatch(goalOptionsFailedAction());
      return;
    }

    dispatch(setGoalOptionsJobStatusAction(data.status));
  }, [data, dispatch, isPolling, jobId]);

  // Coming back from the background re-checks immediately rather than waiting
  // for the next poll tick, so a job that finished while away shows up at once.
  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === 'active' && jobId && isPolling) {
        void refetch();
      }
    };
    const subscription = AppState.addEventListener('change', onChange);
    return () => subscription.remove();
  }, [jobId, isPolling, refetch]);

  return {
    isPolling,
    /**
     * A transient polling error is NOT a generation failure — the job may well
     * be running fine. Callers surface it as "we lost contact", never by
     * starting again. A vanished job (404) is handled above instead.
     */
    hasPollingError: isError && !isJobGone,
    refetch,
  };
};
