'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/components/auth-provider'
import { Template } from '@/types/template'
import { Plus, Edit3, Trash2, Save, X, FileText, Eye, ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

export default function TemplateManager() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [isComposing, setIsComposing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTemplates()
    }
  }, [user])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('テンプレート取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!user || !newTemplate.name.trim() || !newTemplate.content.trim()) return

    setIsSaving(true)
    try {
      const processedContent = processContentForMarkdown(newTemplate.content.trim())
      const { data, error } = await supabase
        .from('templates')
        .insert({
          name: newTemplate.name.trim(),
          content: processedContent,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      setTemplates(prev => [data, ...prev])
      setNewTemplate({ name: '', content: '' })
      setIsCreating(false)
    } catch (error) {
      console.error('テンプレート作成エラー:', error)
      alert('テンプレートの作成に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingTemplate || !editingTemplate.name.trim() || !editingTemplate.content.trim()) return

    setIsSaving(true)
    try {
      const processedContent = processContentForMarkdown(editingTemplate.content.trim())
      const { data, error } = await supabase
        .from('templates')
        .update({
          name: editingTemplate.name.trim(),
          content: processedContent
        })
        .eq('id', editingTemplate.id)
        .select()
        .single()

      if (error) throw error

      setTemplates(prev => prev.map(t => t.id === data.id ? data : t))
      setEditingTemplate(null)
    } catch (error) {
      console.error('テンプレート更新エラー:', error)
      alert('テンプレートの更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('このテンプレートを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId)

      if (error) throw error

      setTemplates(prev => prev.filter(t => t.id !== templateId))
    } catch (error) {
      console.error('テンプレート削除エラー:', error)
      alert('テンプレートの削除に失敗しました')
    }
  }

  // 改行を自動的にMarkdown形式に変換する関数
  const processContentForMarkdown = useCallback((text: string): string => {
    return text
      .split('\n')
      .map(line => {
        // 既にスペース2個で終わっている行はそのまま
        if (line.endsWith('  ')) {
          return line
        }
        // 空行はそのまま
        if (line.trim() === '') {
          return line
        }
        // その他の行にはスペース2個を追加
        return line + '  '
      })
      .join('\n')
  }, [])

  // キーダウンハンドラー（新規作成用）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !isComposing) {
      const textarea = e.currentTarget
      const cursorPosition = textarea.selectionStart
      const textBeforeCursor = newTemplate.content.slice(0, cursorPosition)
      const textAfterCursor = newTemplate.content.slice(cursorPosition)
      
      // 現在の行を取得
      const lines = textBeforeCursor.split('\n')
      const currentLine = lines[lines.length - 1]
      
      if (e.shiftKey) {
        // Shift+Enterの場合は通常の改行（スペースなし）
        e.preventDefault()
        const newContent = textBeforeCursor + '\n' + textAfterCursor
        setNewTemplate(prev => ({ ...prev, content: newContent }))
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1
        }, 0)
      } else {
        // 通常のEnterの場合は、Markdown改行用のスペース2個を追加
        e.preventDefault()
        
        // 現在の行がすでにスペース2個で終わっている場合は、そのまま改行
        if (currentLine.endsWith('  ')) {
          const newContent = textBeforeCursor + '\n' + textAfterCursor
          setNewTemplate(prev => ({ ...prev, content: newContent }))
          
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1
          }, 0)
        } else {
          // スペース2個を追加してから改行
          const newContent = textBeforeCursor + '  \n' + textAfterCursor
          setNewTemplate(prev => ({ ...prev, content: newContent }))
          
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = cursorPosition + 3
          }, 0)
        }
      }
    }
  }

  // キーダウンハンドラー（編集用）
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !isComposing && editingTemplate) {
      const textarea = e.currentTarget
      const cursorPosition = textarea.selectionStart
      const textBeforeCursor = editingTemplate.content.slice(0, cursorPosition)
      const textAfterCursor = editingTemplate.content.slice(cursorPosition)
      
      // 現在の行を取得
      const lines = textBeforeCursor.split('\n')
      const currentLine = lines[lines.length - 1]
      
      if (e.shiftKey) {
        // Shift+Enterの場合は通常の改行（スペースなし）
        e.preventDefault()
        const newContent = textBeforeCursor + '\n' + textAfterCursor
        setEditingTemplate(prev => prev ? { ...prev, content: newContent } : null)
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1
        }, 0)
      } else {
        // 通常のEnterの場合は、Markdown改行用のスペース2個を追加
        e.preventDefault()
        
        // 現在の行がすでにスペース2個で終わっている場合は、そのまま改行
        if (currentLine.endsWith('  ')) {
          const newContent = textBeforeCursor + '\n' + textAfterCursor
          setEditingTemplate(prev => prev ? { ...prev, content: newContent } : null)
          
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1
          }, 0)
        } else {
          // スペース2個を追加してから改行
          const newContent = textBeforeCursor + '  \n' + textAfterCursor
          setEditingTemplate(prev => prev ? { ...prev, content: newContent } : null)
          
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = cursorPosition + 3
          }, 0)
        }
      }
    }
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">テンプレートを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
        <div className='pb-4'>
        <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
        >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">ダッシュボードに戻る</span>
            <span className="sm:hidden">戻る</span>
        </button>
        </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* ヘッダー部分 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">テンプレート管理</h1>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>新規作成</span>
          </button>
        </div>

        {/* 新規作成フォーム */}
        {isCreating && (
          <div className="mb-6 p-4 border border-gray-300 rounded-lg">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  テンプレート名
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例: 日次報告書テンプレート"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* デスクトップ用リアルタイムプレビュー表示 */}
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <Eye className="h-4 w-4" />
                <span>リアルタイムプレビュー</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    テンプレート内容 (Markdown記法が使用できます)
                  </label>
                  <textarea
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    onCompositionStart={handleCompositionStart}
                    onCompositionEnd={handleCompositionEnd}
                    placeholder="## 今日やったこと&#10;- &#10;&#10;## 明日やること&#10;- &#10;&#10;## 所感&#10;"
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                  />
                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    <p>• Enterで改行時に自動でMarkdown改行用のスペース2個が追加されます（IME変換中は除く）</p>
                    <p>• Shift+Enterで通常の改行ができます</p>
                    <p>• 保存時に全ての改行が自動的にMarkdown形式に変換されます</p>
                    <p>• Markdown記法: # 見出し、**太字**、*斜体*、- リスト、`コード` など</p>
                  </div>
                </div>

                <div className="hidden lg:block">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    プレビュー
                  </label>
                  <div className="h-80 p-4 border border-gray-300 rounded-md bg-gray-50 overflow-auto">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-xl font-bold text-gray-900 mt-6 mb-3 first:mt-0 border-b border-gray-200 pb-2">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-lg font-bold text-gray-900 mt-5 mb-2">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="text-sm text-gray-700 leading-relaxed mb-3">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-gray-700 pl-2">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-gray-700 pl-2">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-sm text-gray-700">
                              {children}
                            </li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-gray-900">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-gray-700">
                              {children}
                            </em>
                          ),
                          code: ({ children, className }) => {
                            if (className?.includes('language-')) {
                              return (
                                <pre className="bg-gray-100 rounded-md p-3 overflow-x-auto mb-3 text-xs">
                                  <code className="font-mono text-gray-800">
                                    {children}
                                  </code>
                                </pre>
                              )
                            }
                            return (
                              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800">
                                {children}
                              </code>
                            )
                          },
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-600 my-3 bg-blue-50 py-2">
                              {children}
                            </blockquote>
                          ),
                          hr: () => (
                            <hr className="border-gray-300 my-4" />
                          ),
                        }}
                      >
                        {processContentForMarkdown(newTemplate.content) || '*テンプレート内容が入力されると、ここにプレビューが表示されます*'}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setNewTemplate({ name: '', content: '' })
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <X className="h-4 w-4 inline mr-1" />
                  キャンセル
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newTemplate.name.trim() || !newTemplate.content.trim() || isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? '保存中...' : '保存'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* テンプレート一覧 */}
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">テンプレートがありません</p>
            <p className="text-sm text-gray-500 mt-2">
              新規作成ボタンからテンプレートを作成してください
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                {editingTemplate?.id === template.id ? (
                  /* 編集モード */
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    
                    {/* 編集時のリアルタイムプレビュー */}
                    <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 mb-2">
                      <Eye className="h-4 w-4" />
                      <span>リアルタイムプレビュー</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          テンプレート内容 (Markdown記法が使用できます)
                        </label>
                        <textarea
                          value={editingTemplate.content}
                          onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, content: e.target.value } : null)}
                          onKeyDown={handleEditKeyDown}
                          onCompositionStart={handleCompositionStart}
                          onCompositionEnd={handleCompositionEnd}
                          rows={12}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                        />
                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                          <p>• Enterで改行時に自動でMarkdown改行用のスペース2個が追加されます（IME変換中は除く）</p>
                          <p>• Shift+Enterで通常の改行ができます</p>
                          <p>• 保存時に全ての改行が自動的にMarkdown形式に変換されます</p>
                          <p>• Markdown記法: # 見出し、**太字**、*斜体*、- リスト、`コード` など</p>
                        </div>
                      </div>

                      <div className="hidden lg:block">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          プレビュー
                        </label>
                        <div className="h-80 p-4 border border-gray-300 rounded-md bg-gray-50 overflow-auto">
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="text-xl font-bold text-gray-900 mt-6 mb-3 first:mt-0 border-b border-gray-200 pb-2">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-lg font-bold text-gray-900 mt-5 mb-2">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-gray-700 pl-2">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-gray-700 pl-2">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="text-sm text-gray-700">
                                    {children}
                                  </li>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-gray-900">
                                    {children}
                                  </strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic text-gray-700">
                                    {children}
                                  </em>
                                ),
                                code: ({ children, className }) => {
                                  if (className?.includes('language-')) {
                                    return (
                                      <pre className="bg-gray-100 rounded-md p-3 overflow-x-auto mb-3 text-xs">
                                        <code className="font-mono text-gray-800">
                                          {children}
                                        </code>
                                      </pre>
                                    )
                                  }
                                  return (
                                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800">
                                      {children}
                                    </code>
                                  )
                                },
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-600 my-3 bg-blue-50 py-2">
                                    {children}
                                  </blockquote>
                                ),
                                hr: () => (
                                  <hr className="border-gray-300 my-4" />
                                ),
                              }}
                            >
                              {processContentForMarkdown(editingTemplate.content) || '*テンプレート内容が入力されると、ここにプレビューが表示されます*'}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingTemplate(null)}
                        className="px-3 py-1 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handleUpdate}
                        disabled={!editingTemplate.name.trim() || !editingTemplate.content.trim() || isSaving}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        <span>{isSaving ? '保存中...' : '保存'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 表示モード */
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          作成日: {formatDate(template.created_at)}
                        </span>
                        <button
                          onClick={() => setEditingTemplate(template)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="編集"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-md p-3">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                        {template.content}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}