// イベントのドメインモデルと、API レスポンス ↔ UI モデルの変換を集約する。
// ここは純粋な型と関数のみを置き、UI・通信・端末機能には依存しない。

/** UI（画面・履歴）で扱うイベント情報 */
export type EventData = {
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  performers: string;
  description: string;
  url: string;
  confidence: number;
  category?: string;
  thumbnailColor?: string;
  thumbnailLabel?: string;
};

/** バックエンド /api/v1/analyze が返す EventInfo（docs/api-design.md 5.2） */
export type ApiEventInfo = {
  title: string | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
  address: string | null;
  performers: string[];
  description: string | null;
  officialUrl: string | null;
  confidence: number;
  unknownFields: string[];
};

/** バックエンドの EventInfo をモバイルの EventData へ変換する */
export function toEventData(event: ApiEventInfo): EventData {
  return {
    eventName: event.title ?? "",
    date: event.date ?? "",
    startTime: event.startTime ?? "",
    endTime: event.endTime ?? "",
    venue: event.venue ?? "",
    address: event.address ?? "",
    performers: event.performers.join(" / "),
    description: event.description ?? "",
    url: event.officialUrl ?? "",
    confidence: event.confidence,
  };
}
