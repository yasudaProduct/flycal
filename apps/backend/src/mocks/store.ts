// DB（Cloudflare D1）のモック。
// MVP 実装が固まるまでのインメモリ実装で、Worker の再起動で消える点に注意。
// 将来的に D1 バインディング経由の実装へ差し替える。

import type { UsageInfo } from '../types'

/** 月間利用上限（MVP の暫定値 / docs/api-design.md 8） */
export const MONTHLY_LIMIT = 5

interface UserRecord {
  anonymousId: string
  createdAt: string
  lastSeenAt: string
}

// key: anonymousId
const users = new Map<string, UserRecord>()
// key: `${anonymousId}:${yearMonth}`
const usageCounts = new Map<string, number>()

function nowIso(): string {
  return new Date().toISOString()
}

/** 対象月キー（YYYY-MM）を返す */
export function currentYearMonth(date = new Date()): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/** 匿名ユーザーを登録、または最終利用日時を更新する（users テーブル相当） */
export function touchUser(anonymousId: string): void {
  const existing = users.get(anonymousId)
  if (existing) {
    existing.lastSeenAt = nowIso()
    return
  }
  const ts = nowIso()
  users.set(anonymousId, { anonymousId, createdAt: ts, lastSeenAt: ts })
}

/** 当月の利用状況を取得する（usage_monthly テーブル相当） */
export function getUsage(anonymousId: string): UsageInfo {
  const yearMonth = currentYearMonth()
  const analysisCount = usageCounts.get(`${anonymousId}:${yearMonth}`) ?? 0
  return { yearMonth, analysisCount, limit: MONTHLY_LIMIT }
}

/** 上限超過しているか */
export function isLimitExceeded(anonymousId: string): boolean {
  return getUsage(anonymousId).analysisCount >= MONTHLY_LIMIT
}

/** 解析回数を 1 加算して、加算後の利用状況を返す */
export function incrementUsage(anonymousId: string): UsageInfo {
  const yearMonth = currentYearMonth()
  const key = `${anonymousId}:${yearMonth}`
  const next = (usageCounts.get(key) ?? 0) + 1
  usageCounts.set(key, next)
  return { yearMonth, analysisCount: next, limit: MONTHLY_LIMIT }
}
