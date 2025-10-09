#!/bin/bash

# ローカルメール開発環境のセットアップ
echo "🚀 ローカルメール開発環境をセットアップしています..."

# MailCatcherをインストール (Ruby gem)
if ! command -v mailcatcher &> /dev/null; then
    echo "📧 MailCatcherをインストールしています..."
    gem install mailcatcher
fi

echo "✅ MailCatcherがインストール済みです"
echo ""
echo "📌 使用方法:"
echo "1. MailCatcherを起動: mailcatcher"
echo "2. Web UI: http://localhost:1080"
echo "3. SMTP設定: localhost:1025"
echo ""
echo "🔧 .env.localの設定例:"
echo "SMTP_HOST=localhost"
echo "SMTP_PORT=1025"
echo "EMAIL_FROM=test@example.com"
echo ""
echo "📝 MailCatcherを起動するには以下を実行してください:"
echo "mailcatcher"