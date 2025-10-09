'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // ビルド時やSSRでの環境変数不足時のフォールバック
    if (typeof window === 'undefined') {
      console.warn('Supabase環境変数が設定されていません（SSR/ビルド時）')
      // ダミーのクライアントを返す（実際には使用されない）
      return createBrowserClient('http://localhost:54321', 'dummy-key')
    } else {
      throw new Error('Supabase環境変数が設定されていません')
    }
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}