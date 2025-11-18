import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { toPublicImageUrl } from '@/lib/images'
import type { ProfileReviewsResponse, NewProfileReview } from '@/types/whisky'

/**
 * 내 리뷰 목록 API
 * GET /api/profile/reviews?userId=me&cursor=<created_at,id>&limit=10
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const cursorParam = searchParams.get('cursor')
    const limitParam = searchParams.get('limit')

    console.log('📊 프로필 리뷰 API 요청:', { userId, cursor: cursorParam, limit: limitParam })

    let targetUserId: string

    if (userId === 'me') {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return new NextResponse('Unauthorized', { status: 401 })
      }
      targetUserId = user.id
    } else {
      return new NextResponse('userId=me 만 지원됩니다', { status: 400 })
    }

    const limit = limitParam ? Math.min(parseInt(limitParam), 50) : 10

    // 커서 파싱
    let cursor: { createdAt: string, id: string } | null = null
    if (cursorParam) {
      try {
        cursor = JSON.parse(cursorParam)
      } catch (e) {
        return new NextResponse('잘못된 커서 형식', { status: 400 })
      }
    }

    // 리뷰 조회 쿼리 구성
    let query = supabase
      .from('reviews')
      .select(`
        id,
        rating,
        note,
        created_at,
        whiskies (
          id,
          name,
          name_ko,
          image
        )
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1)

    // 커서 기반 페이지네이션
    if (cursor) {
      query = query.lt('created_at', cursor.createdAt)
        .neq('id', cursor.id)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ 리뷰 조회 실패:', error)
      throw error
    }

    const reviews = data || []

    // 다음 페이지 존재 여부 확인
    const hasNextPage = reviews.length > limit
    const items = hasNextPage ? reviews.slice(0, limit) : reviews

    // 타입 매핑 및 이미지 URL 변환
    const transformedItems: NewProfileReview[] = items.map(review => {
      const whisky = Array.isArray(review.whiskies) ? review.whiskies[0] : review.whiskies
      return {
        review_id: review.id,
        rating: review.rating || 0,
        note: review.note,
        created_at: review.created_at,
        whisky: {
          id: whisky?.id || '',
          name: whisky?.name || '',
          name_ko: whisky?.name_ko || null,
          image: toPublicImageUrl(whisky?.image)
        }
      }
    })

    // 다음 커서 계산
    const nextCursor = hasNextPage && transformedItems.length > 0
      ? {
          createdAt: transformedItems[transformedItems.length - 1].created_at,
          id: transformedItems[transformedItems.length - 1].review_id
        }
      : null

    const response: ProfileReviewsResponse = {
      items: transformedItems,
      nextCursor
    }

    console.log('✅ 프로필 리뷰 조회 완료:', {
      itemsCount: transformedItems.length,
      hasNextPage,
      nextCursor
    })

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('❌ 프로필 리뷰 API 오류:', error)
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}