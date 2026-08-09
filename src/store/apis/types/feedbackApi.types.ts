/**
 * 'support' comes from the Contact Support screen; the rest come from Send
 * Feedback. All four land in the same table and the same support inbox.
 */
export type FeedbackCategoryType = 'bug' | 'feature' | 'general' | 'support';

export interface SubmitFeedbackParamsType {
  category: FeedbackCategoryType;
  /** Only collected for 'support'. */
  subject?: string;
  message: string;
  app_version?: string;
  os?: string;
  device?: string;
}

export interface FeedbackResponseDataType {
  feedback_id: string;
  user_id: string;
  category: FeedbackCategoryType;
  subject?: string;
  message: string;
  app_version?: string;
  os?: string;
  device?: string;
  created_at: string;
}

export interface SubmitFeedbackResponseType {
  data: FeedbackResponseDataType;
}
