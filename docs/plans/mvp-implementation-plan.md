# MVP 実装計画

## 概要

現在のコードベースの実装状況を踏まえ、MVPリリースまでに必要な作業を優先度順にまとめる。
技術方針の前提は [docs/tech-stack.md](../docs/tech-stack.md)、API設計は [docs/api-design.md](../docs/api-design.md) を参照。

### 現状サマリー

| 領域                                                             | 状態                          |
| ---------------------------------------------------------------- | ----------------------------- |
| バックエンド骨格 (Hono, ルーティング, エラーハンドリング)        | 完了                          |
| モバイルUI全画面 (Home / Analyzing / Result / Success / History) | 完了                          |
| 匿名ID生成・永続化 (AsyncStorage)                                | 完了                          |
| モバイル→バックエンド 画像送信                                   | 完了                          |
| **LLM連携 (Gemini)**                                             | **モックのみ**                |
| **DB (Cloudflare D1)**                                           | **モックのみ（インメモリ）**  |
| **カレンダー登録 (Expo Calendar)**                               | **UI表示のみ・未登録**        |
| **Web / LP**                                                     | **Next.jsデフォルト画面のみ** |

---

## Phase 1: LLM連携（Gemini）

### 目標

`apps/backend/src/mocks/llm.ts` のモックを、実際の Gemini API 呼び出しに差し替える。

### タスク

#### 1-1. Gemini Developer API で動作検証

- Gemini Developer API キーを取得し、`wrangler secret` で `GEMINI_API_KEY` として登録
- `wrangler.jsonc` に `vars` または `secrets` の設定を追加
- curl / スクリプトで画像→構造化JSON の抽出が正しく動くか確認

#### 1-2. プロンプト設計

- フライヤー画像から以下フィールドを抽出するシステムプロンプトを作成
  - `title`, `date`, `startTime`, `endTime`, `venue`, `address`, `performers`, `description`, `officialUrl`, `confidence`, `unknownFields`
- 複数日程・縦書き・手書きフォント等を考慮した指示を含める
- Gemini の `responseSchema` 機能（構造化出力）を活用する

#### 1-3. バックエンド実装

- `apps/backend/src/services/gemini.ts` を新規作成
  - Gemini API (`@google/generative-ai` または fetch 直叩き) でマルチモーダル呼び出し
  - レスポンスのスキーマ検証（不正な場合は `EXTRACTION_FAILED`）
- `mocks/llm.ts` を本実装に差し替え
- `wrangler.jsonc` に `nodejs_compat` フラグ追加（Node.js API が必要な場合）

#### 1-4. ローカル動作確認

- `pnpm dev:backend` + モバイルシミュレータで実際のフライヤー画像を解析
- 信頼度・抽出精度を複数フライヤーで検証

### 完了条件

- 実際のフライヤー画像を送信すると、正しいイベント情報が返ってくる
- `confidence` が概ね実態を反映している
- 読み取れない場合に `EXTRACTION_FAILED` が返る

---

## Phase 2: DB（Cloudflare D1）

**優先度: 高** — LLM連携後すぐに着手。利用回数制限とログ記録が正しく動くために必要。現状はサーバー再起動でリセットされる。

### 目標

`apps/backend/src/mocks/store.ts` のインメモリモックを Cloudflare D1 に差し替え、永続化する。

### タスク

#### 2-1. D1 データベース作成

```bash
wrangler d1 create flycal-db
```

- 取得した `database_id` を `wrangler.jsonc` の `d1_databases` に設定
- `pnpm cf-typegen` で TypeScript 型を再生成

#### 2-2. マイグレーションファイル作成

`apps/backend/migrations/` 配下に以下を作成:

```sql
-- 0001_create_users.sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  anonymous_id TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_users_anonymous_id ON users(anonymous_id);

-- 0002_create_usage_monthly.sql
CREATE TABLE usage_monthly (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  year_month TEXT NOT NULL,
  analysis_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, year_month)
);

-- 0003_create_analysis_logs.sql
CREATE TABLE analysis_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK(status IN ('success', 'failed')),
  extracted_event_date TEXT,
  llm_model TEXT,
  token_usage INTEGER,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### 2-3. DB アクセス層の実装

- `apps/backend/src/db/users.ts` — ユーザー登録・`last_seen_at` 更新
- `apps/backend/src/db/usage.ts` — 月間利用回数の取得・インクリメント・上限チェック
- `apps/backend/src/db/logs.ts` — 解析ログ記録

#### 2-4. ルートへの組み込み

- `routes/analyze.ts` の `mocks/store` 参照を DB アクセス層に差し替え
- `middleware/anonymous.ts` で `users` テーブルへの登録/更新を追加
- `mocks/store.ts` を削除

#### 2-5. ローカル・本番確認

- `wrangler dev` でローカル D1 を使った動作確認
- `wrangler d1 migrations apply` で本番 D1 に適用

### 完了条件

- サーバー再起動後も利用回数が維持される
- 月5回超過で `USAGE_LIMIT_EXCEEDED` が返る
- `analysis_logs` にレコードが記録される

---

## Phase 3: カレンダー登録（Expo Calendar）

**優先度: 高** — MVPのユーザーフロー最終ステップ。UI は完成しているがカレンダーへの実際の登録が未実装。

### 目標

ResultScreen の「カレンダーに追加」ボタンで、端末のカレンダーに実際に予定を登録する。

### タスク

#### 3-1. パッケージ追加

```bash
cd apps/mobile
npx expo install expo-calendar
```

#### 3-2. 権限設定

`app.json` の `plugins` に `expo-calendar` を追加:

```json
{
  "plugins": [
    [
      "expo-calendar",
      {
        "calendarPermission": "フライヤーからイベントをカレンダーに追加するために使用します。"
      }
    ]
  ]
}
```

#### 3-3. カレンダー登録ロジック実装

`apps/mobile/src/utils/calendar.ts` を新規作成:

- `requestCalendarPermission()` — 権限リクエスト
- `addEventToCalendar(event: EventData)` — イベント登録
  - デフォルトカレンダーを取得
  - `Calendar.createEventAsync()` でイベントを作成
  - 日付・時間のパース（`date` + `startTime`/`endTime` → Date オブジェクト）

#### 3-4. ResultScreen への組み込み

- `handleAddToCalendar` で `addEventToCalendar()` を呼び出す
- 権限拒否・登録失敗時のエラーハンドリングと Alert 表示
- 成功時に SuccessScreen へ遷移（現状のフローを維持）

#### 3-5. 実機確認

- iOS シミュレータ / 実機でカレンダーへの登録を確認
- 権限ダイアログが初回のみ表示されることを確認

### 完了条件

- 「カレンダーに追加」を押すと端末カレンダーにイベントが登録される
- 日付・時間・タイトル・会場が正しく入る
- 権限拒否時にわかりやすいメッセージが表示される

---

## Phase 4: Web / LP

**優先度: 中** — MVPのアプリ機能とは独立。AppStore 申請前後に着手でよい。

### 目標

`apps/web` にサービス紹介 LP を実装し、Cloudflare Pages にデプロイする。

### タスク

#### 4-1. LP コンテンツ設計

- ヒーローセクション（キャッチコピー + スクリーンショット）
- 機能紹介（フライヤー→カレンダーの3ステップ）
- AppStore / Google Play ダウンロードボタン（リリース後に追加）

#### 4-2. LP 実装

- `apps/web/src/app/page.tsx` を LP に置き換え
- Tailwind CSS v4 でスタイリング
- レスポンシブ対応（モバイルファースト）

#### 4-3. Cloudflare Pages デプロイ設定

- `wrangler.jsonc`（web 用）または Cloudflare Dashboard でPages プロジェクト作成
- GitHub Actions または Cloudflare の自動デプロイを設定

#### 4-4. Web お試し解析（任意・Phase4後半）

tech-stack.md の「将来的にWebお試し機能」に相当。MVPでは必須ではないが、余裕があれば実装:

- 画像アップロード UI
- バックエンドの `/api/v1/analyze` を呼び出し結果を表示
- `.ics` ファイルのダウンロード

### 完了条件

- LP が Cloudflare Pages で公開されている
- スマホ・PC いずれでも正しく表示される

---

## フェーズサマリー

```
Phase 1: LLM連携          ← MVP の心臓部。最初に着手
  ↓
Phase 2: D1 DB            ← Phase 1 完了後すぐ。利用制限の永続化
  ↓
Phase 3: カレンダー登録    ← Phase 1・2 が固まったら。UX の仕上げ
  ↓
Phase 4: Web / LP         ← リリース直前・直後。独立して進めても良い
```

Phase 1〜3 が完了した時点で、アプリとして最低限のMVPフローが成立する。

---

## 未着手のその他項目（MVP後）

以下は tech-stack.md に記載があるが MVP では対応しない。

| 項目                         | 理由                                   |
| ---------------------------- | -------------------------------------- |
| Vertex AI への切り替え       | Gemini Developer API でMVP検証後に移行 |
| 広告実装                     | リリース後のフェーズ                   |
| サブスク課金                 | ストア審査・課金基盤の整備が必要       |
| Google Calendar API 直接連携 | 端末カレンダー連携で代替可能           |
| 解析履歴のクラウド保存       | 匿名IDの制約もあり、MVP後に設計        |
| Cloudflare R2 画像保存       | 画像は保存しない方針を維持             |
