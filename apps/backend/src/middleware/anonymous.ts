import type { MiddlewareHandler } from 'hono'
import { ApiError } from '../errors'
import { touchUser } from '../mocks/store'
import type { AppVariables } from '../types'

/**
 * 匿名ユーザー識別ミドルウェア（docs/api-design.md 2.3）。
 * X-Anonymous-Id を必須とし、ユーザーの登録/最終利用日時更新を行う。
 */
export const requireAnonymousId: MiddlewareHandler<{ Variables: AppVariables }> = async (
  c,
  next,
) => {
  const anonymousId = c.req.header('X-Anonymous-Id')?.trim()
  if (!anonymousId) {
    throw new ApiError('MISSING_ANONYMOUS_ID', 'X-Anonymous-Id ヘッダが必要です。')
  }

  touchUser(anonymousId)
  c.set('anonymousId', anonymousId)
  c.set('appVersion', c.req.header('X-App-Version')?.trim() ?? null)

  await next()
}
