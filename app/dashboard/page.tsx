import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import NippoList from '@/components/nippo-list'

// 動的レンダリングを強制
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NippoList />
    </div>
  )
}