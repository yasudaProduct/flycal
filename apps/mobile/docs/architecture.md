# モバイルアプリ 構成方針

flycal モバイルアプリ（Expo + React Native）の内部構成の方針をまとめる。
プロジェクト全体の技術選定は [docs/tech-stack.md](../../../docs/tech-stack.md) を参照。

## 1. 前提

- ビジネスロジックは薄い。アプリの主責務は **UI / 端末機能連携 / バックエンド通信** に限られる
- 本線は `Home → Analyzing → Result → Success` の一方向フロー
- 想定機能は 5〜7 画面規模で、急増しない見込み（解析・確認修正・履歴・設定・利用回数・将来の課金/広告）

この規模では **レイヤー型（種類でフォルダを分ける）構成** を採用する。
機能が大きく増える兆しが出た段階で feature 型への移行を再検討する。

## 2. 状態の持ち方

### 方針

- **本線フローは navigation params で受け渡す**（状態管理ライブラリは導入しない）
- 複数画面で共有する状態（履歴）だけ、**ローカル永続化 + 薄い hook** で扱う

### 背景

navigation params が一般に問題になるのは次のケース。

| 問題 | 内容 | flycal での該当 |
| --- | --- | --- |
| 画面をまたいだ更新が伝わらない | params は渡したら固定。戻り先の一覧に反映されない | 履歴と同期する時のみ |
| バケツリレー | 中間画面が中継用 params を持つ | ほぼ無し（フローが浅い） |
| 復元できない | kill→通知/ディープリンク復帰で params は失われる | MVP では許容 |
| 共有状態を持てない | 複数画面が同じ一覧を見る | **履歴で該当** |

本線は一方向にデータを渡すだけなので params が最も得意な形であり、ライブラリは不要。
唯一の例外である「履歴の一覧共有」は、状態管理ライブラリではなく
`services/historyRepo`（AsyncStorage）+ `hooks/useHistory` で解決する。

## 3. ディレクトリ構成

```
src/
  screens/        画面（将来 Edit / Settings が増える）
  components/      共通 UI 部品（EventRow, PrimaryButton など）
  api/
    client.ts      バックエンド通信（analyze / usage）
  services/        端末機能・永続化のラッパ（画面から隔離）
    calendar.ts    expo-calendar（カレンダー追加）
    imagePicker.ts expo-image-picker
    storage.ts     AsyncStorage 低レベルラッパ
    historyRepo.ts 履歴のローカル保存
  hooks/
    useHistory.ts  履歴の読み書き（Home / History が共有）
    useAnalyze.ts  解析呼び出し + ローディング/エラー
  models/
    event.ts       EventData 型 + API↔UI 変換
  navigation/      （任意）Stack 型定義の置き場
  theme.ts         デザイントークン
  config.ts        API ベース URL 解決
```

### レイヤーの責務

| レイヤー | 責務 | 依存してよい先 |
| --- | --- | --- |
| `screens` | 画面の組み立て・遷移 | components / hooks / services / models |
| `components` | 再利用 UI 部品（状態を持たない） | theme / models |
| `hooks` | 画面横断ロジック・状態 | api / services / models |
| `api` | バックエンド HTTP 通信 | models / config |
| `services` | 端末機能・永続化のラッパ | （外部 SDK のみ） |
| `models` | 型と変換（純粋関数） | なし |

- 画面は端末 SDK を直接呼ばず、必ず `services` 経由にする（差し替え・テスト容易性のため）
- API ↔ UI の変換は `models` に集約し、`api/client.ts` に散らさない

## 4. 設計上のポイント（抽出すべき3点）

現状はファイルがほぼ `screens/` と `api/client.ts` に集中している。
器を増やすより、以下 3 つの責務を引き出すことを優先する。

1. **`services/` に端末機能と永続化を隔離** — 画面が薄くなり、差し替え・テストが効く
2. **`models/event.ts` に型と変換を集約** — `api/client.ts` 同居の `toEventData` を分離
3. **履歴は `historyRepo` + `useHistory`** — 共有状態をライブラリ無しで成立させる

## 5. 移行ステップ

一括で作らず、既存責務の引っ越しから始める。

1. `models/event.ts` を作り `EventData` と `toEventData` を移す（純粋な移動、低リスク）
2. `mockData` を `historyRepo`（AsyncStorage）+ `useHistory` に置き換え、Home / History を繋ぐ
3. カレンダー実装時に `services/calendar.ts` を追加
4. 共通 UI を `components/` に切り出す（重複が出てきたタイミングで）

## 6. 見直しのトリガー

以下が見えたら本方針を再検討する。

- 画面が 8 個を超え、関連ファイルが各フォルダに散って探しにくくなった → feature 型へ
- サーバ状態のキャッシュ/再取得が増えた（履歴のクラウド同期など） → サーバ状態管理ライブラリの導入
- 画面間で双方向に更新する共有状態が複数になった → 軽量グローバル状態の導入
