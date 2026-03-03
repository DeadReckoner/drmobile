import {
  AnchorRequest,
  AnchorRequestResponse,
  MessageResponse,
} from '@/hooks/friends/types/friends.types';
import { api } from '@/store/apis/api';
import { habitsApi } from '@/store/apis/habitsApi';
import { notificationApi } from '@/store/apis/notificationsApi';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { BaseQueryFunctionType } from '@/store/apis/types/api.types';
import { setSetupStepAction } from '@/store/slices/onboardingSlice';
import { TypedMutationOnQueryStarted } from '@reduxjs/toolkit/query';

const onCreateAnchorRequestStarted: TypedMutationOnQueryStarted<
  AnchorRequest,
  { roadmapId: string; anchorId: string },
  BaseQueryFunctionType
> = async (_args, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(
      anchorApi.util.updateQueryData(
        'getMyAnchorRequests',
        undefined,
        (draft) => {
          draft.push(data);
        },
      ),
    );
    dispatch(setSetupStepAction({ key: 'addAnchor', value: true }));
  } catch {}
};

const onCreateHabitAnchorRequestStarted: TypedMutationOnQueryStarted<
  AnchorRequest,
  { habitId: string; anchorId: string },
  BaseQueryFunctionType
> = async (_args, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(
      anchorApi.util.updateQueryData(
        'getMyAnchorRequests',
        undefined,
        (draft) => {
          draft.push(data);
        },
      ),
    );
    dispatch(setSetupStepAction({ key: 'addAnchor', value: true }));
  } catch {}
};

const onAcceptAnchorRequestStarted: TypedMutationOnQueryStarted<
  AnchorRequestResponse,
  string,
  BaseQueryFunctionType
> = async (requestId, { dispatch, queryFulfilled, getState }) => {
  try {
    const state = getState();
    const anchorRequests =
      anchorApi.endpoints.getMyAnchorRequests.select()(state);
    const request = anchorRequests.data?.find(
      (req) => req.request_id === requestId,
    );

    await queryFulfilled;
    dispatch(
      anchorApi.util.updateQueryData(
        'getMyAnchorRequests',
        undefined,
        (draft) => {
          const index = draft.findIndex((req) => req.request_id === requestId);
          if (index !== -1) {
            draft.splice(index, 1);
          }
        },
      ),
    );

    removeFromNotifications(dispatch, requestId);

    if (request?.roadmap_id && request?.requester?.user_id) {
      dispatch(
        roadmapApi.util.updateQueryData(
          'getRoadmapById',
          request.roadmap_id,
          (draft) => {
            draft.anchor_id = request.requester?.user_id;
          },
        ),
      );
    }
  } catch {}
};

const onRejectAnchorRequestStarted: TypedMutationOnQueryStarted<
  AnchorRequestResponse,
  string,
  BaseQueryFunctionType
> = async (requestId, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    dispatch(
      anchorApi.util.updateQueryData(
        'getMyAnchorRequests',
        undefined,
        (draft) => {
          const index = draft.findIndex((req) => req.request_id === requestId);
          if (index !== -1) {
            draft.splice(index, 1);
          }
        },
      ),
    );
    removeFromNotifications(dispatch, requestId);
  } catch {}
};

const onRemoveAnchorStarted: TypedMutationOnQueryStarted<
  MessageResponse,
  string,
  BaseQueryFunctionType
> = async (roadmapId, { dispatch, queryFulfilled }) => {
  const patchResult = dispatch(
    roadmapApi.util.updateQueryData('getRoadmapById', roadmapId, (draft) => {
      draft.anchor_id = '';
    }),
  );

  try {
    await queryFulfilled;
  } catch {
    patchResult.undo();
  }
};

const removeFromNotifications = (dispatch: any, requestId: string) => {
  dispatch(
    notificationApi.util.updateQueryData(
      'getNotifications',
      undefined,
      (draft) => {
        const index = draft.findIndex(
          (n) =>
            (n.type === 'anchor_request' ||
              n.type === 'habit_anchor_request') &&
            n.data.request_id === requestId,
        );
        if (index === -1) return;
        //TODO: re-enable marking as read if backend needs it to remove it from list
        // dispatch(
        //   notificationApi.endpoints.markNotificationAsRead.initiate(
        //     draft[index].notification_id,
        //   ),
        // );
        draft.splice(index, 1);
      },
    ),
  );
};

export const anchorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAnchorRequest: builder.mutation<
      AnchorRequest,
      { roadmapId: string; anchorId: string }
    >({
      query: ({ roadmapId, anchorId }) => ({
        url: `/roadmaps/${roadmapId}/anchor-request`,
        method: 'POST',
        body: { anchor_id: anchorId },
      }),
      onQueryStarted: onCreateAnchorRequestStarted,
    }),

    getMyAnchorRequests: builder.query<AnchorRequest[], void>({
      query: () => ({
        url: '/anchor-requests',
        method: 'GET',
      }),
      providesTags: ['AnchorRequests'],
      keepUnusedDataFor: 900,
    }),

    acceptAnchorRequest: builder.mutation<AnchorRequestResponse, string>({
      query: (requestId) => ({
        url: `/anchor-requests/${requestId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['AnchorRequests', 'Friends', 'Threads'],
      onQueryStarted: onAcceptAnchorRequestStarted,
    }),

    rejectAnchorRequest: builder.mutation<AnchorRequestResponse, string>({
      query: (requestId) => ({
        url: `/anchor-requests/${requestId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['AnchorRequests'],
      onQueryStarted: onRejectAnchorRequestStarted,
    }),

    removeAnchor: builder.mutation<MessageResponse, string>({
      query: (roadmapId) => ({
        url: `/roadmaps/${roadmapId}/anchor`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, roadmapId) => [
        'Roadmaps',
        { type: 'Roadmaps', id: roadmapId },
      ],
      onQueryStarted: onRemoveAnchorStarted,
    }),

    createHabitAnchorRequest: builder.mutation<
      AnchorRequest,
      { habitId: string; anchorId: string }
    >({
      query: ({ habitId, anchorId }) => ({
        url: `/habits/${habitId}/anchor-request`,
        method: 'POST',
        body: { anchor_id: anchorId },
      }),
      onQueryStarted: onCreateHabitAnchorRequestStarted,
    }),

    removeHabitAnchor: builder.mutation<MessageResponse, string>({
      query: (habitId) => ({
        url: `/habits/${habitId}/anchor`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, habitId) => [
        'Habits',
        { type: 'Habits', id: habitId },
      ],
      onQueryStarted: async (habitId, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          habitsApi.util.updateQueryData('getHabit', habitId, (draft) => {
            draft.anchor_id = '';
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateAnchorRequestMutation,
  useGetMyAnchorRequestsQuery,
  useAcceptAnchorRequestMutation,
  useRejectAnchorRequestMutation,
  useRemoveAnchorMutation,
  useCreateHabitAnchorRequestMutation,
  useRemoveHabitAnchorMutation,
} = anchorApi;
