import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import NippoForm from '@/components/nippo-form'

// 動的レンダリングを強制
export const dynamic = 'force-dynamic'

export default async function NewNippoPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <NippoForm />
    </div>
  )
}