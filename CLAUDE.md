# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

ライブ・イベントのフライヤー画像からイベント情報を抽出し、端末カレンダーへ予定登録するスマホアプリ。pnpm workspaces によるモノレポで3アプリを管理する。

## コマンド

### セットアップ

```bash
pnpm install   # ルートで実行すると全アプリの依存が一括インストールされる
```

### 開発サーバ起動（ルートから）

```bash
pnpm dev:backend   # Cloudflare Workers ローカル起動
pnpm dev:web       # Next.js 開発サーバ (http://localhost:3000)
pnpm dev:mobile    # Expo Dev Server (QR コードを Expo Go で読み取り)
```

### アプリごとのコマンド

```bash
# backend
cd apps/backend
pnpm dev           # wrangler dev でローカル起動
pnpm deploy        # Cloudflare Workers へデプロイ
pnpm cf-typegen    # wrangler.jsonc から Cloudflare バインディング型を生成

# web
cd apps/web
pnpm build         # 本番ビルド
pnpm lint          # ESLint

# mobile
cd apps/mobile
pnpm ios           # iOS シミュレータ起動 (macOS のみ)
pnpm android       # Android エミュレータ起動
```

## アーキテクチャ

```
flycal/
├── apps/
│   ├── backend/   Hono + Cloudflare Workers  (APIサーバ)
│   ├── web/       Next.js 16 (App Router) + Tailwind CSS v4  (LP)
│   └── mobile/    Expo 56 + React Native 0.85  (メインアプリ)
└── pnpm-workspace.yaml
```

### backend (`apps/backend`)

- **Hono** フレームワークで Cloudflare Workers 上に API を構築
- エントリポイント: `src/index.ts`、`wrangler.jsonc` でデプロイ設定を管理
- 今後 Cloudflare D1（SQLite互換）をバインディングとして追加予定
- 今後 Gemini (Vertex AI 経由) で画像→イベント情報の抽出処理を実装予定
- `cf-typegen` で `wrangler.jsonc` のバインディング定義から TypeScript 型を生成する

### web (`apps/web`)

- Next.js 16 App Router。`src/app/` 配下にレイアウトとページを配置するルーティング
- Tailwind CSS v4（PostCSS プラグイン経由）

### mobile (`apps/mobile`)

- Expo 56 + React Native。エントリポイントは `index.ts` → `App.tsx`
- `apps/mobile/.claude/settings.json` で Expo Claude プラグインが有効化されている

## 技術スタック

| レイヤ | 採用技術 |
| --- | --- |
| モバイル | React Native 0.85, Expo 56, TypeScript 6 |
| Web / LP | Next.js 16, React 19, Tailwind CSS v4 |
| バックエンド | Hono, Cloudflare Workers |
| DB (予定) | Cloudflare D1 |
| LLM (予定) | Gemini (Vertex AI 経由) |

## 開発環境要件

- Node.js 20 以上（推奨 22）
- pnpm 10 以上
- バックエンドデプロイ時: `wrangler login` で Cloudflare 認証済みであること
- モバイル実機確認: Expo Go アプリ、または iOS / Android シミュレータ

## ブランチ運用

- `main` が本流
- 機能開発はトピックブランチで行い、PR 経由でマージ
