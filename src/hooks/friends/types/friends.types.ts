import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { HabitType } from '@/store/apis/types/habitsApi.types';

export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  CreatedAt?: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  restrictions?: {
    allowed_roadmap_ids?: string[];
  } | null;
  created_at: string;
  updated_at?: string;
  requester?: User;
  addressee?: User;
}

export interface UserSearchResult {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  friendship_status: 'none' | 'pending' | 'accepted';
  avatar?: string;
}

export interface FriendResponse {
  friendship_id: string;
  friend: User;
  restrictions?: {
    allowed_roadmap_ids?: string[];
  } | null;
  created_at: string;
}

export interface FriendProfileResponse {
  user: User;
  allowed_roadmaps: RoadmapType[];
  allowed_habits: HabitType[];
  thread_id: string;
}

export interface ApiResponse<T> {
  status: number;
  data: T;
  code?: number;
}

export interface MessageResponse {
  status: number;
  message: string;
}

export interface AnchorRequest {
  request_id: string;
  roadmap_id: string;
  requester_id: string;
  anchor_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at?: string;
  roadmap?: RoadmapType;
  requester?: User;
  anchor?: User;
}

export interface AnchorRequestResponse {
  request_id: string;
  status: 'accepted' | 'rejected';
  updated_at: string;
}
