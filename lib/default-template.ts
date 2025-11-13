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
 */
export async function createDefaultTemplateIfNeeded(supabase: SupabaseClient, userId: string) {
  try {
    // 既存のテンプレートがあるかチェック
    const { data: existingTemplates, error: checkError } = await supabase
      .from('templates')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (checkError) {
      console.error('テンプレート確認エラー:', checkError)
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
      console.error('デフォルトテンプレート作成エラー:', createError)
    } else {
      console.log('デフォルトテンプレートを作成しました')
    }
  } catch (error) {
    console.error('デフォルトテンプレート作成処理エラー:', error)
  }
}