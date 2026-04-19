import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import type { ProfileSummary } from '@/types/whisky'

/**
 * 프로필 요약 API
 * GET /api/profile/summary?nickname=<nickname> 또는 userId=me
 *
 * DB 스키마: profiles(id, nickname, avatar_url, is_admin, ...)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nickname = searchParams.get('nickname')
    const userId = searchParams.get('userId')

    let targetUserId: string

    if (userId === 'me') {
      // 현재 로그인한 사용자의 세션 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return new NextResponse('Unauthorized', { status: 401 })
      }
      targetUserId = user.id
    } else if (nickname) {
      // 닉네임으로 사용자 찾기
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('nickname', nickname)
        .single()

      if (profileError || !profileData) {
        return new NextResponse('User not found', { status: 404 })
      }
      targetUserId = profileData.id
    } else {
      return new NextResponse('nickname 또는 userId 파라미터가 필요합니다', { status: 400 })
    }

    // 병렬로 데이터 조회
    const [profileResult, reviewsStatsResult, likesResult, postsResult] = await Promise.all([
      // 1. 프로필 기본 정보 (실제 DB 컬럼: id, nickname, avatar_url)
      supabase
        .from('profiles')
        .select('id, nickname, avatar_url')
        .eq('id', targetUserId)
        .single(),

      // 2. 리뷰 통계 (개수와 평균 평점)
      supabase
        .from('reviews')
        .select('rating')
        .eq('user_id', targetUserId),

      // 3. 내 리뷰가 받은 좋아요 수 (일단 0으로 설정)
      Promise.resolve({ data: [], error: null }),

      // 4. 게시글 수
      supabase
        .from('posts')
        .select('id', { count: 'exact' })
        .eq('user_id', targetUserId)
    ])

    // 프로필 정보 확인
    if (profileResult.error || !profileResult.data) {
      console.error('❌ 프로필 조회 실패:', profileResult.error)
      return new NextResponse('프로필을 찾을 수 없습니다', { status: 404 })
    }

    const profile = profileResult.data
    const reviews = reviewsStatsResult.data || []
    const likes = likesResult.data || []
    const postsCount = postsResult.count || 0

    // 리뷰 통계 계산
    const notesCount = reviews.length
    const myAvgRating = reviews.length > 0
      ? Math.round(reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length * 100) / 100
      : 0
    const likesReceived = likes.length

    const summary: ProfileSummary = {
      user_id: profile.id,
      nickname: profile.nickname ?? '',
      avatar_url: profile.avatar_url,
      notes_count: notesCount,
      posts_count: postsCount,
      likes_received: likesReceived,
      my_avg_rating: myAvgRating
    }

    return NextResponse.json(summary)

  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error('❌ 프로필 요약 API 오류:', message)
    return new NextResponse(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}