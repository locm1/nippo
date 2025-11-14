'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'
import { LogOut, User, ChevronDown } from 'lucide-react'
import NotificationBell from './notification-bell'

export default function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-end gap-2">
            <button
              onClick={() => router.push(user ? '/dashboard' : '/')}
              className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
            >
              日報太郎
            </button>
            <p className="text-gray-500">議事録もおまかせ！</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* ログインしている場合のみ通知ベルとユーザーメニューを表示 */}
            {user ? (
              <>
                {/* 通知ベル */}
                <NotificationBell />
                
                {/* ユーザーメニュー */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700 hidden md:inline">
                      {user.email}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500 md:hidden" />
                  </button>

                  {/* ドロップダウンメニュー */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <div className="font-medium">ログイン中</div>
                        <div className="text-gray-500 break-all">{user.email}</div>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          signOut()
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>ログアウト</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* ログインしていない場合はログインボタンを表示 */
              <button
                onClick={() => router.push('/auth')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                ログイン
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}