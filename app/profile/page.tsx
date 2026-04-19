import ProfilePageClient from '@/components/ProfilePageClient'
import type { ProfileSummary, ProfileReviewsResponse, FirstReviewedResponse } from '@/types/whisky'

// 사용자별 동적 데이터이므로 동적 렌더링 필요
export const dynamic = 'force-dynamic'

/**
 * 프로필 요약 데이터 조회
 */
async function getProfileSummary(): Promise<ProfileSummary> {
  console.log('📊 서버에서 프로필 요약 데이터 로드 시작...')

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api/profile/summary?userId=me`

    const response = await fetch(apiUrl, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      throw new Error(`프로필 요약 API 실패: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('❌ 프로필 요약 데이터 로드 실패:', error)
    // 기본값 반환
    return {
      user_id: '',
      nickname: '',
      avatar_url: null,
      notes_count: 0,
      posts_count: 0,
      likes_received: 0,
      my_avg_rating: 0
    }
  }
}

/**
 * 프로필 리뷰 데이터 조회
 */
async function getProfileReviews(): Promise<ProfileReviewsResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api/profile/reviews?userId=me&limit=10`

    const response = await fetch(apiUrl, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      throw new Error(`프로필 리뷰 API 실패: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('❌ 프로필 리뷰 데이터 로드 실패:', error)
    return { items: [], nextCursor: null }
  }
}

/**
 * 첫 리뷰한 위스키 데이터 조회
 */
async function getFirstReviewedWhiskies(): Promise<FirstReviewedResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api/profile/first-reviewed?userId=me`

    const response = await fetch(apiUrl, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      throw new Error(`첫 리뷰 위스키 API 실패: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('❌ 첫 리뷰 위스키 데이터 로드 실패:', error)
    return { items: [] }
  }
}

export default async function ProfilePage() {
  console.log('🏠 프로필 페이지 서버 렌더링 시작...')

  // 3개 API 병렬 호출
  const [profileSummary, profileReviews, firstReviewedWhiskies] = await Promise.all([
    getProfileSummary(),
    getProfileReviews(),
    getFirstReviewedWhiskies()
  ])

  console.log('🎯 프로필 데이터 준비 완료:', {
    notesCount: profileSummary.notes_count,
    reviewsCount: profileReviews.items.length,
    firstReviewedCount: firstReviewedWhiskies.items.length
  })

  return (
    <ProfilePageClient
      profileSummary={profileSummary}
      initialReviews={profileReviews}
      firstReviewedWhiskies={firstReviewedWhiskies}
    />
  )
}