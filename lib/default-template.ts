import { SupabaseClient } from '@supabase/supabase-js'

// デフォルトテンプレートの内容
const DEFAULT_TEMPLATE_CONTENT = `## 機能/タスク名  

### 概要  

何を、なぜ、どう行ったかを1〜2行で  

### 実施時間  

09:30 – 11:00  

### コミット履歴、もしくは成果物  

http://  

## 機能/タスク名  

### 概要  

何を、なぜ、どう行ったかを1〜2行で  

### 実施時間  

09:30 – 11:00  

### コミット履歴、もしくは成果物  

http://  

## 機能/タスク名  

### 概要  

何を、なぜ、どう行ったかを1〜2行で  

### 実施時間  

09:30 – 11:00  

### コミット履歴、もしくは成果物  

http://  `

/**
 * ユーザーにデフォルトテンプレートが存在しない場合、作成する
 * @param supabase Supabaseクライアント
 * @param userId ユーザーID
 * @param maxRetries 最大リトライ回数
 */
export async function createDefaultTemplateIfNeeded(supabase: SupabaseClient, userId: string, maxRetries = 3) {
  if (!userId) {
    console.warn('ユーザーIDが無効です')
    return
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // まずユーザーが存在するかチェック
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user || userData.user.id !== userId) {
        console.warn(`ユーザー確認失敗 (試行 ${attempt}/${maxRetries})`, userError)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // 指数的バックオフ
          continue
        }
        return
      }

      // 既存のテンプレートがあるかチェック
      const { data: existingTemplates, error: checkError } = await supabase
        .from('templates')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      if (checkError) {
        console.error(`テンプレート確認エラー (試行 ${attempt}/${maxRetries}):`, checkError)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        }
        return
      }

      // 既存のテンプレートがある場合は作成しない
      if (existingTemplates && existingTemplates.length > 0) {
        return
      }

      // デフォルトテンプレートを作成
      const { error: createError } = await supabase
        .from('templates')
        .insert({
          name: 'デフォルト日報テンプレート',
          content: DEFAULT_TEMPLATE_CONTENT,
          user_id: userId,
        })

      if (createError) {
        // 外部キー制約エラーの場合はリトライ
        if (createError.code === '23503' && attempt < maxRetries) {
          console.warn(`デフォルトテンプレート作成エラー (試行 ${attempt}/${maxRetries}):`, createError)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        }
        console.error('デフォルトテンプレート作成エラー:', createError)
        return
      }

      return

    } catch (error) {
      console.error(`デフォルトテンプレート作成処理エラー (試行 ${attempt}/${maxRetries}):`, error)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        continue
      }
    }
  }

  console.error(`デフォルトテンプレート作成に失敗しました（${maxRetries}回試行）`)
}