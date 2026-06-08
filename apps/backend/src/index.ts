import { Hono } from 'hono'
import { ApiError, errorResponse } from './errors'
import { analyze } from './routes/analyze'
import { health } from './routes/health'
import { usage } from './routes/usage'
import type { AppVariables } from './types'

const app = new Hono<{ Variables: AppVariables }>()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// API v1 ルート
const api = new Hono<{ Variables: AppVariables }>()
api.route('/', health)
api.route('/', analyze)
api.route('/', usage)
app.route('/api/v1', api)

// 共通エラーハンドラ（docs/api-design.md 3.2）
app.onError((err, c) => {
  if (err instanceof ApiError) {
    return errorResponse(c, err)
  }
  console.error(err)
  return errorResponse(c, new ApiError('INTERNAL_ERROR', '予期しないエラーが発生しました。'))
})

export default app
