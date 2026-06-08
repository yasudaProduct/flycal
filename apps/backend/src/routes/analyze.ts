import { Hono } from 'hono'
import { ApiError } from '../errors'
import { requireAnonymousId } from '../middleware/anonymous'
import { extractEventFromImage } from '../mocks/llm'
import { getUsage, incrementUsage, isLimitExceeded } from '../mocks/store'
import type { AnalyzeResponse, AppVariables } from '../types'

// POST /api/v1/analyze — 画像からイベント情報を抽出（docs/api-design.md 5.2）
export const analyze = new Hono<{ Variables: AppVariables }>()

const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10MB
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

analyze.post('/analyze', requireAnonymousId, async (c) => {
  const anonymousId = c.get('anonymousId')

  // 1. 利用上限チェック（解析前に拒否する）
  if (isLimitExceeded(anonymousId)) {
    const usage = getUsage(anonymousId)
    throw new ApiError('USAGE_LIMIT_EXCEEDED', '今月の解析回数の上限に達しました。', {
      yearMonth: usage.yearMonth,
      limit: usage.limit,
    })
  }

  // 2. multipart/form-data の取得・検証
  let form: FormData
  try {
    form = await c.req.formData()
  } catch {
    throw new ApiError('INVALID_REQUEST', 'multipart/form-data 形式で送信してください。')
  }

  const image = form.get('image')
  if (!(image instanceof File)) {
    throw new ApiError('INVALID_REQUEST', 'image フィールドが必要です。')
  }
  if (image.size > MAX_IMAGE_BYTES) {
    throw new ApiError('UNSUPPORTED_IMAGE', '画像サイズが上限（10MB）を超えています。')
  }
  if (image.type && !SUPPORTED_TYPES.includes(image.type)) {
    throw new ApiError('UNSUPPORTED_IMAGE', `非対応の画像形式です: ${image.type}`)
  }

  const hintRaw = form.get('hint')
  const hint = typeof hintRaw === 'string' ? hintRaw : undefined

  // 3. LLM でイベント情報を抽出（モック）
  let extraction
  try {
    extraction = await extractEventFromImage(image, hint)
  } catch {
    throw new ApiError('LLM_UPSTREAM_ERROR', 'イベント情報の抽出に失敗しました。')
  }

  // 4. 利用回数を加算（usage_monthly 相当）
  const usage = incrementUsage(anonymousId)

  // 5. analysis_logs への記録は DB 導入時に実装（画像本体は保存しない）

  // 6. 抽出結果を返却
  const body: AnalyzeResponse = {
    analysisId: crypto.randomUUID(),
    event: extraction.event,
    candidates: extraction.candidates,
    usage,
  }
  return c.json(body)
})
