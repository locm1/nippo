import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

// 動的レンダリングを強制
export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/auth')
  }
}
