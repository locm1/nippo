'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase-client'
import { useEffect, useState } from 'react'

export default function AuthComponent() {
  const supabase = createClient()
  const [redirectTo, setRedirectTo] = useState('')

  useEffect(() => {
    setRedirectTo(`${window.location.origin}/auth/callback`)
  }, [])

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          日報アプリにログイン
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          redirectTo={redirectTo}
          localization={{
            variables: {
              sign_up: {
                email_label: 'メールアドレス',
                password_label: 'パスワード',
                button_label: '新規登録',
                loading_button_label: '登録中...',
                social_provider_text: '{{provider}} でログイン',
                link_text: 'アカウントをお持ちでない方はこちら',
                confirmation_text: '確認メールを送信しました',
              },
              sign_in: {
                email_label: 'メールアドレス',
                password_label: 'パスワード',
                button_label: 'ログイン',
                loading_button_label: 'ログイン中...',
                social_provider_text: '{{provider}} でログイン',
                link_text: '既にアカウントをお持ちの方はこちら',
              },
              magic_link: {
                email_input_label: 'メールアドレス',
                email_input_placeholder: 'あなたのメールアドレス',
                button_label: 'マジックリンクを送信',
                loading_button_label: '送信中...',
                confirmation_text: 'マジックリンクをメールで送信しました',
              },
              forgotten_password: {
                email_label: 'メールアドレス',
                password_label: '新しいパスワード',
                button_label: 'パスワードをリセット',
                loading_button_label: '送信中...',
                link_text: 'パスワードをお忘れですか？',
                confirmation_text: 'パスワードリセット用のメールを送信しました',
              },
            },
          }}
        />
      </div>
    </div>
  )
}