'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from './auth-provider'
import { Save, Eye, EyeOff, Upload, Image as ImageIcon, Calendar } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { getTodayDate, formatDateToJapanese, isToday } from '@/lib/date-utils'

interface NippoFormProps {
  initialData?: {
    id?: string
    content: string
    is_public: boolean
    images?: string[]
    report_date?: string
  }
}

export default function NippoForm({ initialData }: NippoFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [content, setContent] = useState(initialData?.content || '')
  const [isPublic, setIsPublic] = useState(initialData?.is_public || false)
  const [reportDate, setReportDate] = useState(initialData?.report_date || getTodayDate())
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set())
  const [isComposing, setIsComposing] = useState(false)

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!user) {
      console.error('ユーザーがログインしていません')
      return null
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    try {
      console.log('画像アップロード開始:', { fileName, filePath, userId: user.id })
      
      const { data, error: uploadError } = await supabase.storage
        .from('nippo-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('画像アップロードエラー:', uploadError)
        alert(`画像アップロードに失敗しました: ${uploadError.message}`)
        return null
      }

      console.log('アップロード成功:', data)

      const { data: publicData } = supabase.storage
        .from('nippo-images')
        .getPublicUrl(filePath)

      console.log('公開URL取得:', publicData.publicUrl)
      return publicData.publicUrl
    } catch (error) {
      console.error('画像アップロードエラー:', error)
      alert('画像アップロードに失敗しました')
      return null
    }
  }, [user, supabase.storage])

  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue

      const tempId = uuidv4()
      setUploadingImages(prev => new Set(prev).add(tempId))

      const imageUrl = await uploadImage(file)
      if (imageUrl) {
        setImages(prev => [...prev, imageUrl])
        setContent(prev => prev + `\n![${file.name}](${imageUrl})\n`)
      }

      setUploadingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(tempId)
        return newSet
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !isComposing) {
      const textarea = e.currentTarget
      const cursorPosition = textarea.selectionStart
      const textBeforeCursor = content.slice(0, cursorPosition)
      const textAfterCursor = content.slice(cursorPosition)
      
      // 現在の行を取得
      const lines = textBeforeCursor.split('\n')
      const currentLine = lines[lines.length - 1]
      
      if (e.shiftKey) {
        // Shift+Enterの場合は通常の改行（スペースなし）
        e.preventDefault()
        const newContent = textBeforeCursor + '\n' + textAfterCursor
        setContent(newContent)
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1
        }, 0)
      } else {
        // 通常のEnterの場合は、Markdown改行用のスペース2個を追加
        e.preventDefault()
        
        // 現在の行がすでにスペース2個で終わっている場合は、そのまま改行
        if (currentLine.endsWith('  ')) {
          const newContent = textBeforeCursor + '\n' + textAfterCursor
          setContent(newContent)
          
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1
          }, 0)
        } else {
          // スペース2個を追加してから改行
          const newContent = textBeforeCursor + '  \n' + textAfterCursor
          setContent(newContent)
          
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

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          const tempId = uuidv4()
          setUploadingImages(prev => new Set(prev).add(tempId))

          const imageUrl = await uploadImage(file)
          if (imageUrl) {
            setImages(prev => [...prev, imageUrl])
            const cursorPosition = (e.target as HTMLTextAreaElement).selectionStart
            const newContent = content.slice(0, cursorPosition) + 
              `\n![画像](${imageUrl})\n` + 
              content.slice(cursorPosition)
            setContent(newContent)
          }

          setUploadingImages(prev => {
            const newSet = new Set(prev)
            newSet.delete(tempId)
            return newSet
          })
        }
      }
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

  // プレビューコンテンツをメモ化してパフォーマンス向上
  const previewContent = useMemo(() => {
    const processedContent = processContentForMarkdown(content)
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          img: ({ src, alt }) => (
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full h-auto rounded-md shadow-sm border my-2"
            />
          ),
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
        {processedContent || '*内容が入力されると、ここにプレビューが表示されます*'}
      </ReactMarkdown>
    )
  }, [content, processContentForMarkdown])

  const handleSave = async () => {
    if (!user || !content.trim()) return

    setIsSaving(true)

    try {
      const processedContent = processContentForMarkdown(content.trim())
      const nippoData = {
        content: processedContent,
        is_public: isPublic,
        images: images.length > 0 ? images : null,
        report_date: reportDate,
        user_id: user.id,
      }

      if (initialData?.id) {
        // 更新
        const { error } = await supabase
          .from('nippo')
          .update(nippoData)
          .eq('id', initialData.id)

        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase
          .from('nippo')
          .insert(nippoData)

        if (error) throw error
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto p-0 md:p-6">
      <div className="bg-white rounded-lg shadow-md p-6">


        <div className="mb-6 flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-500" />
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">報告日：</label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* デスクトップレイアウト */}
        <div className="mb-4 hidden sm:flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">公開する</span>
            </label>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border rounded-md hover:bg-gray-50"
            >
              <Upload className="h-4 w-4" />
              <span>画像アップロード</span>
            </button>

            {uploadingImages.size > 0 && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <ImageIcon className="h-4 w-4 animate-pulse" />
                <span>画像をアップロード中...</span>
              </div>
            )}
          </div>
          
          {/* デスクトップ用の状態表示 */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Eye className="h-4 w-4" />
            <span>リアルタイムプレビュー</span>
          </div>
        </div>

        {/* モバイルレイアウト */}
        <div className="mb-4 sm:hidden space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">公開する</span>
          </label>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border rounded-md hover:bg-gray-50"
          >
            <Upload className="h-4 w-4" />
            <span>画像アップロード</span>
          </button>

          {uploadingImages.size > 0 && (
            <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
              <ImageIcon className="h-4 w-4 animate-pulse" />
              <span>画像をアップロード中...</span>
            </div>
          )}

          <button
            onClick={() => setIsPreview(!isPreview)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border rounded-md hover:bg-gray-50"
            title={isPreview ? '編集画面に戻る' : 'プレビューを表示'}
          >
            {isPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{isPreview ? '編集' : 'プレビュー'}</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
          className="hidden"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={isPreview ? 'hidden lg:block' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              内容 (Markdown記法が使用できます)
            </label>
            <textarea
              placeholder="今日の業務内容を記入してください...&#10;&#10;**例:**&#10;## 今日やったこと&#10;- タスク1&#10;- タスク2&#10;&#10;## 明日やること&#10;- タスク3&#10;&#10;## 所感&#10;今日は..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              className="w-full h-96 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
            />
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <p>• クリップボードから画像を貼り付けることができます (Ctrl+V / Cmd+V)</p>
              <p>• Enterで改行時に自動でMarkdown改行用のスペース2個が追加されます（IME変換中は除く）</p>
              <p>• Shift+Enterで通常の改行ができます</p>
              <p>• 保存時に全ての改行が自動的にMarkdown形式に変換されます</p>
              <p>• Markdown記法: # 見出し、**太字**、*斜体*、- リスト、`コード` など</p>
            </div>
          </div>

          <div className={!isPreview ? 'hidden lg:block' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プレビュー
            </label>
            <div className="h-96 p-4 border border-gray-300 rounded-md bg-gray-50 overflow-auto">
              <div className="prose prose-sm max-w-none">
                {previewContent}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim() || isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? '保存中...' : '保存'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}