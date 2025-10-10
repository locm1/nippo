import { Metadata } from 'next'
import TemplateManager from '@/components/template-manager'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'テンプレート管理 - 日報太郎',
  description: '日報作成用のテンプレートを管理します',
}

export default function TemplatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TemplateManager />
    </div>
  )
}