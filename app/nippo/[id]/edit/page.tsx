import { createClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import NippoForm from '@/components/nippo-form'

export default async function EditNippoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // 日報データを取得
  const { data: nippo, error } = await supabase
    .from('nippo')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !nippo) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <NippoForm initialData={nippo} />
    </div>
  )
}