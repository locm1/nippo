# 日報作成アプリ

Markdown記法をサポートした日報作成・管理アプリケーションです。

## 🌟 機能

- ✅ **ユーザー認証**: Supabase Authenticationを使用した会員登録・ログイン
- ✅ **日報作成**: Markdown記法での日報作成
- ✅ **画像アップロード**: ファイル選択またはクリップボードからの画像貼り付け
- ✅ **日報管理**: 作成した日報の一覧表示・編集・削除
- ✅ **公開・非公開設定**: 日報の公開範囲を設定
- ✅ **共有機能**: 公開日報のURL共有・メール送信
- ✅ **レスポンシブデザイン**: PC・スマートフォン対応

## 🛠️ 技術スタック

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Email**: Nodemailer (開発環境用)

## 📋 セットアップ手順

### 1. プロジェクトのクローンと依存関係のインストール

```bash
cd /path/to/your/projects
git clone <your-repo-url>
cd nippo
npm install
```

### 2. Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com)でアカウント作成・ログイン
2. 新しいプロジェクトを作成
3. Database → SQL Editorで`supabase/schema.sql`の内容を実行
4. Authentication → Settings → Site URLを設定:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 3. 環境変数の設定

`.env.local`ファイルを作成し、Supabaseの設定値を入力:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email (ローカル開発用)
EMAIL_FROM=test@example.com
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
```

### 4. ローカルメール環境のセットアップ (オプション)

メール送信機能のテスト用:

```bash
# MailCatcherをインストール (Rubyが必要)
gem install mailcatcher

# MailCatcherを起動
mailcatcher

# Web UIでメールを確認: http://localhost:1080
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 📁 プロジェクト構造

```
nippo/
├── app/                    # Next.js App Router
│   ├── auth/              # 認証関連ページ
│   ├── dashboard/         # ダッシュボード
│   ├── nippo/             # 日報関連ページ
│   ├── share/             # 共有ページ
│   └── api/               # API ルート
├── components/            # Reactコンポーネント
├── lib/                   # ユーティリティ・設定
├── supabase/              # Supabaseスキーマ
└── scripts/               # セットアップスクリプト
```

## 🚀 使用方法

1. **アカウント登録**: `/auth`で新規登録またはログイン
2. **日報作成**: ダッシュボードから「新しい日報」をクリック
3. **Markdown記法**: 見出し、リスト、画像などを使用可能
4. **画像挿入**: ファイル選択またはCtrl+V（Cmd+V）で貼り付け
5. **公開設定**: 作成時または編集時に公開・非公開を選択
6. **共有**: 公開日報の共有URLをコピーまたはメール送信

## 📝 Markdown記法例

```markdown
# 大見出し
## 中見出し

**太字**、*斜体*

- 箇条書き
- リスト

1. 番号付きリスト
2. 順序リスト

> 引用文

`インラインコード`

![画像の説明](画像URL)
```

## 🔧 開発・デプロイ

### 型チェック
```bash
npm run build
```

### 本番デプロイ
- Vercel、Netlify等にデプロイ可能
- 環境変数を本番環境に設定
- Supabaseの本番URL設定を更新

## 📞 サポート

問題や質問がある場合は、GitHubのIssuesで報告してください。
