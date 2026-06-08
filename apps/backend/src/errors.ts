import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

// API 共通のエラーコード（docs/api-design.md 3.3 と対応）
export type ErrorCode =
  | 'INVALID_REQUEST'
  | 'UNSUPPORTED_IMAGE'
  | 'MISSING_ANONYMOUS_ID'
  | 'EXTRACTION_FAILED'
  | 'USAGE_LIMIT_EXCEEDED'
  | 'LLM_UPSTREAM_ERROR'
  | 'INTERNAL_ERROR'

const STATUS_BY_CODE: Record<ErrorCode, ContentfulStatusCode> = {
  INVALID_REQUEST: 400,
  UNSUPPORTED_IMAGE: 400,
  MISSING_ANONYMOUS_ID: 401,
  EXTRACTION_FAILED: 422,
  USAGE_LIMIT_EXCEEDED: 429,
  LLM_UPSTREAM_ERROR: 502,
  INTERNAL_ERROR: 500,
}

/** ハンドラ内から throw して共通エラーレスポンスへ変換する例外 */
export class ApiError extends Error {
  readonly code: ErrorCode
  readonly status: ContentfulStatusCode
  readonly details?: Record<string, unknown>

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(message)
    this.code = code
    this.status = STATUS_BY_CODE[code]
    this.details = details
  }
}

/** 共通エラー形式の JSON を返す（docs/api-design.md 3.2） */
export function errorResponse(c: Context, err: ApiError) {
  return c.json(
    {
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? {},
      },
    },
    err.status,
  )
}
