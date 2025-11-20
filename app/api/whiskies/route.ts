// app/api/whiskies/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { toPublicImageUrl } from '@/lib/images'
import type { WhiskyWithStats } from '@/types/whisky'

const DEFAULT_LIMIT = 50

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limitParam = url.searchParams.get('limit')
    const cursorParam = url.searchParams.get('cursor') // offset 개념으로 사용

    const limit = Number.isFinite(Number(limitParam))
      ? Number(limitParam)
      : DEFAULT_LIMIT

    const offset = Number.isFinite(Number(cursorParam))
      ? Number(cursorParam)
      : 0

    const { data, error } = await supabase
      .from('whiskies_with_stats')
      .select(
        [
          'abv',
          'id',
          'price',
          'cask',
          'name',
          'name_ko',
          'image',
          'distillery',
          'is_featured',
          'display_order',
          'avg_rating',
          'reviews_count',
          'likes_count',
          'region',
        ].join(','),
      )
      // 정렬 기준 고정
      .order('display_order', { ascending: true })
      .order('id', { ascending: true })
      // offset 기반 페이지네이션
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[GET /api/whiskies] Supabase error:', error)
      return NextResponse.json(
        { items: [], nextCursor: null, error: error.message },
        { status: 500 },
      )
    }

    const rawItems = (data ?? []) as any[]

    const items: WhiskyWithStats[] = rawItems.map((w) => ({
      ...w,
      image: toPublicImageUrl(w.image ?? undefined),
    }))

    // 다음 offset 계산: 더 가져올 게 없으면 null
    const nextCursor = items.length < limit ? null : offset + limit

    return NextResponse.json({ items, nextCursor })
  } catch (e: any) {
    console.error('[GET /api/whiskies] Unhandled error:', e)
    return NextResponse.json(
      { items: [], nextCursor: null, error: e?.message ?? 'unknown error' },
      { status: 500 },
    )
  }
}