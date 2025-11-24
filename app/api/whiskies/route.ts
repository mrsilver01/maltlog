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

    // 정렬을 위해 더 많은 데이터를 가져온 후 JavaScript에서 처리
    const fetchLimit = Math.max(limit * 3, 200) // 최소 200개 이상 가져오기

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
      // 기본 정렬만 적용 (JavaScript에서 재정렬할 예정)
      .order('display_order', { ascending: true })
      .order('id', { ascending: true })
      // 더 많은 데이터 가져오기
      .limit(fetchLimit)

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

    // 실제 이미지 위스키 전역 우선 정렬 (시각적 품질 최우선)
    items.sort((a, b) => {
      // 1. 실제 이미지 보유 여부 - 절대 우선순위 (featured 여부보다 중요)
      const hasRealImageA = a.image && !a.image.toLowerCase().includes('no.pic') && !a.image.includes('placeholder');
      const hasRealImageB = b.image && !b.image.toLowerCase().includes('no.pic') && !b.image.includes('placeholder');

      // 실제 이미지 vs no pic: 실제 이미지가 항상 우선
      if (hasRealImageA !== hasRealImageB) return hasRealImageA ? -1 : 1;

      // 2. 같은 이미지 상태에서만 추천 위스키 우선
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;

      // 3. 평점 높은 순 (0점도 유효한 평점으로 처리)
      const ratingA = a.avg_rating ?? 0;
      const ratingB = b.avg_rating ?? 0;
      if (ratingA !== ratingB) {
        return ratingB - ratingA;
      }

      // 4. 리뷰 수 높은 순
      return (b.reviews_count || 0) - (a.reviews_count || 0);
    });

    // JavaScript에서 정렬 후 실제 페이지네이션 적용
    const startIndex = offset
    const endIndex = offset + limit
    const paginatedItems = items.slice(startIndex, endIndex)

    // 다음 페이지 존재 여부 확인
    const hasMore = items.length > endIndex
    const nextCursor = hasMore ? endIndex : null

    return NextResponse.json({
      items: paginatedItems,
      nextCursor,
      totalFetched: items.length // 디버그용
    })
  } catch (e: any) {
    console.error('[GET /api/whiskies] Unhandled error:', e)
    return NextResponse.json(
      { items: [], nextCursor: null, error: e?.message ?? 'unknown error' },
      { status: 500 },
    )
  }
}