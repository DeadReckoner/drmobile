export type UserReportReasonType =
  | 'harassment'
  | 'spam'
  | 'inappropriate_content'
  | 'impersonation'
  | 'other';

export type AIReportReasonType =
  | 'unsafe'
  | 'inaccurate'
  | 'offensive'
  | 'medical_mental_health'
  | 'legal_financial'
  | 'other';

interface BaseReportParamsType {
  note?: string;
  app_version?: string;
  os?: string;
  device?: string;
}

export interface UserReportParamsType extends BaseReportParamsType {
  type: 'user';
  reason: UserReportReasonType;
  reported_user_id: string;
  thread_id?: string;
  message_id?: string;
}

export interface AIReportParamsType extends BaseReportParamsType {
  type: 'ai';
  reason: AIReportReasonType;
  output_type: string;
  output_id?: string;
  roadmap_id?: string;
  job_id?: string;
  context?: Record<string, unknown>;
}

export type SubmitReportParamsType = UserReportParamsType | AIReportParamsType;

export interface SubmitReportResponseType {
  report_id: string;
  reporter_id: string;
  type: 'user' | 'ai';
  reason: string;
  note?: string;
  status: string;
  created_at: string;
  reported_user_id?: string;
  thread_id?: string;
  message_id?: string;
  output_type?: string;
  output_id?: string;
  roadmap_id?: string;
  job_id?: string;
  context?: Record<string, unknown>;
}
