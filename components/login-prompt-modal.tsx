'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface LoginPromptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LoginPromptModal({ open, onOpenChange }: LoginPromptModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            コメントを投稿するには
          </h2>
          <p className="text-gray-600">
            日報にコメントを投稿するには、アカウントにログインする必要があります。
          </p>
        </div>
        
        <div className="space-y-3">
          <Link 
            href="/auth" 
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md text-center font-medium transition-colors"
          >
            ログイン / 新規登録
          </Link>
          <button 
            onClick={() => onOpenChange(false)}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-md font-medium transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}