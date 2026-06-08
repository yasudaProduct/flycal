# FlyCal Mobile

ライブ・イベントのフライヤー画像からイベント情報を抽出し、カレンダーへ予定登録するスマホアプリ（Expo / React Native）。

## 使用技術（現時点）

### コア

| カテゴリ | 技術 | バージョン |
| --- | --- | --- |
| フレームワーク | Expo | ~56.0.4 |
| UI | React Native | 0.85.3 |
| 言語 | TypeScript | ~6.0.3 |
| UI ライブラリ | React | 19.2.3 |

### ナビゲーション

| パッケージ | 用途 |
| --- | --- |
| `@react-navigation/native` | 画面遷移の基盤 |
| `@react-navigation/native-stack` | スタックナビゲーション（Home → Analyzing → Result → Success 等） |
| `react-native-screens` | ネイティブ画面スタック |
| `react-native-safe-area-context` | ノッチ・ホームインジケーター対応 |

### Expo モジュール

| パッケージ | 用途 |
| --- | --- |
| `expo-image-picker` | 写真ライブラリからの選択・カメラ撮影 |
| `expo-linear-gradient` | ボタン等のグラデーション背景 |
| `expo-haptics` | カレンダー追加時の触覚フィードバック |
| `expo-status-bar` | ステータスバー（ライト/ダーク） |
| `expo-constants` | API ベース URL 等の設定読み取り |

### データ・API

| パッケージ / 方式 | 用途 |
| --- | --- |
| `@react-native-async-storage/async-storage` | 匿名ユーザー ID の端末永続化 |
| `fetch`（自前 `src/api/client.ts`） | バックエンド API（`/api/v1`）との通信 |
| `expo-constants` + `app.json` extra | API ベース URL の解決 |

### 開発ツール

| ツール | 用途 |
| --- | --- |
| ESLint 9 + eslint-plugin-react / react-hooks | 静的解析 |
| Expo Dev Server（Metro） | 開発時バンドル・ホットリロード |

### 未導入（計画・docs 参照）

- `expo-calendar` — 端末カレンダー連携（`docs/tech-stack.md` で MVP 方針として記載、現状は Success 画面遷移のみ）
- `expo-dev-client` / EAS Build — Development Build（SDK 56 は App Store 版 Expo Go 非対応のため、実機検証時に検討）

## アーキテクチャ

```
index.ts          → registerRootComponent(App)
App.tsx           → NavigationContainer + Stack Navigator
src/
├── screens/      → 画面コンポーネント（Home, Analyzing, Result, Success, History）
├── api/client.ts → 匿名 ID 管理・画像解析 API 呼び出し
├── config.ts     → API ベース URL 解決
├── theme.ts      → 色・タイポグラフィ・spacing トークン
├── types.ts      → 画面パラメータ・EventData 型
└── mockData.ts   → ホーム画面のモック履歴データ
```

### 画面フロー

```
Home
 ├─ 写真選択 / カメラ撮影 → Analyzing（API 解析）→ Result → Success
 ├─ イベント行タップ → Result
 └─ 履歴アイコン → History
```

## コマンド

```bash
pnpm start      # Expo Dev Server 起動
pnpm ios        # iOS シミュレータ（macOS）
pnpm android    # Android エミュレータ
pnpm web        # ブラウザ（react-native-web）
pnpm lint       # ESLint
```

ルートからは `pnpm dev:mobile` でも起動可能。

## 実機確認

- **iOS シミュレータ**: `pnpm ios` が最も手軽
- **iPhone 実機 + App Store Expo Go**: SDK 56 非対応のため現状は不可。Development Build または TestFlight ベータを検討
- **Android 実機**: [expo.dev/go](https://expo.dev/go) から SDK 56 版 Expo Go をインストール

## API 設定

`app.json` の `expo.extra.apiBaseUrl` でバックエンド URL を指定可能。未設定時は Dev Server の LAN ホストから `http://<host>:8787` を自動導出（`src/config.ts`）。
