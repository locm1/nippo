import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/landing-page'

// 動的レンダリングを強制
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ログイン済みユーザーはダッシュボードへリダイレクト
  if (user) {
    redirect('/dashboard')
  }

  // 未ログインユーザーにはランディングページを表示
  return <LandingPage />
}
