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
      .from('whiskies_with_stats_mat')
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

    // 이미지 보유 위스키 우선 정렬 (시각적 품질 향상)
    items.sort((a, b) => {
      // 1. 추천 위스키 우선
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;

      // 2. 실제 이미지 보유 위스키 우선 (no.pic 제외)
      const hasRealImageA = a.image && !a.image.includes('no.pic');
      const hasRealImageB = b.image && !b.image.includes('no.pic');

      if (hasRealImageA !== hasRealImageB) return hasRealImageA ? -1 : 1;

      // 3. 평점 높은 순 (동점 처리)
      if ((a.avg_rating || 0) !== (b.avg_rating || 0)) {
        return (b.avg_rating || 0) - (a.avg_rating || 0);
      }

      // 4. 리뷰 수 높은 순 (추가 동점 처리)
      return (b.reviews_count || 0) - (a.reviews_count || 0);
    });

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