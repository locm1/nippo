import NippoList from '@/components/nippo-list'

// 動的レンダリングを強制
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NippoList />
    </div>
  )
}