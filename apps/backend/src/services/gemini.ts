import type { EventCandidate, EventInfo } from '../types'

export interface ExtractionResult {
  event: EventInfo
  candidates: EventCandidate[]
}

/** Gemini がイベント情報を読み取れなかった場合に throw する（→ EXTRACTION_FAILED） */
export class ExtractionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ExtractionError'
  }
}

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const SYSTEM_PROMPT = `あなたはイベントフライヤーの画像解析の専門家です。
与えられた画像はライブ・コンサート・展示会・フェスなどのイベントフライヤーです。
画像からイベント情報を正確に読み取り、JSON で返してください。

## 抽出ルール

- 縦書きテキスト・手書き風フォント・装飾文字も正確に読む
- 複数日程がある場合は、主となる日程を event 本体に、その他の日程を candidates にまとめる
- 日付は YYYY-MM-DD 形式（例: 2026-08-15）
- 時刻は HH:MM 形式・24時間制（例: 18:00）
- performers にはアーティスト・バンド・DJ・出演者名をリストで含める
- 読み取れない・確信が持てない項目は null とし、そのフィールド名（"title", "date", "startTime" など）を unknownFields に含める
- confidence は 0.0〜1.0 で抽出全体の信頼度を自己評価する。情報が少ない場合は 0.3 以下とする
- officialUrl は画像中に明記されている場合のみ含め、推測はしない
- description には開場時間・チケット情報・注意事項など補足情報を含める`

// Gemini responseSchema（構造化出力用）
const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING', nullable: true },
    date: {
      type: 'STRING',
      nullable: true,
      description: 'YYYY-MM-DD 形式。不明な場合は null',
    },
    startTime: {
      type: 'STRING',
      nullable: true,
      description: 'HH:MM 形式（24時間制）。不明な場合は null',
    },
    endTime: {
      type: 'STRING',
      nullable: true,
      description: 'HH:MM 形式（24時間制）。不明な場合は null',
    },
    venue: { type: 'STRING', nullable: true },
    address: { type: 'STRING', nullable: true },
    performers: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'アーティスト・バンド・DJ・出演者名のリスト',
    },
    description: { type: 'STRING', nullable: true },
    officialUrl: { type: 'STRING', nullable: true },
    confidence: {
      type: 'NUMBER',
      description: '抽出全体の信頼度 0.0〜1.0',
    },
    unknownFields: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: '読み取れなかった・不確かなフィールド名のリスト',
    },
    candidates: {
      type: 'ARRAY',
      description: '複数日程がある場合の追加候補',
      items: {
        type: 'OBJECT',
        properties: {
          date: { type: 'STRING', nullable: true },
          startTime: { type: 'STRING', nullable: true },
          venue: { type: 'STRING', nullable: true },
        },
      },
    },
  },
  required: ['confidence', 'unknownFields', 'performers', 'candidates'],
}

// Cloudflare Workers では btoa のスプレッド展開が大きな画像でスタックオーバーフローするためチャンク変換
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 8192
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
}

type RawEvent = Record<string, unknown>

function toStringOrNull(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

function toStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

function parseRawResult(raw: RawEvent): ExtractionResult {
  const event: EventInfo = {
    title: toStringOrNull(raw.title),
    date: toStringOrNull(raw.date),
    startTime: toStringOrNull(raw.startTime),
    endTime: toStringOrNull(raw.endTime),
    venue: toStringOrNull(raw.venue),
    address: toStringOrNull(raw.address),
    performers: toStringArray(raw.performers),
    description: toStringOrNull(raw.description),
    officialUrl: toStringOrNull(raw.officialUrl),
    confidence: typeof raw.confidence === 'number' ? raw.confidence : 0,
    unknownFields: toStringArray(raw.unknownFields),
  }

  const candidates: EventCandidate[] = Array.isArray(raw.candidates)
    ? raw.candidates
      .filter((c): c is RawEvent => typeof c === 'object' && c !== null)
      .map((c) => ({
        date: toStringOrNull(c.date),
        startTime: toStringOrNull(c.startTime),
        venue: toStringOrNull(c.venue),
      }))
    : []

  return { event, candidates }
}

/** フライヤー画像から Gemini でイベント情報を抽出する */
export async function extractEventFromImage(
  image: File,
  apiKey: string,
  hint?: string,
): Promise<ExtractionResult> {
  const arrayBuffer = await image.arrayBuffer()
  const base64 = arrayBufferToBase64(arrayBuffer)
  const mimeType = image.type || 'image/jpeg'

  const promptText = hint ? `${SYSTEM_PROMPT}\n\n補足情報: ${hint}` : SYSTEM_PROMPT

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inline_data: { mime_type: mimeType, data: base64 } },
            { text: promptText },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.1,
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Gemini API error ${res.status}: ${body}`)
  }

  const data = (await res.json()) as GeminiResponse
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new ExtractionError('Gemini からの応答が空でした。')
  }

  let raw: RawEvent
  try {
    raw = JSON.parse(text) as RawEvent
  } catch {
    throw new ExtractionError(`Gemini のレスポンスが JSON として解析できませんでした: ${text}`)
  }

  if (typeof raw.confidence !== 'number') {
    throw new ExtractionError('Gemini のレスポンスに必須フィールドがありません。')
  }

  return parseRawResult(raw)
}
