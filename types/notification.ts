export interface Notification {
  id: string
  user_id: string
  type: 'comment'
  title: string
  message: string
  nippo_id?: string
  comment_id?: string
  is_read: boolean
  created_at: string
}

export interface CreateNotificationRequest {
  user_id: string
  type: 'comment'
  title: string
  message: string
  nippo_id?: string
  comment_id?: string
}