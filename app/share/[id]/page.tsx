import NippoDetail from '@/components/nippo-detail'

export default async function SharedNippoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <NippoDetail nippoId={id} isSharedView={true} />
    </div>
  )
}