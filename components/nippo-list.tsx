'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from './auth-provider'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { createDefaultTemplateIfNeeded } from '@/lib/default-template'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Share2, 
  Eye, 
  EyeOff, 
  Calendar,
  Clock
} from 'lucide-react'

interface Nippo {
  id: string
  title: string
  content: string
  is_public: boolean
  report_date: string
  created_at: string
  updated_at: string
  stamp_count?: number
}

export default function NippoList() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [nippos, setNippos] = useState<Nippo[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
      return
    }
    
    if (user) {
      fetchNippos()
    }
  }, [user, authLoading, router])

  const fetchNippos = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('nippo')
        .select('*')
        .eq('user_id', user.id)
        .order('report_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setNippos(data || [])
    } catch (error) {
      console.error('日報取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }



  const deleteNippo = async (id: string) => {
    if (!confirm('この日報を削除しますか？')) return

    try {
      const { error } = await supabase
        .from('nippo')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setNippos(prev => prev.filter(nippo => nippo.id !== id))
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
    }
  }

  const togglePublic = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('nippo')
        .update({ is_public: !currentStatus })
        .eq('id', id)

      if (error) throw error
      
      setNippos(prev => 
        prev.map(nippo => 
          nippo.id === id 
            ? { ...nippo, is_public: !currentStatus }
            : nippo
        )
      )
    } catch (error) {
      console.error('公開設定変更エラー:', error)
      alert('公開設定の変更に失敗しました')
    }
  }

  const shareNippo = async (nippo: Nippo) => {
    if (!nippo.is_public) {
      alert('公開設定にしてから共有してください')
      return
    }

    const shareUrl = `${window.location.origin}/share/${nippo.id}`
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('共有URLをクリップボードにコピーしました')
    } catch (error) {
      // フォールバック: テキストエリアを使用
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('共有URLをコピーしました')
    }
  }

  const filteredNippos = nippos.filter(nippo => {
    if (filter === 'all') return true
    if (filter === 'public') return nippo.is_public
    if (filter === 'private') return !nippo.is_public
    return true
  })

  if (!user) return null

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">作成した記事一覧</h2>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={() => router.push('/nippo/new')}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>新しい日報</span>
          </button>
          <button
            onClick={() => router.push('/templates')}
            className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>テンプレート管理</span>
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            すべて ({nippos.length})
          </button>
          <button
            onClick={() => setFilter('public')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === 'public' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            公開 ({nippos.filter(n => n.is_public).length})
          </button>
          <button
            onClick={() => setFilter('private')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === 'private' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            非公開 ({nippos.filter(n => !n.is_public).length})
          </button>
        </div>
      </div>

      {filteredNippos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {filter === 'all' && '日報がまだありません'}
            {filter === 'public' && '公開された日報がありません'}
            {filter === 'private' && '非公開の日報がありません'}
          </div>
          <button
            onClick={() => router.push('/nippo/new')}
            className="text-blue-600 hover:text-blue-700"
          >
            最初の日報を作成する
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNippos.map((nippo) => (
            <div
              key={nippo.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 
                  className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                  onClick={() => router.push(`/nippo/${nippo.id}`)}
                >
                  {nippo.title}
                </h3>
                
                <div className="flex items-center space-x-2">
                  <div title={nippo.is_public ? "公開" : "非公開"}>
                    {nippo.is_public ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              <div className="text-gray-600 text-sm mb-4 line-clamp-3">
                {nippo.content.substring(0, 150)}
                {nippo.content.length > 150 && '...'}
              </div>

              {/* デスクトップレイアウト */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push(`/nippo/${nippo.id}/edit`)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-blue-600 border border-gray-300 rounded-md hover:border-blue-300"
                  >
                    <Edit className="h-4 w-4" />
                    <span>編集</span>
                  </button>
                  
                  <button
                    onClick={() => togglePublic(nippo.id, nippo.is_public)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-green-600 border border-gray-300 rounded-md hover:border-green-300"
                  >
                    {nippo.is_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{nippo.is_public ? '非公開にする' : '公開する'}</span>
                  </button>
                  
                  {nippo.is_public && (
                    <button
                      onClick={() => shareNippo(nippo)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-purple-600 border border-gray-300 rounded-md hover:border-purple-300"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>共有</span>
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => deleteNippo(nippo.id)}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-md hover:border-red-400 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>削除</span>
                </button>
              </div>

              {/* モバイルレイアウト */}
              <div className="sm:hidden space-y-2">
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => router.push(`/nippo/${nippo.id}/edit`)}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 border border-gray-300 rounded-md hover:border-blue-300"
                  >
                    <Edit className="h-4 w-4" />
                    <span>編集</span>
                  </button>
                  
                  <button
                    onClick={() => togglePublic(nippo.id, nippo.is_public)}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-green-600 border border-gray-300 rounded-md hover:border-green-300"
                  >
                    {nippo.is_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{nippo.is_public ? '非公開にする' : '公開する'}</span>
                  </button>
                  
                  {nippo.is_public && (
                    <button
                      onClick={() => shareNippo(nippo)}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-purple-600 border border-gray-300 rounded-md hover:border-purple-300"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>共有</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteNippo(nippo.id)}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-md hover:border-red-400 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>削除</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}