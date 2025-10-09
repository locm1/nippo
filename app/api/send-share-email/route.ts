import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { nippoId, recipientEmail } = await request.json()

    if (!nippoId || !recipientEmail) {
      return NextResponse.json(
        { error: 'nippoIdとrecipientEmailが必要です' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // 日報が公開設定になっているかチェック
    const { data: nippo, error } = await supabase
      .from('nippo')
      .select('title, is_public')
      .eq('id', nippoId)
      .single()

    if (error || !nippo) {
      return NextResponse.json(
        { error: '日報が見つかりません' },
        { status: 404 }
      )
    }

    if (!nippo.is_public) {
      return NextResponse.json(
        { error: '非公開の日報は共有できません' },
        { status: 403 }
      )
    }

    const shareUrl = `${request.nextUrl.origin}/share/${nippoId}`
    
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">日報が共有されました</h2>
        <p>こんにちは、</p>
        <p>「<strong>${nippo.title}</strong>」という日報が共有されました。</p>
        <div style="margin: 20px 0;">
          <a href="${shareUrl}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            日報を閲覧する
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          このリンクをクリックすると日報の内容を閲覧できます。<br>
          URL: <a href="${shareUrl}">${shareUrl}</a>
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          このメールは日報太郎から自動送信されました。
        </p>
      </div>
    `

    const result = await sendEmail(
      recipientEmail,
      `日報「${nippo.title}」が共有されました`,
      emailHtml
    )

    if (result.success) {
      return NextResponse.json({ 
        message: 'メールを送信しました',
        shareUrl 
      })
    } else {
      return NextResponse.json(
        { error: 'メール送信に失敗しました' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('メール送信エラー:', error)
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
    )
  }
}