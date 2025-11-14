'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { CommentStampGroup } from '@/types/comment-stamp'
import { useAuth } from './auth-provider'

interface CommentStampsProps {
  commentId: string
  stamps: CommentStampGroup[]
  onStampUpdate: () => void
}

const EMOJI_OPTIONS = ['👍', '❤️', '😊', '🎉', '👏', '🔥', '💯', '✨']

export default function CommentStamps({ commentId, stamps, onStampUpdate }: CommentStampsProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const supabase = createClient()

  const handleStampToggle = async (emoji: string) => {
    if (!user || isLoading) return

    setIsLoading(emoji)
    try {
      // Check if user already has this stamp
      const existingStamp = stamps.find(s => s.emoji === emoji)
      const hasStamp = existingStamp?.hasCurrentUser

      if (hasStamp) {
        // Remove stamp
        const { error } = await supabase
          .from('comment_stamps')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id)
          .eq('emoji', emoji)

        if (error) {
          console.error('スタンプ削除エラー:', error)
          return
        }
      } else {
        // Add stamp
        const { error } = await supabase
          .from('comment_stamps')
          .insert([{
            comment_id: commentId,
            user_id: user.id,
            emoji: emoji
          }])

        if (error) {
          console.error('スタンプ追加エラー:', error)
          return
        }
      }

      onStampUpdate()
      setShowEmojiPicker(false)
    } catch (error) {
      console.error('スタンプ操作エラー:', error)
    } finally {
      setIsLoading(null)
    }
  }

  const renderStampGroup = (stampGroup: CommentStampGroup) => {
    const isStampLoading = isLoading === stampGroup.emoji
    const isActive = stampGroup.hasCurrentUser

    return (
      <button
        key={stampGroup.emoji}
        onClick={() => handleStampToggle(stampGroup.emoji)}
        disabled={!user || isStampLoading}
        className={`
          inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm border transition-colors
          ${isActive 
            ? 'bg-blue-50 border-blue-200 text-blue-700' 
            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }
          ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isStampLoading ? 'opacity-50 cursor-wait' : ''}
        `}
        title={`${stampGroup.users.map(u => u.name || u.email?.split('@')[0] || '匿名').join(', ')}`}
      >
        <span className="text-base">{stampGroup.emoji}</span>
        <span className="text-xs font-medium">{stampGroup.count}</span>
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {/* 既存のスタンプを表示 */}
      {stamps.map(renderStampGroup)}

      {/* スタンプ追加ボタン */}
      {user && (
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors border border-gray-200"
            title="スタンプを追加"
          >
            <span className="text-sm font-medium">+</span>
          </button>

          {/* 絵文字ピッカー */}
          {showEmojiPicker && (
            <>
              {/* 背景オーバーレイ */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowEmojiPicker(false)}
              />
              
              {/* 絵文字選択パネル */}
              <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20 min-w-max">
                <div className="text-xs text-gray-500 mb-2">スタンプを選択</div>
                <div className="grid grid-cols-4 gap-2">
                  {EMOJI_OPTIONS.map((emoji) => {
                    const existingStamp = stamps.find(s => s.emoji === emoji)
                    const hasStamp = existingStamp?.hasCurrentUser
                    const isEmojiLoading = isLoading === emoji

                    return (
                      <button
                        key={emoji}
                        onClick={() => handleStampToggle(emoji)}
                        disabled={isEmojiLoading}
                        className={`
                          w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors
                          ${hasStamp 
                            ? 'bg-blue-100 border-2 border-blue-300' 
                            : 'hover:bg-gray-100 border border-gray-200'
                          }
                          ${isEmojiLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                        `}
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}