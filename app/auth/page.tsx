import AuthComponent from '@/components/auth-component'

// 動的レンダリングを強制
export const dynamic = 'force-dynamic'

export default async function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <AuthComponent />
    </div>
  )
}