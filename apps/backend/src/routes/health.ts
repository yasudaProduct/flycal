import { Hono } from 'hono'

// GET /api/v1/health — 稼働確認用（docs/api-design.md 5.1）
export const health = new Hono()

health.get('/health', (c) => {
  return c.json({ status: 'ok', version: 'v1' })
})
