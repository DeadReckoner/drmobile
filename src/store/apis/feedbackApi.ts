import { api } from '@/store/apis/api';
import {
  SubmitFeedbackParamsType,
  SubmitFeedbackResponseType,
} from '@/store/apis/types/feedbackApi.types';

export const feedbackApi = api.injectEndpoints({
  endpoints: (builder) => ({
    submitFeedback: builder.mutation<
      SubmitFeedbackResponseType,
      SubmitFeedbackParamsType
    >({
      query: (feedback) => ({
        url: '/feedback',
        method: 'POST',
        body: feedback,
      }),
    }),
  }),
  overrideExisting: true,
});

export const { useSubmitFeedbackMutation } = feedbackApi;
