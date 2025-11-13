import { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * ユーザーのプロファイルを作成または更新する
 * @param supabase Supabaseクライアント
 * @param user ユーザー情報
 */
export async function createOrUpdateProfile(supabase: SupabaseClient, user: User) {
  try {
    const profileData = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'ユーザー',
      avatar_url: user.user_metadata?.avatar_url || null,
    }

    // プロファイルが既に存在するかチェック
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = No rows found
      console.error('プロファイル確認エラー:', checkError)
      return
    }

    if (existingProfile) {
      // 既存プロファイルを更新
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email: profileData.email,
          name: profileData.name,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('プロファイル更新エラー:', updateError)
      }
    } else {
      // 新しいプロファイルを作成
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(profileData)

      if (insertError) {
        console.error('プロファイル作成エラー:', insertError)
      }
    }
  } catch (error) {
    console.error('プロファイル処理エラー:', error)
  }
}

/**
 * プロファイルを取得する
 * @param supabase Supabaseクライアント
 * @param userId ユーザーID
 */
export async function getProfile(supabase: SupabaseClient, userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('プロファイル取得エラー:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('プロファイル取得処理エラー:', error)
    return null
  }
}