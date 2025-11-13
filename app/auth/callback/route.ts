import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { createDefaultTemplateIfNeeded } from '@/lib/default-template'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // ログイン成功後、デフォルトテンプレートを作成（存在しない場合）
      await createDefaultTemplateIfNeeded(supabase, data.user.id)
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth?message=Could not authenticate user`)
}