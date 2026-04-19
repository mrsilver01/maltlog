// app/api/whiskies/route.ts
// 커서 기반 페이지네이션 API.
// 정렬 로직은 lib/server/getInitialWhiskies의 단일 소스에서 가져옵니다.
// (홈 RSC와 동일한 정렬을 보장)

import { NextResponse } from 'next/server'
import { fetchSortedWhiskies } from '@/lib/server/getInitialWhiskies'
import type { WhiskyListResponse } from '@/types/whisky'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limitParam = Number(url.searchParams.get('limit'))
    const cursorParam = Number(url.searchParams.get('cursor'))

    const limit = Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(limitParam, MAX_LIMIT)
      : DEFAULT_LIMIT

    const offset = Number.isFinite(cursorParam) && cursorParam > 0
      ? cursorParam
      : 0

    // 정렬된 전체 목록을 가져와서 offset/limit으로 슬라이스.
    // (현재 DB 규모 ~659개 수준이면 문제 없음. 수천 개 이상으로 커지면
    //  DB-side ORDER BY 컬럼 추가로 개선 필요)
    const all = await fetchSortedWhiskies()

    const items = all.slice(offset, offset + limit)
    const hasMore = all.length > offset + limit
    const nextCursor = hasMore ? offset + limit : null

    const body: WhiskyListResponse = { items, nextCursor }
    return NextResponse.json(body)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error'
    console.error('[GET /api/whiskies] Unhandled error:', message)
    return NextResponse.json(
      { items: [], nextCursor: null, error: message },
      { status: 500 },
    )
  }
}
