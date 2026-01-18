export type ThreadParticipantType = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  CreatedAt: string;
};

export type ThreadType = {
  thread_id: string;
  name: string | null;
  participants: ThreadParticipantType[];
  created_at: string;
  updated_at: string;
  total_unread: number;
  LastMessage: MessageType | null;
};

export type MessageType = {
  message_id: string;
  thread_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
};

export type GetThreadsResponseType = ThreadType[];

export type GetMessagesResponseType = MessageType[];

export type SendMessageInputType = {
  content: string;
};

export type WebSocketMessageType = {
  message_id: string;
  thread_id: string;
  user_id: string;
  content: string;
  created_at: string;
};
