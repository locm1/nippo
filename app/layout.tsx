import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/components/auth-provider'
import Header from '@/components/header'

export const metadata: Metadata = {
  title: "日報アプリ",
  description: "日報を簡単に作成・管理できるアプリケーション",
};

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
