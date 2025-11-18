import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { toPublicImageUrl } from '@/lib/images'
import type { WhiskyWithStats, WhiskyListResponse } from '@/types/whisky'

/**
 * 위스키 목록 API - 커서 기반 페이지네이션
 * GET /api/whiskies?limit=50&cursor=마지막_oid
 */
export async function GET(request: NextRequest) {
  try {
    // URL 파라미터 파싱
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const cursorParam = searchParams.get('cursor')

    // 기본값 설정
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 50  // 최대 100개 제한
    const cursor = cursorParam ? parseInt(cursorParam) : null

    console.log('📊 위스키 API 요청:', { limit, cursor })

    // whiskies_with_stats 뷰에서 데이터 조회
    let query = supabase
      .from('whiskies_with_stats')
      .select(`
        oid,
        id,
        name,
        name_ko,
        image,
        abv,
        price,
        cask,
        region,
        distillery,
        is_featured,
        display_order,
        avg_rating,
        reviews_count,
        likes_count
      `)
      .order('oid', { ascending: true })
      .limit(limit + 1)  // 다음 페이지 존재 여부 확인용 +1

    // 커서가 있으면 해당 oid 이후의 데이터만 조회
    if (cursor !== null) {
      query = query.gt('oid', cursor)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ 위스키 조회 실패:', error)
      throw error
    }

    if (!data) {
      return NextResponse.json<WhiskyListResponse>({
        items: [],
        nextCursor: null
      })
    }

    // 다음 페이지 존재 여부 확인
    const hasNextPage = data.length > limit
    const items = hasNextPage ? data.slice(0, limit) : data

    // 이미지 URL 변환 및 타입 매핑
    const transformedItems: WhiskyWithStats[] = items.map(w => ({
      oid: w.oid,
      id: w.id,
      name: w.name,
      name_ko: w.name_ko,
      image: toPublicImageUrl(w.image ?? undefined),  // 이미지 URL 변환 (null → placeholder)
      abv: w.abv ?? null,
      price: w.price ?? null,
      cask: w.cask ?? null,
      region: w.region ?? null,
      distillery: w.distillery ?? null,
      is_featured: w.is_featured ?? false,
      display_order: w.display_order ?? 0,
      avg_rating: Number(w.avg_rating ?? 0),
      reviews_count: w.reviews_count ?? 0,
      likes_count: w.likes_count ?? 0
    }))

    // 사진 여부로 분류하여 정렬 (진짜 위스키 사진이 있는 것 우선)
    const hasRealImage = (item: WhiskyWithStats) => {
      if (!item.image || item.image.includes('placeholder')) return false
      if (item.image.includes('no.pic')) return false
      return item.image.startsWith('http') && item.image.trim() !== ''
    }

    const withRealImages = transformedItems.filter(hasRealImage)
    const withoutRealImages = transformedItems.filter(item => !hasRealImage(item))

    // 각각 oid 순으로 정렬하여 병합
    withRealImages.sort((a, b) => a.oid - b.oid)
    withoutRealImages.sort((a, b) => a.oid - b.oid)

    const sortedItems = [...withRealImages, ...withoutRealImages]

    // 다음 커서 계산 (정렬 후 마지막 아이템 기준)
    const nextCursor = hasNextPage && sortedItems.length > 0
      ? sortedItems[sortedItems.length - 1]?.oid || null
      : null

    const response: WhiskyListResponse = {
      items: sortedItems,
      nextCursor
    }

    console.log('✅ 위스키 API 응답:', {
      itemsCount: sortedItems.length,
      withRealImages: withRealImages.length,
      withoutRealImages: withoutRealImages.length,
      nextCursor,
      hasNextPage
    })

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('❌ 위스키 API 오류:', error)
    return new NextResponse(
      JSON.stringify({
        error: error.message,
        items: [],
        nextCursor: null
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}