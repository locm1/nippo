'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  FileText, 
  Share2, 
  Smartphone, 
  Eye, 
  Calendar,
  Zap,
  Shield,
  ArrowRight,
  Star
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = async () => {
    setIsLoading(true)
    router.push('/auth')
  }

  const features = [
    {
      icon: <FileText className="h-8 w-8 text-blue-600" />,
      title: 'Markdown記法対応',
      description: 'リッチなテキスト編集とリアルタイムプレビューで、美しい日報を作成できます。'
    },
    {
      icon: <Share2 className="h-8 w-8 text-green-600" />,
      title: '簡単共有機能',
      description: 'URLを共有するだけで、チームメンバーや上司と日報を簡単に共有できます。'
    },
    {
      icon: <Smartphone className="h-8 w-8 text-purple-600" />,
      title: 'スマホ対応',
      description: 'レスポンシブデザインで、外出先からでもスマートフォンで日報を作成・確認できます。'
    },
    {
      icon: <Eye className="h-8 w-8 text-orange-600" />,
      title: 'プライバシー設定',
      description: '公開・非公開を自由に設定。個人的なメモから共有用まで柔軟に使い分けられます。'
    },
    {
      icon: <Calendar className="h-8 w-8 text-red-600" />,
      title: '日付管理',
      description: '報告日を自由に設定可能。過去の日報も後から追加できます。'
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: 'テンプレート機能',
      description: 'よく使う形式をテンプレートとして保存し、効率的な日報作成をサポートします。'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">日報太郎</h1>
            </div>
            <button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? '読み込み中...' : '今すぐ始める'}
            </button>
          </div>
        </div>
      </header>

      {/* メインビジュアル */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="ml-2 text-gray-600 font-medium">現代的な日報管理</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              効率的な日報管理なら
              <span className="text-blue-600 block mt-2">日報太郎</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Markdown記法対応、リアルタイムプレビュー、テンプレート機能で
              <br className="hidden md:block" />
              日報作成がこれまでにないほど簡単になります
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg disabled:opacity-50 flex items-center space-x-2"
              >
                <span>{isLoading ? '読み込み中...' : '無料で始める'}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <div className="text-sm text-gray-500">
                🎉 登録無料・すぐに使用開始
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* スクリーンショットセクション */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              直感的で使いやすいインターフェース
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              シンプルで洗練されたデザインで、誰でもすぐに使い始められます
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* 日報作成画面 */}
            <div className="order-2 md:order-1">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-xl">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="h-96 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">日報作成画面のスクリーンショット</p>
                      <p className="text-sm text-gray-400 mt-2">
                        <Image
                            src="/nippo-create.png"
                            alt="日報作成画面"
                            width={800}
                            height={600}
                            className="rounded-lg shadow-lg"
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                リアルタイムプレビュー付きエディタ
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                左側でMarkdown記法を使って日報を作成すると、右側にリアルタイムでプレビューが表示されます。
                書式を確認しながら、美しい日報を効率的に作成できます。
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Markdown記法完全対応
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  画像の貼り付け・アップロード
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  日本語入力に最適化
                </li>
              </ul>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mt-20">
            {/* ダッシュボード画面 */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                一目でわかるダッシュボード
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                作成した日報を日付順で整理表示。公開・非公開の設定、共有、編集、削除が
                簡単に行えます。フィルター機能で必要な日報をすぐに見つけられます。
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  日付順での自動整理
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  公開・非公開フィルター
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  ワンクリック共有
                </li>
              </ul>
            </div>
            
            <div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 shadow-xl">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="h-96 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">ダッシュボード画面のスクリーンショット</p>
                      <p className="text-sm text-gray-400 mt-2">
                        <Image
                            src="/dashboard.png"
                            alt="日報作成画面"
                            width={800}
                            height={600}
                            className="rounded-lg shadow-lg"
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 機能説明 */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              充実した機能で日報作成をサポート
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              現代のワークスタイルに最適化された機能を多数搭載
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* セキュリティ・信頼性 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              安全・安心のデータ管理
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              企業レベルのセキュリティで、あなたの大切な日報データを保護します
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">暗号化通信</h3>
              <p className="text-gray-600">全ての通信はSSLで暗号化され、安全にデータを送受信します</p>
            </div>
            <div>
              <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">個人データ保護</h3>
              <p className="text-gray-600">ユーザーの個人情報は厳格に管理され、第三者に提供されません</p>
            </div>
            <div>
              <div className="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">定期バックアップ</h3>
              <p className="text-gray-600">データは定期的にバックアップされ、万が一の際も安心です</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            今すぐ日報太郎を使ってみませんか？
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            登録は無料。3分で始められる現代的な日報管理を体験してください。
          </p>
          <button
            onClick={handleGetStarted}
            disabled={isLoading}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg disabled:opacity-50 inline-flex items-center space-x-2"
          >
            <span>{isLoading ? '読み込み中...' : '無料で始める'}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="text-blue-200 text-sm mt-4">
            ✨ クレジットカード不要・即座に利用開始
          </p>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">日報太郎</h3>
            <p className="text-gray-400 mb-6">効率的な日報管理で、より良いワークライフを</p>
            <div className="border-t border-gray-700 pt-6">
              <p className="text-gray-500 text-sm">
                © 2024 日報太郎. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}