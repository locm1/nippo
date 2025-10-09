'use client'

import { createClient } from '@/lib/supabase-client'
import { User } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'

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
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.warn('認証エラー:', error)
          // 認証エラーの場合は一度サインアウトしてクリアする
          await supabase.auth.signOut()
          setUser(null)
        } else {
          setUser(user)
        }
      } catch (error) {
        console.error('認証取得エラー:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = user
      setUser(session?.user ?? null)
      setLoading(false)
      
      // 初回サインイン時かつ認証ページにいる場合のみダッシュボードにリダイレクト
      if (event === 'SIGNED_IN' && !currentUser && pathname === '/auth') {
        router.push('/dashboard')
      }
      // サインアウト時は常に認証ページにリダイレクト
      if (event === 'SIGNED_OUT') {
        router.push('/auth')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, pathname, supabase.auth, user])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}