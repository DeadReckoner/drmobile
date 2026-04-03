export interface Friend {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  friendship_status?: 'none' | 'pending' | 'accepted';
}

export type FriendViewState =
  | 'LOADING'
  | 'SEARCHING'
  | 'FRIENDS_LIST'
  | 'SEARCH_RESULTS'
  | 'NO_RESULTS'
  | 'EMPTY';
