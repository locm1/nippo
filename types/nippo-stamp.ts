export interface NippoStamp {
  id: string
  nippo_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface NippoStampWithUser extends NippoStamp {
  user?: {
    name?: string
    email?: string
  }
}

export interface CreateNippoStampRequest {
  nippo_id: string
  emoji: string
}

export interface NippoStampGroup {
  emoji: string
  count: number
  users: Array<{
    id: string
    name?: string
    email?: string
  }>
  hasCurrentUser: boolean
}