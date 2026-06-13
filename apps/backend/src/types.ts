// API 全体で共有する型定義

/** 抽出されたイベント情報（主候補） */
export interface EventInfo {
  title: string | null
  date: string | null
  startTime: string | null
  endTime: string | null
  venue: string | null
  address: string | null
  performers: string[]
  description: string | null
  officialUrl: string | null
  /** 抽出全体の信頼度（0.0〜1.0） */
  confidence: number
  /** 抽出できなかった/不確実な項目名 */
  unknownFields: string[]
}

/** 複数日程などの追加候補 */
export interface EventCandidate {
  date: string | null
  startTime: string | null
  venue: string | null
}

/** 当月の利用状況 */
export interface UsageInfo {
  yearMonth: string
  analysisCount: number
  limit: number
}

/** POST /api/v1/analyze のレスポンス */
export interface AnalyzeResponse {
  analysisId: string
  event: EventInfo
  candidates: EventCandidate[]
  usage: UsageInfo
}

/** GET /api/v1/usage のレスポンス */
export interface UsageResponse extends UsageInfo {
  remaining: number
}

/** Cloudflare Workers バインディング（wrangler secret / .dev.vars で管理） */
export type AppBindings = {
  GEMINI_API_KEY: string
}

/** Hono コンテキストに載せる変数 */
export type AppVariables = {
  anonymousId: string
  appVersion: string | null
}
