export interface SubmitReportParamsType {
  message_id?: string;
  friend_id?: string;
  note: string;
}

export interface ReportResponseDataType {
  report_id: string;
  user_id: string;
  message_id?: string;
  friend_id?: string;
  note: string;
  created_at: string;
}

export interface SubmitReportResponseType {
  data: ReportResponseDataType;
}
