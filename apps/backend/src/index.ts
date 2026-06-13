import { Hono } from 'hono'
import { ApiError, errorResponse } from './errors'
import { analyze } from './routes/analyze'
import { health } from './routes/health'
import { usage } from './routes/usage'
import type { AppBindings, AppVariables } from './types'

type AppEnv = { Bindings: AppBindings; Variables: AppVariables }

const app = new Hono<AppEnv>()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// API v1 ルート
const api = new Hono<AppEnv>()
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
