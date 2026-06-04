import { Env } from '@/constants/Env';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { api } from '@/store/apis/api';
import {
  BaseQueryFunctionType,
  RealignRoadmapResponse,
} from '@/store/apis/types/api.types';
import { setSetupStepAction } from '@/store/slices/onboardingSlice';
import {
  resetDraftAction,
  setDraftRoadmapAction,
} from '@/store/slices/roadmapDraftSlice';
import { RootStateType } from '@/store/types/store.types';
import {
  structureRoadmapApiPayload,
  transformRoadmap,
} from '@/utils/roadmap.utils';
import { current } from '@reduxjs/toolkit';
import { TypedMutationOnQueryStarted } from '@reduxjs/toolkit/query';

const onCreateRoadmapQueryStarted: TypedMutationOnQueryStarted<
  RoadmapType,
  RoadmapType,
  BaseQueryFunctionType
> = async (_roadmap, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        draft.push(data);
      }),
    );
    dispatch(setSetupStepAction({ key: 'createOrReviewRoadmap', value: true }));
  } catch {}
};

const onUpdateRoadmapQueryStarted: TypedMutationOnQueryStarted<
  RoadmapType,
  RoadmapType,
  BaseQueryFunctionType
> = async (roadmap, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const roadmapIdx = draft.findIndex(
          (r) => r.roadmap_id === roadmap.roadmap_id,
        );

        if (roadmapIdx !== -1) {
          draft[roadmapIdx] = data;
        }
      }),
    );

    if (roadmap.roadmap_id) {
      dispatch(
        roadmapApi.util.updateQueryData(
          'getRoadmapById',
          roadmap.roadmap_id,
          (draft) => {
            Object.assign(draft, data);
          },
        ),
      );
    }

    dispatch(setDraftRoadmapAction(data));
  } catch {}
};

const onDeleteRoadmapQueryStarted: TypedMutationOnQueryStarted<
  string,
  string,
  BaseQueryFunctionType
> = async (roadmap_id, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const idx = draft.findIndex((r) => r.roadmap_id === roadmap_id);
        if (idx !== -1) {
          draft.splice(idx, 1);
        }
      }),
    );

    dispatch(
      roadmapApi.util.invalidateTags([
        { type: 'Roadmaps', id: roadmap_id },
        'Tasks',
      ]),
    );

    dispatch(resetDraftAction());
  } catch {}
};

const onArchiveRoadmapQueryStarted: TypedMutationOnQueryStarted<
  { message: string },
  string,
  BaseQueryFunctionType
> = async (roadmap_id, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    let archivedRoadmap: RoadmapType | null = null;

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const idx = draft.findIndex((r) => r.roadmap_id === roadmap_id);
        if (idx !== -1) {
          archivedRoadmap = current(draft[idx]);
          draft.splice(idx, 1);
        }
      }),
    );

    dispatch(
      roadmapApi.util.updateQueryData(
        'getRoadmaps',
        { include_archived: true },
        (draft) => {
          if (archivedRoadmap) {
            draft.unshift({ ...archivedRoadmap, archived: true });
          }
        },
      ),
    );

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmapById', roadmap_id, (draft) => {
        draft.archived = true;
      }),
    );
  } catch {}
};

const onRestoreRoadmapQueryStarted: TypedMutationOnQueryStarted<
  RoadmapType,
  { roadmap_id: string; start_from_today?: boolean },
  BaseQueryFunctionType
> = async ({ roadmap_id }, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        draft.push(data);
      }),
    );
    dispatch(
      roadmapApi.util.updateQueryData(
        'getRoadmaps',
        { include_archived: true },
        (draft) => {
          const idx = draft.findIndex((r) => r.roadmap_id === roadmap_id);
          if (idx !== -1) draft.splice(idx, 1);
        },
      ),
    );
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmapById', roadmap_id, (draft) => {
        Object.assign(draft, data);
      }),
    );
  } catch {}
};

const onStartRoadmapQueryStarted: TypedMutationOnQueryStarted<
  RoadmapType,
  string,
  BaseQueryFunctionType
> = async (roadmap_id, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const idx = draft.findIndex((r) => r.roadmap_id === roadmap_id);
        if (idx !== -1) {
          draft[idx] = data;
        }
      }),
    );

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmapById', roadmap_id, (draft) => {
        Object.assign(draft, data);
      }),
    );
  } catch {}
};

const onPauseRoadmapQueryStarted: TypedMutationOnQueryStarted<
  { message: string },
  string,
  BaseQueryFunctionType
> = async (roadmap_id, { dispatch, queryFulfilled, getState }) => {
  try {
    await queryFulfilled;
    const pausedAt = new Date().toISOString();

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const idx = draft.findIndex((r) => r.roadmap_id === roadmap_id);
        if (idx !== -1) {
          draft[idx] = { ...draft[idx], paused_at: pausedAt };
        }
      }),
    );

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmapById', roadmap_id, (draft) => {
        draft.paused_at = pausedAt;
      }),
    );

    const currentDraftRoadmap = (getState() as unknown as RootStateType)
      .roadmapDraft.roadmap;
    if (currentDraftRoadmap?.roadmap_id === roadmap_id) {
      dispatch(
        setDraftRoadmapAction({ ...currentDraftRoadmap, paused_at: pausedAt }),
      );
    }
  } catch {}
};

const onResumeRoadmapQueryStarted: TypedMutationOnQueryStarted<
  RoadmapType,
  string,
  BaseQueryFunctionType
> = async (roadmap_id, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const idx = draft.findIndex((r) => r.roadmap_id === roadmap_id);
        if (idx !== -1) {
          draft[idx] = data;
        }
      }),
    );

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmapById', roadmap_id, (draft) => {
        Object.assign(draft, data);
        draft.paused_at = null;
      }),
    );

    dispatch(setDraftRoadmapAction({ ...data, paused_at: null }));
  } catch {}
};

const onRestartRoadmapQueryStarted: TypedMutationOnQueryStarted<
  RoadmapType,
  string,
  BaseQueryFunctionType
> = async (roadmap_id, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const idx = draft.findIndex((r) => r.roadmap_id === roadmap_id);
        if (idx !== -1) {
          draft[idx] = data;
        }
      }),
    );

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmapById', roadmap_id, (draft) => {
        Object.assign(draft, data);
      }),
    );

    dispatch(setDraftRoadmapAction(data));
    dispatch(roadmapApi.util.invalidateTags(['Tasks']));
  } catch {}
};

const onShiftRoadmapDatesQueryStarted: TypedMutationOnQueryStarted<
  RoadmapType,
  { roadmap_id: string; days: number },
  BaseQueryFunctionType
> = async ({ roadmap_id }, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const idx = draft.findIndex((r) => r.roadmap_id === roadmap_id);
        if (idx !== -1) {
          draft[idx] = data;
        }
      }),
    );

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmapById', roadmap_id, (draft) => {
        Object.assign(draft, data);
      }),
    );

    dispatch(setDraftRoadmapAction(data));
  } catch {}
};

const onRealignRoadmapDatesQueryStarted: TypedMutationOnQueryStarted<
  RealignRoadmapResponse,
  { roadmap_id: string; offset_days?: number },
  BaseQueryFunctionType
> = async ({ roadmap_id }, { dispatch, queryFulfilled }) => {
  try {
    const response = await queryFulfilled;
    const roadmap = response.data.roadmap;

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const idx = draft.findIndex((r) => r.roadmap_id === roadmap_id);
        if (idx !== -1) {
          draft[idx] = roadmap;
        }
      }),
    );

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmapById', roadmap_id, (draft) => {
        Object.assign(draft, roadmap);
      }),
    );

    dispatch(setDraftRoadmapAction(roadmap));
  } catch {}
};

const onGenerateShareLinkQueryStarted: TypedMutationOnQueryStarted<
  { share_token: string },
  string,
  BaseQueryFunctionType
> = async (roadmap_id, { dispatch, queryFulfilled, getState }) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const idx = draft.findIndex((r) => r.roadmap_id === roadmap_id);
        if (idx !== -1) {
          draft[idx] = { ...draft[idx], share_token: data.share_token };
        }
      }),
    );
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmapById', roadmap_id, (draft) => {
        draft.share_token = data.share_token;
      }),
    );

    const currentDraftRoadmap = (getState() as unknown as RootStateType)
      .roadmapDraft.roadmap;
    if (currentDraftRoadmap?.roadmap_id === roadmap_id) {
      dispatch(
        setDraftRoadmapAction({
          ...currentDraftRoadmap,
          share_token: data.share_token,
        }),
      );
    }
  } catch {}
};

const onRevokeShareLinkQueryStarted: TypedMutationOnQueryStarted<
  { message: string },
  string,
  BaseQueryFunctionType
> = async (roadmap_id, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const idx = draft.findIndex((r) => r.roadmap_id === roadmap_id);
        if (idx !== -1) {
          draft[idx] = { ...draft[idx], share_token: null };
        }
      }),
    );
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmapById', roadmap_id, (draft) => {
        draft.share_token = null;
      }),
    );
  } catch {}
};

const onCopySharedRoadmapQueryStarted: TypedMutationOnQueryStarted<
  RoadmapType,
  string,
  BaseQueryFunctionType
> = async (_share_token, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        draft.push(data);
      }),
    );
  } catch {}
};

export const roadmapApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRoadmaps: builder.query<
      RoadmapType[],
      { include_archived?: boolean } | void
    >({
      query: ({ include_archived = false } = {}) =>
        `/roadmaps?include_archived=${include_archived}`,

      providesTags: ['Roadmaps'],
      transformResponse: (roadmaps: RoadmapType[]) => {
        try {
          return roadmaps.map(transformRoadmap);
        } catch {
          return roadmaps;
        }
      },
      onQueryStarted: async (_arg, { dispatch, queryFulfilled, getState }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.length > 0) {
            const currentDraftRoadmap = (getState() as RootStateType)
              .roadmapDraft.roadmap;
            const roadmap = data.find(
              (r) => r.roadmap_id === currentDraftRoadmap?.roadmap_id,
            );
            if (roadmap) {
              dispatch(setDraftRoadmapAction(roadmap));
            }
          }
        } catch {}
      },
    }),
    createRoadmap: builder.mutation<RoadmapType, Partial<RoadmapType>>({
      query: (roadmap) => {
        return {
          url: `/roadmaps`,
          method: 'POST',
          body: structureRoadmapApiPayload(roadmap),
        };
      },
      onQueryStarted: onCreateRoadmapQueryStarted,
    }),
    updateRoadmap: builder.mutation<
      RoadmapType,
      Partial<RoadmapType> & { roadmap_id: string }
    >({
      query: ({ roadmap_id, ...roadmap }) => {
        return {
          url: `/roadmaps/${roadmap_id}`,
          method: 'PATCH',
          body: roadmap,
        };
      },
      onQueryStarted: onUpdateRoadmapQueryStarted,
    }),
    deleteRoadmap: builder.mutation<string, string>({
      query: (roadmap_id) => {
        return {
          url: `/roadmaps/${roadmap_id}`,
          method: 'DELETE',
        };
      },
      onQueryStarted: onDeleteRoadmapQueryStarted,
    }),
    startRoadmap: builder.mutation<RoadmapType, string>({
      query: (roadmap_id) => {
        return {
          url: `/roadmaps/${roadmap_id}/start`,
          method: 'PUT',
        };
      },
      onQueryStarted: onStartRoadmapQueryStarted,
    }),

    getRoadmapById: builder.query<RoadmapType, string>({
      query: (roadmap_id) => `/roadmaps/${roadmap_id}`,
      transformResponse: (roadmap: RoadmapType) => {
        try {
          return transformRoadmap(roadmap);
        } catch {
          return roadmap;
        }
      },
      providesTags: (_result, _error, roadmap_id) => [
        { type: 'Roadmaps', id: roadmap_id },
      ],
    }),

    //TODO: This is a temporary endpoint to fetch anchor roadmaps.
    // We should remove this once we have a proper implementation for anchor roadmaps.
    getAnchorRoadmaps: builder.query<RoadmapType[], void>({
      query: () => '/roadmaps/anchored',
      providesTags: ['Roadmaps'],
    }),

    nudgeRoadmap: builder.mutation<unknown, { roadmapId: string }>({
      query: ({ roadmapId }) => ({
        url: `/roadmaps/${roadmapId}/nudge`,
        method: 'POST',
      }),
    }),

    archiveRoadmap: builder.mutation<{ message: string }, string>({
      query: (roadmap_id) => ({
        url: `/roadmaps/${roadmap_id}/archive`,
        method: 'POST',
      }),
      onQueryStarted: onArchiveRoadmapQueryStarted,
    }),

    restoreRoadmap: builder.mutation<
      RoadmapType,
      { roadmap_id: string; start_from_today?: boolean }
    >({
      query: ({ roadmap_id, start_from_today }) => ({
        url: `/roadmaps/${roadmap_id}/restore`,
        method: 'POST',
        body: start_from_today !== undefined ? { start_from_today } : undefined,
      }),
      onQueryStarted: onRestoreRoadmapQueryStarted,
    }),

    pauseRoadmap: builder.mutation<{ message: string }, string>({
      query: (roadmap_id) => ({
        url: `/roadmaps/${roadmap_id}/pause`,
        method: 'POST',
      }),
      onQueryStarted: onPauseRoadmapQueryStarted,
    }),

    resumeRoadmap: builder.mutation<RoadmapType, string>({
      query: (roadmap_id) => ({
        url: `/roadmaps/${roadmap_id}/resume`,
        method: 'POST',
      }),
      onQueryStarted: onResumeRoadmapQueryStarted,
    }),

    restartRoadmap: builder.mutation<RoadmapType, string>({
      query: (roadmap_id) => ({
        url: `/roadmaps/${roadmap_id}/restart`,
        method: 'PUT',
      }),
      onQueryStarted: onRestartRoadmapQueryStarted,
    }),

    shiftRoadmapDates: builder.mutation<
      RoadmapType,
      { roadmap_id: string; days: number }
    >({
      query: ({ roadmap_id, days }) => ({
        url: `/roadmaps/${roadmap_id}/shift`,
        method: 'POST',
        body: { days },
      }),
      onQueryStarted: onShiftRoadmapDatesQueryStarted,
    }),

    realignRoadmapDates: builder.mutation<
      RealignRoadmapResponse,
      { roadmap_id: string; offset_days?: number }
    >({
      query: ({ roadmap_id, offset_days }) => ({
        url: `/roadmaps/${roadmap_id}/realign`,
        method: 'POST',
        body: { offset_days: offset_days ?? 0 },
      }),
      onQueryStarted: onRealignRoadmapDatesQueryStarted,
    }),

    generateShareLink: builder.mutation<{ share_token: string }, string>({
      query: (roadmap_id) => ({
        url: `/roadmaps/${roadmap_id}/share`,
        method: 'POST',
      }),
      onQueryStarted: onGenerateShareLinkQueryStarted,
    }),

    revokeShareLink: builder.mutation<{ message: string }, string>({
      query: (roadmap_id) => ({
        url: `/roadmaps/${roadmap_id}/share`,
        method: 'DELETE',
      }),
      onQueryStarted: onRevokeShareLinkQueryStarted,
    }),

    getSharedRoadmap: builder.query<RoadmapType, string>({
      queryFn: async (share_token) => {
        try {
          const response = await fetch(
            `${Env.EXPO_PUBLIC_API_URL}/api/v1/roadmaps/shared/${share_token}`,
          );
          if (!response.ok) {
            const errorData: unknown = await response.json().catch(() => ({}));
            return { error: { status: response.status, data: errorData } };
          }
          const data: RoadmapType = await response.json();
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      keepUnusedDataFor: 3600,
    }),

    copySharedRoadmap: builder.mutation<RoadmapType, string>({
      query: (share_token) => ({
        url: `/roadmaps/shared/${share_token}/copy`,
        method: 'POST',
      }),
      onQueryStarted: onCopySharedRoadmapQueryStarted,
    }),
  }),
  overrideExisting: true,
});
