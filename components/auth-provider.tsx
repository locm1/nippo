'use client'

import { createClient } from '@/lib/supabase-client'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'
import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { createDefaultTemplateIfNeeded } from '@/lib/default-template'
import { createOrUpdateProfile } from '@/lib/profile-utils'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  
  // Supabaseクライアントを取得（シングルトンパターン）
  const supabase = createClient()



  // 認証状態の初期取得とリスナー設定（一度だけ実行）
  useEffect(() => {
    let isMounted = true

    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (isMounted) {
          if (error) {
            console.warn('認証エラー:', error)
            setUser(null)
          } else {
            setUser(user)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('認証取得エラー:', error)
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (isMounted) {
        const newUser = session?.user ?? null
        setUser(newUser)
        setLoading(false)

        // 新規ユーザーの場合、プロファイル作成とデフォルトテンプレート作成
        if (event === 'SIGNED_IN' && newUser) {
          // プロファイル作成後にデフォルトテンプレート作成を実行
          const initializeUser = async () => {
            try {
              // プロファイルを作成または更新
              await createOrUpdateProfile(supabase, newUser)
              // プロファイル作成後にデフォルトテンプレート作成
              await createDefaultTemplateIfNeeded(supabase, newUser.id)
            } catch (error) {
              console.error('ユーザー初期化エラー:', error)
            }
          }
          
          initializeUser()
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // リダイレクト処理（ユーザー状態とパスの変更時）
  useEffect(() => {
    if (loading) return

    // 明確に保護が必要なページのみリダイレクト処理
    if (!user && (pathname === '/templates' || (pathname.startsWith('/nippo/') && pathname.includes('/edit')))) {
      router.push('/auth')
    }
  }, [user, pathname, loading, router])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}