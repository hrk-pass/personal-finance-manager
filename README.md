# 個人財務管理アプリ

シンプルで使いやすい個人財務管理アプリケーション。銀行口座、電子マネー、財布などの資産を一元管理し、収支を記録できます。

## 機能

- Google認証によるセキュアなログイン
- 複数の口座タイプ（銀行口座、電子マネー、財布）の管理
- 収入・支出の記録
- 口座間の送金記録
- ダッシュボードでの残高確認と取引履歴

## 技術スタック

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [Firebase](https://firebase.google.com/) - 認証とデータベース
- [Tailwind CSS](https://tailwindcss.com/) - スタイリング
- [TypeScript](https://www.typescriptlang.org/) - 型安全な開発
- [Vercel](https://vercel.com/) - ホスティング

## セットアップ

1. リポジトリをクローン
```bash
git clone [your-repo-url]
cd personal-finance-manager
```

2. 依存関係をインストール
```bash
npm install
```

3. Firebaseプロジェクトの設定
- [Firebase Console](https://console.firebase.google.com/)で新しいプロジェクトを作成
- Webアプリを追加し、設定を取得
- `.env.local`ファイルを作成し、以下の環境変数を設定：
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

4. 開発サーバーを起動
```bash
npm run dev
```

## デプロイ

1. [Vercel](https://vercel.com/)でアカウントを作成
2. このリポジトリをインポート
3. 環境変数を設定
4. デプロイを実行

## ライセンス

MIT

## 作者

[Your Name]
