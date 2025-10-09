import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import NippoDetail from '@/components/nippo-detail'

export default async function NippoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <NippoDetail nippoId={id} />
    </div>
  )
}