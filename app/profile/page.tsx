import { redirect } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getServerSession } from 'next-auth/next'
import ProfilePageClient from '../../components/ProfilePageClient'

interface WhiskyData {
  id: string
  name: string
  image: string
  distillery?: string
  region: string
  abv: string
  cask: string
  price: string
  avgRating: number
  totalReviews: number
  likes: number
}

interface ReviewData {
  id: string
  user_id: string
  whisky_id: string
  rating: number
  notes: string
  created_at: string
}

async function getUserReviewsWithWhiskies(userId: string) {
  try {
    // 사용자의 리뷰 데이터 가져오기
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('리뷰 데이터 로드 실패:', reviewsError)
      return []
    }

    if (!reviews || reviews.length === 0) {
      return []
    }

    // 리뷰된 위스키 ID들 추출
    const whiskyIds = [...new Set(reviews.map(review => review.whisky_id))]

    // 위스키 상세 정보 가져오기
    const { data: whiskies, error: whiskiesError } = await supabase
      .from('whiskies')
      .select('*')
      .in('id', whiskyIds)

    if (whiskiesError) {
      console.error('위스키 데이터 로드 실패:', whiskiesError)
      return []
    }

    // 위스키 데이터를 맵으로 변환
    const whiskiesMap = new Map(whiskies?.map(w => [w.id, w]) || [])

    // 리뷰와 위스키 정보 조합
    const transformedReviews = reviews.map(review => {
      const whiskyData = whiskiesMap.get(review.whisky_id)
      return {
        id: review.id,
        user: 'User', // 닉네임은 클라이언트에서 설정
        whisky: whiskyData?.name || '알 수 없는 위스키',
        rating: review.rating,
        content: review.notes,
        likes: 0, // 리뷰 좋아요는 아직 구현되지 않음
        comments: [], // 리뷰 댓글은 아직 구현되지 않음
        date: new Date(review.created_at).toLocaleDateString('ko-KR'),
        whiskyImage: whiskyData?.image || '/whiskies/no.pic whisky.png',
        whiskyId: review.whisky_id,
        reviewId: review.id
      }
    })

    return transformedReviews
  } catch (error) {
    console.error('getUserReviewsWithWhiskies 오류:', error)
    return []
  }
}

async function getUserStats(userId: string) {
  try {
    // 사용자 리뷰 개수
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, note, rating')
      .eq('user_id', userId)

    if (reviewsError) {
      console.error('리뷰 통계 로드 실패:', reviewsError)
      return { reviewCount: 0, noteCount: 0, wishlistCount: 0 }
    }

    const reviewCount = reviews?.length || 0

    // 실제 노트가 있는 리뷰 개수 (단순 별점이 아닌 경우)
    const noteCount = reviews?.filter(review =>
      review.note && review.note.trim() !== '' &&
      !review.note.includes('별점') &&
      review.note.trim() !== `별점 ${review.rating}점을 남겼습니다.`
    ).length || 0

    // 찜한 위스키 개수
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .is('post_id', null)

    if (likesError) {
      console.error('찜 통계 로드 실패:', likesError)
    }

    const wishlistCount = likes?.length || 0

    return { reviewCount, noteCount, wishlistCount }
  } catch (error) {
    console.error('getUserStats 오류:', error)
    return { reviewCount: 0, noteCount: 0, wishlistCount: 0 }
  }
}

async function getReviewedWhiskies(userId: string) {
  try {
    // 사용자가 리뷰한 위스키 ID들 가져오기
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('whisky_id')
      .eq('user_id', userId)

    if (reviewsError || !reviews) {
      return []
    }

    const reviewedWhiskyIds = [...new Set(reviews.map(review => review.whisky_id))]

    if (reviewedWhiskyIds.length === 0) {
      return []
    }

    // 위스키 상세 정보 가져오기
    const { data: whiskies, error: whiskiesError } = await supabase
      .from('whiskies')
      .select('*')
      .in('id', reviewedWhiskyIds)
      .limit(6)

    if (whiskiesError) {
      console.error('리뷰된 위스키 데이터 로드 실패:', whiskiesError)
      return []
    }

    return whiskies || []
  } catch (error) {
    console.error('getReviewedWhiskies 오류:', error)
    return []
  }
}

// 임시 사용자 ID 가져오기 함수 (실제로는 NextAuth나 Supabase Auth 사용)
async function getCurrentUserId() {
  // 실제 구현에서는 세션에서 사용자 ID를 가져와야 합니다
  // 지금은 임시로 하드코딩된 사용자 ID 사용
  return 'b34b6a5d-4e87-4b2a-a3f2-1c8d9e5f6a7b' // 임시 사용자 ID
}

export default async function ProfilePage() {
  // 서버에서 사용자 인증 확인 (임시)
  const userId = await getCurrentUserId()

  if (!userId) {
    redirect('/login')
  }

  // 서버에서 모든 데이터 병렬로 로드
  const [reviews, stats, reviewedWhiskies] = await Promise.all([
    getUserReviewsWithWhiskies(userId),
    getUserStats(userId),
    getReviewedWhiskies(userId)
  ])

  console.log(`서버에서 프로필 데이터 로드 완료:`)
  console.log(`- 리뷰: ${reviews.length}개`)
  console.log(`- 통계: 리뷰 ${stats.reviewCount}개, 노트 ${stats.noteCount}개, 찜 ${stats.wishlistCount}개`)
  console.log(`- 리뷰된 위스키: ${reviewedWhiskies.length}개`)

  return (
    <ProfilePageClient
      initialReviews={reviews}
      initialWhiskies={reviewedWhiskies}
      initialStats={stats}
    />
  )
}