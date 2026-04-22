/**
 * Rate limiter (서버 전용)
 *
 * Upstash Redis 기반 레이트 리밋 유틸. 환경변수가 없으면 no-op으로 동작하여
 * 로컬/프리뷰 환경에서 에러 없이 통과합니다. 프로덕션에서는
 * UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN 을 설정하고
 * 아래 주석 처리된 @upstash/ratelimit 블록을 활성화하면 됩니다.
 *
 * 현재 구현은 프로세스 메모리 기반 sliding window fallback 입니다.
 * 싱글 인스턴스 한정 방어 수단이며, Vercel 서버리스 다중 인스턴스
 * 환경에서는 Upstash 연동이 필수입니다.
 */

type Bucket = { count: number; resetAt: number }
const store = new Map<string, Bucket>()

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export interface RateLimitOptions {
  /** 구분자 (예: ip:userId, route:action) */
  identifier: string
  /** 최대 허용 횟수 */
  limit: number
  /** 시간 창(ms) */
  windowMs: number
}

export async function rateLimit({
  identifier,
  limit,
  windowMs,
}: RateLimitOptions): Promise<RateLimitResult> {
  // Upstash 환경변수 체크 — 설정되면 향후 @upstash/ratelimit 로 교체
  const hasUpstash =
    !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

  if (hasUpstash) {
    // TODO: @upstash/ratelimit 설치 후 교체
    // const { Ratelimit } = await import('@upstash/ratelimit')
    // const { Redis } = await import('@upstash/redis')
    // const rl = new Ratelimit({
    //   redis: Redis.fromEnv(),
    //   limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
    //   analytics: true,
    // })
    // const { success, remaining, reset } = await rl.limit(identifier)
    // return { success, remaining, resetAt: reset }
  }

  // In-memory fallback (개발/단일 인스턴스)
  const now = Date.now()
  const bucket = store.get(identifier)

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs
    store.set(identifier, { count: 1, resetAt })
    return { success: true, remaining: limit - 1, resetAt }
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, resetAt: bucket.resetAt }
  }

  bucket.count += 1
  return { success: true, remaining: limit - bucket.count, resetAt: bucket.resetAt }
}

/** 서버 액션에서 호출: 실패 시 Error throw */
export async function assertRateLimit(opts: RateLimitOptions): Promise<void> {
  const { success, resetAt } = await rateLimit(opts)
  if (!success) {
    const seconds = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
    throw new Error(`RATE_LIMITED:${seconds}`)
  }
}
