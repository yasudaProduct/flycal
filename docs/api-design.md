# バックエンド API 設計ドキュメント

本ドキュメントは、flycal バックエンド（Hono + Cloudflare Workers）の API 設計をまとめたものである。
方針の前提は [tech-stack.md](./tech-stack.md) を参照のこと。

## 1. 設計方針

- フライヤー画像からイベント情報を抽出し、構造化 JSON を返すことを主目的とする
- LLM API キーはクライアントに持たせず、バックエンド経由でのみ呼び出す
- ユーザー登録は行わず、匿名ユーザーID で利用回数を管理する
- 画像は原則保存しない（解析のためにメモリ上で扱い、レスポンス後に破棄する）
- MVP では月間利用回数の上限を設け、超過時は解析を拒否する

## 2. 基本仕様

### 2.1 ベース URL

| 環境 | URL |
| --- | --- |
| ローカル | `http://localhost:8787` |
| 本番 | `https://<worker-name>.<account>.workers.dev`（独自ドメイン設定時はそちら） |

### 2.2 共通事項

- すべてのレスポンスは `application/json`（画像アップロードのリクエストのみ `multipart/form-data`）
- 文字コードは UTF-8
- 日時は ISO 8601（`YYYY-MM-DDTHH:mm:ssZ`）、日付は `YYYY-MM-DD`、タイムゾーンは原則 JST を想定
- API バージョンはパスにプレフィックスを付与する（`/api/v1/...`）

### 2.3 認証 / 匿名ユーザー識別

MVP ではアカウント認証を行わず、端末で生成した匿名ID をヘッダで送信して識別する。

| ヘッダ | 必須 | 内容 |
| --- | --- | --- |
| `X-Anonymous-Id` | ○ | アプリ初回起動時に端末内で生成・保存する UUID |
| `X-App-Version` | 任意 | クライアントのアプリバージョン（ログ・障害分析用） |

- 初めて受け取った `X-Anonymous-Id` は `users` テーブルに登録する
- 既存の場合は `last_seen_at` を更新する
- 匿名ID は厳密な不正利用対策にはならない前提（端末変更・再インストールで変わる）

## 3. 共通レスポンス形式

### 3.1 成功

各エンドポイント固有のデータをトップレベルに返す（後述の各 API 参照）。

### 3.2 エラー

```json
{
  "error": {
    "code": "USAGE_LIMIT_EXCEEDED",
    "message": "今月の解析回数の上限に達しました。",
    "details": {}
  }
}
```

| フィールド | 内容 |
| --- | --- |
| `error.code` | アプリ側で分岐に使う機械可読なコード |
| `error.message` | ユーザー表示も想定した説明 |
| `error.details` | 補足情報（任意） |

### 3.3 エラーコード一覧

| HTTP | code | 説明 |
| --- | --- | --- |
| 400 | `INVALID_REQUEST` | リクエスト形式不正（パラメータ欠落など） |
| 400 | `UNSUPPORTED_IMAGE` | 非対応の画像形式・サイズ超過 |
| 401 | `MISSING_ANONYMOUS_ID` | `X-Anonymous-Id` 未指定 |
| 422 | `EXTRACTION_FAILED` | LLM がイベント情報を抽出できなかった |
| 429 | `USAGE_LIMIT_EXCEEDED` | 月間利用上限超過 |
| 502 | `LLM_UPSTREAM_ERROR` | LLM API 呼び出しに失敗 |
| 500 | `INTERNAL_ERROR` | 想定外のサーバエラー |

## 4. エンドポイント一覧

| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| GET | `/api/v1/health` | ヘルスチェック | 不要 |
| POST | `/api/v1/analyze` | 画像からイベント情報を抽出 | 必要 |
| GET | `/api/v1/usage` | 当月の利用状況を取得 | 必要 |

> MVP の中核は `POST /api/v1/analyze`。`health` と `usage` は運用・UI 補助用。

## 5. エンドポイント詳細

### 5.1 GET /api/v1/health

稼働確認用。

**レスポンス 200**

```json
{
  "status": "ok",
  "version": "v1"
}
```

### 5.2 POST /api/v1/analyze

フライヤー画像を受け取り、LLM でイベント情報を抽出して構造化 JSON を返す。MVP の中核。

**リクエスト**

- `Content-Type: multipart/form-data`
- ヘッダ: `X-Anonymous-Id`（必須）

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `image` | file | ○ | フライヤー画像（JPEG / PNG / WebP / HEIC を想定） |
| `hint` | string | 任意 | ユーザーが補足する文脈（例: 「東京公演」） |

**制約**

- 最大ファイルサイズ: 10MB（超過時 `UNSUPPORTED_IMAGE`）
- 対応形式以外は `UNSUPPORTED_IMAGE`

**処理フロー**

1. `X-Anonymous-Id` を検証し、ユーザーを登録/更新
2. 当月の利用回数を確認し、上限超過なら `429 USAGE_LIMIT_EXCEEDED`
3. 画像を LLM（Gemini）へ渡し、構造化 JSON で抽出
4. `usage_monthly.analysis_count` をインクリメント
5. `analysis_logs` に結果を記録（画像本体は保存しない）
6. 抽出結果を返却

**レスポンス 200**

```json
{
  "analysisId": "a1b2c3d4",
  "event": {
    "title": "○○ LIVE TOUR 2026",
    "date": "2026-08-15",
    "startTime": "18:00",
    "endTime": "21:00",
    "venue": "Zepp Tokyo",
    "address": "東京都江東区青海1-3-11",
    "performers": ["アーティストA", "アーティストB"],
    "description": "開場 17:00 / 開演 18:00",
    "officialUrl": "https://example.com/live",
    "confidence": 0.82,
    "unknownFields": ["endTime"]
  },
  "candidates": [
    {
      "date": "2026-08-15",
      "startTime": "18:00",
      "venue": "Zepp Tokyo"
    }
  ],
  "usage": {
    "yearMonth": "2026-08",
    "analysisCount": 3,
    "limit": 5
  }
}
```

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `analysisId` | string | 解析の識別子（ログ照合用） |
| `event` | object | 抽出されたイベント情報（主候補） |
| `event.confidence` | number | 抽出全体の信頼度（0.0〜1.0） |
| `event.unknownFields` | string[] | 抽出できなかった/不確実な項目名 |
| `candidates` | object[] | 複数日程など、追加候補（任意） |
| `usage` | object | 当該リクエスト後の利用状況 |

> フライヤーは装飾・複数日程・縦書きなどで誤抽出が起こり得るため、アプリ側で必ず確認・修正画面を挟む前提。

**エラー例**

- `401 MISSING_ANONYMOUS_ID` / `400 UNSUPPORTED_IMAGE` / `429 USAGE_LIMIT_EXCEEDED` / `422 EXTRACTION_FAILED` / `502 LLM_UPSTREAM_ERROR`

### 5.3 GET /api/v1/usage

当月の利用状況を取得する。アプリ側で残回数表示などに利用。

**リクエスト**

- ヘッダ: `X-Anonymous-Id`（必須）

**レスポンス 200**

```json
{
  "yearMonth": "2026-08",
  "analysisCount": 3,
  "limit": 5,
  "remaining": 2
}
```

## 6. データモデル（D1）

詳細なテーブル定義は [tech-stack.md](./tech-stack.md) の「6. MVPで必要な主なテーブル案」を参照。API との対応は以下のとおり。

| テーブル | 主な参照 API | 役割 |
| --- | --- | --- |
| `users` | 全認証 API | 匿名ユーザーの登録・最終利用日時更新 |
| `usage_monthly` | `analyze` / `usage` | 月間利用回数のカウントと上限判定 |
| `analysis_logs` | `analyze` | 解析結果・モデル・トークン量・エラーの記録（画像は保存しない） |

## 7. LLM 連携

- 抽出は Gemini（リリース時は Vertex AI 経由、開発時は Gemini Developer API を併用検討）
- 画像と固定プロンプトを渡し、構造化 JSON（5.2 の `event` 形式）でレスポンスを得る
- レスポンスはスキーマ検証し、不正な場合は `EXTRACTION_FAILED` として扱う
- API キーは Cloudflare の Secret（`wrangler secret`）で管理し、クライアントへは渡さない

## 8. レート制御・利用上限

- 無料ユーザーは月 5 回まで解析可能（MVP の暫定値）
- カウントは `usage_monthly`（`user_id` × `year_month`）で管理
- 上限超過時は解析を行わず `429 USAGE_LIMIT_EXCEEDED` を返す
- 将来的にプレミアムプランで上限緩和・無制限を検討

## 9. 今後の拡張候補

- Web 版お試し解析用エンドポイント（.ics 生成 / Google Calendar 追加リンク）
- 課金状態管理 API（ストア課金との連携）
- 画像保存が必要になった場合の Cloudflare R2 連携
- Google Calendar API 直接連携（Google OAuth）
