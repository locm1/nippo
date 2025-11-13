export interface Profile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileRequest {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar_url?: string;
}