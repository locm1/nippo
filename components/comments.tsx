'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './auth-provider'
import { createClient } from '@/lib/supabase-client'
import { CommentWithProfile, CreateCommentRequest } from '@/types/comment'
import LoginPromptModal from './login-prompt-modal'

interface CommentsProps {
  nippoId: string
}

export default function Comments({ nippoId }: CommentsProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // ユーザー状態の変化を監視
  useEffect(() => {
    // ユーザー状態の変化をログに記録（本番環境では削除）
  }, [user, nippoId])

  // コメントを取得
  useEffect(() => {
    fetchComments()
  }, [nippoId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      
      // コメントを取得
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('nippo_id', nippoId)
        .order('created_at', { ascending: true })

      if (commentsError) {
        console.error('コメントの取得に失敗しました:', commentsError)
        return
      }

      if (!commentsData || commentsData.length === 0) {
        setComments([])
        return
      }

      // 一括でプロフィール情報を取得
      const userIds = [...new Set(commentsData.map(c => c.user_id))]
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)

      if (profilesError) {
        console.error('プロフィール一括取得エラー:', profilesError)
      }

      // プロフィールマップを作成
      const profileMap = new Map()
      if (profilesData) {
        profilesData.forEach(profile => {
          profileMap.set(profile.id, profile)
        })
      }

      // コメントとプロフィールを結合
      const commentsWithProfiles = commentsData.map(comment => {
        const profile = profileMap.get(comment.user_id)
        
        return {
          ...comment,
          profiles: profile || null
        }
      })

      setComments(commentsWithProfiles)
    } catch (error) {
      console.error('コメントの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setShowLoginModal(true)
      return
    }

    if (!newComment.trim()) return

    try {
      setIsSubmitting(true)
      const commentData: CreateCommentRequest = {
        nippo_id: nippoId,
        content: newComment.trim(),
      }

      const { data, error } = await supabase
        .from('comments')
        .insert([{ 
          ...commentData, 
          user_id: user.id 
        }])
        .select('*')
        .single()

      if (error) {
        console.error('コメントの投稿に失敗しました:', error)
        alert('コメントの投稿に失敗しました。')
        return
      }

      // プロフィール情報を取得
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('投稿者プロフィール取得エラー:', profileError)
      }

      const newCommentWithProfile = {
        ...data,
        profiles: profileData
      }

      setComments([...comments, newCommentWithProfile])
      setNewComment('')
    } catch (error) {
      console.error('コメントの投稿に失敗しました:', error)
      alert('コメントの投稿に失敗しました。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentClick = () => {
    if (!user) {
      setShowLoginModal(true)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUserDisplayName = (comment: CommentWithProfile) => {
    if (comment.profiles?.name) {
      return comment.profiles.name
    }
    
    return comment.profiles?.email?.split('@')[0] || '匿名ユーザー'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">コメント</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">コメント ({comments.length})</h3>
      
      {/* コメント投稿フォーム */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onFocus={handleCommentClick}
            placeholder={user ? "コメントを入力してください..." : "コメントを投稿するにはログインが必要です"}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!user}
          />
        </div>
        {user && (
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '投稿中...' : 'コメントを投稿'}
          </button>
        )}
      </form>

      {/* コメント一覧 */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            まだコメントがありません。最初のコメントを投稿してみませんか？
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {getUserDisplayName(comment).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {getUserDisplayName(comment)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      <LoginPromptModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
      />
    </div>
  )
}