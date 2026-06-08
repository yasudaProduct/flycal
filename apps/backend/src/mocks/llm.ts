// LLM（Gemini）連携のモック。
// 実際の画像解析は行わず、固定のサンプル抽出結果を返す。
// 将来的に Vertex AI 経由の Gemini 呼び出しへ差し替える。

import type { EventCandidate, EventInfo } from '../types'

export interface ExtractionResult {
  event: EventInfo
  candidates: EventCandidate[]
}

/**
 * 画像からイベント情報を抽出する（モック）。
 * 引数は将来の実装に合わせたシグネチャ。現状は内容を参照しない。
 */
export async function extractEventFromImage(
  _image: File,
  _hint?: string,
): Promise<ExtractionResult> {
  // 実装イメージ: Gemini に画像 + プロンプトを渡し、構造化 JSON を得てスキーマ検証する。
  // ここでは固定のサンプルを返す。
  const event: EventInfo = {
    title: '○○ LIVE TOUR 2026',
    date: '2026-08-15',
    startTime: '18:00',
    endTime: '21:00',
    venue: 'Zepp Tokyo',
    address: '東京都江東区青海1-3-11',
    performers: ['アーティストA', 'アーティストB'],
    description: '開場 17:00 / 開演 18:00',
    officialUrl: 'https://example.com/live',
    confidence: 0.82,
    unknownFields: [],
  }

  const candidates: EventCandidate[] = [
    { date: '2026-08-15', startTime: '18:00', venue: 'Zepp Tokyo' },
  ]

  return { event, candidates }
}
