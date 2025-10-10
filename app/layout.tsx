import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/components/auth-provider'
import Header from '@/components/header'

export const metadata: Metadata = {
  title: '日報太郎 - 効率的な日報管理アプリ',
  description: 'Markdown記法対応、リアルタイムプレビュー、テンプレート機能で日報作成がこれまでにないほど簡単になります。無料で今すぐ始められます。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased bg-gray-50">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
