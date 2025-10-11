import { supabase } from './supabase'

/**
 * 리뷰 좋아요 기능을 위한 Supabase 헬퍼 함수들
 */

// 리뷰에 좋아요 추가
export async function likeReview(reviewId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('review_likes')
      .insert({
        review_id: reviewId,
        user_id: userId
      })

    if (error) {
      console.error('리뷰 좋아요 실패:', error)
      return false
    }

    console.log('✅ 리뷰 좋아요 성공:', reviewId)
    return true
  } catch (error) {
    console.error('리뷰 좋아요 중 오류:', error)
    return false
  }
}

// 리뷰 좋아요 취소
export async function unlikeReview(reviewId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('review_likes')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', userId)

    if (error) {
      console.error('리뷰 좋아요 취소 실패:', error)
      return false
    }

    console.log('✅ 리뷰 좋아요 취소 성공:', reviewId)
    return true
  } catch (error) {
    console.error('리뷰 좋아요 취소 중 오류:', error)
    return false
  }
}

// 리뷰에 좋아요를 눌렀는지 확인
export async function checkIfLiked(reviewId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('review_likes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116은 "no rows returned" 에러
      console.error('좋아요 상태 확인 실패:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('좋아요 상태 확인 중 오류:', error)
    return false
  }
}

// 특정 리뷰의 총 좋아요 개수 가져오기
export async function getReviewLikesCount(reviewId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('review_likes')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId)

    if (error) {
      console.error('좋아요 개수 조회 실패:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('좋아요 개수 조회 중 오류:', error)
    return 0
  }
}

// 여러 리뷰의 좋아요 상태를 한번에 확인 (성능 최적화)
export async function checkMultipleReviewsLiked(reviewIds: string[], userId: string): Promise<{[key: string]: boolean}> {
  try {
    const { data, error } = await supabase
      .from('review_likes')
      .select('review_id')
      .eq('user_id', userId)
      .in('review_id', reviewIds)

    if (error) {
      console.error('여러 리뷰 좋아요 상태 확인 실패:', error)
      return {}
    }

    // 결과를 객체로 변환
    const likedReviews: {[key: string]: boolean} = {}
    reviewIds.forEach(id => {
      likedReviews[id] = false
    })

    data?.forEach(like => {
      likedReviews[like.review_id] = true
    })

    return likedReviews
  } catch (error) {
    console.error('여러 리뷰 좋아요 상태 확인 중 오류:', error)
    return {}
  }
}

// 리뷰 삭제 (본인이 작성한 리뷰만)
export async function deleteReview(reviewId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId) // 본인이 작성한 리뷰만 삭제 가능

    if (error) {
      console.error('리뷰 삭제 실패:', error)
      return false
    }

    console.log('✅ 리뷰 삭제 성공:', reviewId)
    return true
  } catch (error) {
    console.error('리뷰 삭제 중 오류:', error)
    return false
  }
}