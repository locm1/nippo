export interface CommentStamp {
  id: string
  comment_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface CommentStampWithUser extends CommentStamp {
  user?: {
    name?: string
    email?: string
  }
}

export interface CreateCommentStampRequest {
  comment_id: string
  emoji: string
}

export interface CommentStampGroup {
  emoji: string
  count: number
  users: Array<{
    id: string
    name?: string
    email?: string
  }>
  hasCurrentUser: boolean
}