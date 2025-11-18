import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { toPublicImageUrl } from '@/lib/images'
import type { FirstReviewedResponse, FirstReviewedItem } from '@/types/whisky'

/**
 * 첫 리뷰한 위스키 API
 * GET /api/profile/first-reviewed?userId=me
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    console.log('📊 첫 리뷰 위스키 API 요청:', { userId })

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

    // 내 리뷰를 created_at asc로 정렬하여 서로 다른 whisky_id 기준 최초 3개만 선별
    const { data: firstReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        whisky_id,
        created_at,
        whiskies (
          id,
          name,
          name_ko,
          image
        )
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: true })

    if (reviewsError) {
      console.error('❌ 첫 리뷰 조회 실패:', reviewsError)
      throw reviewsError
    }

    const reviews = firstReviews || []

    // 위스키별 최초 리뷰만 추출 (최대 3개)
    const seenWhiskyIds = new Set<string>()
    const firstReviewedItems: FirstReviewedItem[] = []

    for (const review of reviews) {
      if (!seenWhiskyIds.has(review.whisky_id) && firstReviewedItems.length < 3) {
        seenWhiskyIds.add(review.whisky_id)

        const whisky = Array.isArray(review.whiskies) ? review.whiskies[0] : review.whiskies
        if (whisky) {
          firstReviewedItems.push({
            whisky_id: review.whisky_id,
            first_reviewed_at: review.created_at,
            name: whisky.name || '',
            name_ko: whisky.name_ko || null,
            image: toPublicImageUrl(whisky.image)
          })
        }
      }
    }

    const response: FirstReviewedResponse = {
      items: firstReviewedItems
    }

    console.log('✅ 첫 리뷰 위스키 조회 완료:', {
      itemsCount: firstReviewedItems.length,
      whiskyIds: firstReviewedItems.map(item => item.whisky_id)
    })

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('❌ 첫 리뷰 위스키 API 오류:', error)
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}