import AuthComponent from '@/components/auth-component'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

// 動的レンダリングを強制
export const dynamic = 'force-dynamic'

export default async function AuthPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <AuthComponent />
    </div>
  )
}