'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { NippoStampGroup } from '@/types/nippo-stamp'
import { useAuth } from './auth-provider'
import LoginPromptModal from './login-prompt-modal'

interface NippoStampsProps {
  nippoId: string
  stamps: NippoStampGroup[]
  onStampUpdate: () => void
}

const EMOJI_OPTIONS = ['👍', '❤️', '😊', '🎉', '👏', '🔥', '💯', '✨']

export default function NippoStamps({ nippoId, stamps, onStampUpdate }: NippoStampsProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [hoveredStamp, setHoveredStamp] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const supabase = createClient()

  const handleStampToggle = async (emoji: string) => {
    if (!user) {
      setShowLoginModal(true)
      return
    }
    
    if (isLoading) return

    setIsLoading(emoji)
    try {
      // Check if user already has this stamp
      const existingStamp = stamps.find(s => s.emoji === emoji)
      const hasStamp = existingStamp?.hasCurrentUser

      if (hasStamp) {
        // Remove stamp
        const { error } = await supabase
          .from('nippo_stamps')
          .delete()
          .eq('nippo_id', nippoId)
          .eq('user_id', user.id)
          .eq('emoji', emoji)

        if (error) {
          console.error('スタンプ削除エラー:', error)
          return
        }
      } else {
        // Add stamp
        const { error } = await supabase
          .from('nippo_stamps')
          .insert([{
            nippo_id: nippoId,
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

  const renderStampGroup = (stampGroup: NippoStampGroup) => {
    const isStampLoading = isLoading === stampGroup.emoji
    const isActive = stampGroup.hasCurrentUser
    const isHovered = hoveredStamp === stampGroup.emoji

    const handleMouseEnter = (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect()
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 10
      })
      setHoveredStamp(stampGroup.emoji)
    }

    return (
      <div key={stampGroup.emoji} className="relative">
        <button
          onClick={() => handleStampToggle(stampGroup.emoji)}
          disabled={isStampLoading}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setHoveredStamp(null)}
          className={`
            inline-flex items-center space-x-1 px-3 py-2 rounded-full text-sm border transition-all duration-200
            ${isActive 
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }
            ${isStampLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
            ${isHovered ? 'transform scale-105 shadow-sm' : ''}
          `}
        >
          <span className="text-lg">{stampGroup.emoji}</span>
          <span className="text-sm font-medium">{stampGroup.count}</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100 relative">
      {/* 既存のスタンプを表示 */}
      {stamps.map(renderStampGroup)}

      {/* スタンプ追加ボタン */}
      <div className="relative">
        <button
          onClick={() => {
            if (!user) {
              setShowLoginModal(true)
              return
            }
            setShowEmojiPicker(!showEmojiPicker)
          }}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors border border-gray-200"
          title={user ? "スタンプを追加" : "スタンプを追加するにはログインが必要です"}
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
                          w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors
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

      {/* ツールチップを外側に表示 */}
      {hoveredStamp && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, 0%)'
          }}
        >
          {stamps.map(stampGroup => {
            if (stampGroup.emoji === hoveredStamp && stampGroup.users.length > 0) {
              return (
                <div
                  key={stampGroup.emoji}
                  className="bg-gray-900 text-white text-xs rounded-md px-3 py-2 whitespace-nowrap shadow-lg animate-in fade-in duration-150"
                >
                  {stampGroup.users.map(u => u.name || u.email?.split('@')[0] || '匿名').join(', ')}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-gray-900"></div>
                </div>
              )
            }
            return null
          })}
        </div>
      )}

      <LoginPromptModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
      />
    </div>
  )
}