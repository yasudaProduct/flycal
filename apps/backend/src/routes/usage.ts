import { Hono } from 'hono'
import { requireAnonymousId } from '../middleware/anonymous'
import { getUsage } from '../mocks/store'
import type { AppBindings, AppVariables, UsageResponse } from '../types'

// GET /api/v1/usage — 当月の利用状況を取得（docs/api-design.md 5.3）
export const usage = new Hono<{ Bindings: AppBindings; Variables: AppVariables }>()

usage.get('/usage', requireAnonymousId, (c) => {
  const info = getUsage(c.get('anonymousId'))
  const body: UsageResponse = {
    ...info,
    remaining: Math.max(0, info.limit - info.analysisCount),
  }
  return c.json(body)
})
