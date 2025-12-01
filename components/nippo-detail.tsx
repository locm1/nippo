'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from './auth-provider'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { 
  ArrowLeft, 
  Edit, 
  Share2, 
  Eye, 
  EyeOff, 
  Calendar,
  Clock
} from 'lucide-react'
import Comments from './comments'
import NippoStamps from './nippo-stamps'
import { NippoStampGroup } from '@/types/nippo-stamp'

interface Nippo {
  id: string
  title: string
  content: string
  is_public: boolean
  report_date: string
  created_at: string
  updated_at: string
  user_id: string
  images?: string[]
  stamps?: NippoStampGroup[]
}

interface NippoDetailProps {
  nippoId: string
  isSharedView?: boolean
}

export default function NippoDetail({ nippoId, isSharedView = false }: NippoDetailProps) {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [nippo, setNippo] = useState<Nippo | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetchNippo()
  }, [nippoId])

  const fetchNippo = async () => {
    try {
      let query = supabase
        .from('nippo')
        .select('*')
        .eq('id', nippoId)

      // 共有ビューの場合は公開されているもののみ
      if (isSharedView) {
        query = query.eq('is_public', true)
      } else if (user) {
        // ログインユーザーは自分の日報または公開日報
        query = query.or(`user_id.eq.${user.id},is_public.eq.true`)
      } else {
        // 未ログインユーザーは公開日報のみ
        query = query.eq('is_public', true)
      }

      const { data, error } = await query.single()

      if (error) {
        console.error('日報取得エラー:', error)
        setNotFound(true)
        return
      }

      // スタンプ情報を取得
      const stamps = await fetchStampsForNippo(nippoId)
      
      setNippo({
        ...data,
        stamps
      })
    } catch (error) {
      console.error('日報取得エラー:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const fetchStampsForNippo = async (nippoId: string): Promise<NippoStampGroup[]> => {
    try {
      // スタンプデータを取得
      const { data: stampsData, error: stampsError } = await supabase
        .from('nippo_stamps')
        .select(`
          id,
          nippo_id,
          user_id,
          emoji,
          created_at
        `)
        .eq('nippo_id', nippoId)
        .order('created_at', { ascending: true })

      if (stampsError) {
        console.error('スタンプデータ取得エラー:', stampsError)
        return []
      }

      if (!stampsData || stampsData.length === 0) {
        return []
      }

      // スタンプユーザーのプロフィール情報を取得
      const stampUserIds = [...new Set(stampsData.map(s => s.user_id))]
      const { data: stampProfilesData, error: stampProfilesError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', stampUserIds)

      if (stampProfilesError) {
        console.error('スタンプユーザープロフィール取得エラー:', stampProfilesError)
      }

      // プロフィールマップ作成
      const stampProfileMap = new Map()
      if (stampProfilesData) {
        stampProfilesData.forEach(profile => {
          stampProfileMap.set(profile.id, profile)
        })
      }

      // 絵文字ごとにグループ化
      const emojiGroups = new Map<string, NippoStampGroup>()

      stampsData.forEach(stamp => {
        const profile = stampProfileMap.get(stamp.user_id)
        const isCurrentUser = user?.id === stamp.user_id

        if (!emojiGroups.has(stamp.emoji)) {
          emojiGroups.set(stamp.emoji, {
            emoji: stamp.emoji,
            count: 0,
            users: [],
            hasCurrentUser: false
          })
        }

        const group = emojiGroups.get(stamp.emoji)!
        group.count++
        group.users.push({
          id: stamp.user_id,
          name: profile?.name,
          email: profile?.email
        })

        if (isCurrentUser) {
          group.hasCurrentUser = true
        }
      })

      return Array.from(emojiGroups.values())
    } catch (error) {
      console.error('スタンプ取得エラー:', error)
      return []
    }
  }

  const shareNippo = async () => {
    if (!nippo || !nippo.is_public) {
      alert('公開設定にしてから共有してください')
      return
    }

    const shareUrl = `${window.location.origin}/share/${nippo.id}`
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('共有URLをクリップボードにコピーしました')
    } catch (error) {
      // フォールバック
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('共有URLをコピーしました')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (notFound || !nippo) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            日報が見つかりません
          </h2>
          <p className="text-gray-600 mb-6">
            指定された日報は存在しないか、アクセス権限がありません。
          </p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>戻る</span>
            </button>

            {!isSharedView && user && user.id === nippo.user_id && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push(`/nippo/${nippo.id}/edit`)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 border border-gray-300 rounded-md hover:border-blue-300"
                >
                  <Edit className="h-4 w-4" />
                  <span>編集</span>
                </button>
                
                {nippo.is_public && (
                  <button
                    onClick={shareNippo}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-purple-600 border border-gray-300 rounded-md hover:border-purple-300"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>共有</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {nippo.title}
          </h1>

          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>
                報告日: {format(new Date(nippo.report_date), 'yyyy年MM月dd日', { locale: ja })}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>
                作成: {format(new Date(nippo.created_at), 'MM月dd日 HH:mm', { locale: ja })}
              </span>
            </div>
            
            {nippo.updated_at !== nippo.created_at && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>
                  更新: {format(new Date(nippo.updated_at), 'MM月dd日 HH:mm', { locale: ja })}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              {nippo.is_public ? (
                <>
                  <Eye className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">公開</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 text-gray-400" />
                  <span>非公開</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                img: ({ src, alt }) => (
                  <img 
                    src={src} 
                    alt={alt} 
                    className="max-w-full h-auto rounded-md shadow-sm border"
                  />
                ),
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700 [&>p]:mb-0 [&>p]:inline">
                    {children}
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  if (className?.includes('language-')) {
                    return (
                      <pre className="bg-gray-100 rounded-md p-4 overflow-x-auto mb-4">
                        <code className="text-sm font-mono text-gray-800">
                          {children}
                        </code>
                      </pre>
                    )
                  }
                  return (
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                      {children}
                    </code>
                  )
                },
              }}
            >
              {nippo.content}
            </ReactMarkdown>
          </div>

          {/* スタンプコンポーネントを追加 */}
          <NippoStamps
            nippoId={nippo.id}
            stamps={nippo.stamps || []}
            onStampUpdate={fetchNippo}
          />
        </div>
      </div>

      {/* コメントセクション */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <Comments nippoId={nippo.id} />
      </div>

      {isSharedView && (
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              この日報は共有されています。
              <a
                href="/auth"
                className="ml-2 text-blue-600 hover:text-blue-800 underline font-medium"
              >
                日報太郎にログインして自分の日報を作成する
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}