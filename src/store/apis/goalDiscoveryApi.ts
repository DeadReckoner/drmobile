import {
  GoalDiscoveryAnswersPayload,
  GoalDiscoveryRoadmapJobResponse,
  GoalDiscoveryRoadmapPayload,
  GoalOptionsJobResponse,
  GoalOptionsJobStatusResponse,
} from '@/hooks/goalDiscovery/goalDiscovery.types';
import { api } from '@/store/apis/api';
import { DateUtils } from '@/utils/date.utils';

/**
 * Goal Discovery endpoints.
 *
 * Status polling deliberately reuses the shared /jobs/:jobid/status endpoint
 * that AI roadmap generation already uses — goal discovery adds a job type, not
 * a second job system.
 */

/** Header carrying the device's local calendar date. */
const CLIENT_DATE_HEADER = 'X-Client-Date';

/**
 * The server validates "is this deadline in the future?" against this date so
 * the answer is decided in the user's timezone rather than UTC. Without it a
 * user west of UTC choosing tomorrow late in the evening would be told their
 * date is in the past.
 */
const clientDateHeaders = () => ({
  [CLIENT_DATE_HEADER]: DateUtils.formatDate(new Date(), 'YYYY-MM-DD'),
});

export interface CreateGoalOptionsArgs {
  answers: GoalDiscoveryAnswersPayload;
  /** Set on regeneration; the server reads the rejected titles from this job. */
  previousJobId?: string;
  idempotencyKey: string;
}

export const goalDiscoveryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createGoalOptions: builder.mutation<
      GoalOptionsJobResponse,
      CreateGoalOptionsArgs
    >({
      query: ({ answers, previousJobId, idempotencyKey }) => ({
        url: '/agent/goal-discovery/options',
        method: 'POST',
        body: {
          answers,
          previous_job_id: previousJobId,
          idempotency_key: idempotencyKey,
        },
      }),
    }),

    getGoalOptionsJobStatus: builder.query<
      GoalOptionsJobStatusResponse,
      { jobId: string }
    >({
      query: ({ jobId }) => ({
        url: `/jobs/${jobId}/status`,
        method: 'GET',
      }),
    }),

    createGoalDiscoveryRoadmap: builder.mutation<
      GoalDiscoveryRoadmapJobResponse,
      GoalDiscoveryRoadmapPayload
    >({
      query: (payload) => ({
        url: '/agent/goal-discovery/roadmap',
        method: 'POST',
        body: payload,
        headers: clientDateHeaders(),
      }),
    }),
  }),
  overrideExisting: false,
});
