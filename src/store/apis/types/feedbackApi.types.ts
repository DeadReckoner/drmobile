export type FeedbackCategoryType = 'bug' | 'feature' | 'general';

export interface SubmitFeedbackParamsType {
  category: FeedbackCategoryType;
  message: string;
  app_version?: string;
  os?: string;
  device?: string;
}

export interface FeedbackResponseDataType {
  feedback_id: string;
  user_id: string;
  category: FeedbackCategoryType;
  message: string;
  app_version?: string;
  os?: string;
  device?: string;
  created_at: string;
}

export interface SubmitFeedbackResponseType {
  data: FeedbackResponseDataType;
}
