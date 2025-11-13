import { Profile } from './profile';

export interface Comment {
  id: string;
  nippo_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentWithProfile extends Comment {
  profiles?: Profile;
}

export interface CreateCommentRequest {
  nippo_id: string;
  content: string;
}