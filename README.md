# flycal

ライブ・イベントのフライヤー画像からイベント情報を抽出し、端末カレンダーへ予定登録するスマホアプリ。

本リポジトリはモバイルアプリ・LP・バックエンドを pnpm workspaces で管理するモノレポです。

## 構成

```
flycal/
├── apps/
│   ├── backend/   Hono + Cloudflare Workers      バックエンドAPI
│   ├── web/       Next.js 16 (App Router) + Tailwind v4   LP / Web
│   └── mobile/    Expo + React Native (TypeScript)   スマホアプリ
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

### 技術スタック

| レイヤ | 採用技術 |
| --- | --- |
| モバイル | React Native, Expo, TypeScript |
| LP / Web | Next.js 16 (App Router), Tailwind CSS v4 |
| バックエンド | Hono, Cloudflare Workers |
| DB (予定) | Cloudflare D1 |
| LLM (予定) | Gemini (Vertex AI 経由) |

詳細な技術選定の背景はチームの技術選定ドキュメントを参照。

## 前提環境

- Node.js 20 以上 (推奨: 22)
- pnpm 10 以上
- (モバイル実機確認) Expo Go アプリ、または iOS/Android シミュレータ
- (バックエンドデプロイ時) Cloudflare アカウントと `wrangler login`

## セットアップ

リポジトリ直下で一度だけ実行すれば、3アプリすべての依存がインストールされます。

```bash
pnpm install
```

## 開発コマンド

ルートからショートカットを実行できます。

```bash
pnpm dev:backend   # Cloudflare Workers ローカル起動 (wrangler dev)
pnpm dev:web       # Next.js 開発サーバ起動 (http://localhost:3000)
pnpm dev:mobile    # Expo Dev Server 起動 (QR コードを Expo Go で読み取り)
```

各アプリのディレクトリへ直接 `cd` して `pnpm <script>` を実行することも可能です。

### apps/backend

```bash
cd apps/backend
pnpm dev           # ローカル起動
pnpm deploy        # Cloudflare Workers へデプロイ
pnpm cf-typegen    # wrangler.jsonc から型定義を生成
```

### apps/web

```bash
cd apps/web
pnpm dev           # 開発サーバ
pnpm build         # 本番ビルド
pnpm start         # 本番モード起動
pnpm lint          # ESLint
```

### apps/mobile

```bash
cd apps/mobile
pnpm start         # Expo Dev Server (QR コード表示)
pnpm ios           # iOS シミュレータで起動 (macOS のみ)
pnpm android       # Android エミュレータで起動
pnpm web           # ブラウザで起動
```

## ブランチ運用

- `main`: 本流
- 機能開発は個別のトピックブランチで行い、PR 経由でマージ
