import { supabaseBrowser } from '@/lib/supabase/browser'

/**
 * 위스키 리뷰(평점 및 노트) 기능을 위한 Supabase 헬퍼 함수들
 */

export interface WhiskyReview {
  id?: string
  user_id: string
  whisky_name: string
  rating: number
  note?: string
  created_at?: string
  updated_at?: string
}

// 현재 사용자의 특정 위스키에 대한 리뷰 가져오기
export async function getUserWhiskyReview(whiskyName: string): Promise<WhiskyReview | null> {
  try {
    const { data: { user }, error: userError } = await supabaseBrowser().auth.getUser()

    if (userError || !user) {
      console.log('로그인되지 않음 - 리뷰 없음')
      return null
    }

    const { data: review, error } = await supabaseBrowser()
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .eq('whisky_name', whiskyName)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116은 "no rows returned" 에러
      console.error('리뷰 가져오기 실패:', error)
      return null
    }

    return review || null
  } catch (error) {
    console.error('리뷰 가져오기 중 오류:', error)
    return null
  }
}

// 현재 사용자의 모든 위스키 리뷰 가져오기
export async function getAllUserWhiskyReviews(): Promise<WhiskyReview[]> {
  try {
    const { data: { user }, error: userError } = await supabaseBrowser().auth.getUser()

    if (userError || !user) {
      console.log('로그인되지 않음 - 리뷰 목록 없음')
      return []
    }

    const { data: reviews, error } = await supabaseBrowser()
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('리뷰 목록 가져오기 실패:', error)
      return []
    }

    return reviews || []
  } catch (error) {
    console.error('리뷰 목록 가져오기 중 오류:', error)
    return []
  }
}

// 위스키 리뷰 저장 또는 업데이트 (upsert 사용)
export async function saveWhiskyReview(
  whiskyName: string,
  rating: number,
  note?: string
): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabaseBrowser().auth.getUser()

    if (userError || !user) {
      console.log('로그인이 필요합니다')
      return false
    }

    // 0.5 단위 별점만 허용 (1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0)
    if (rating < 1 || rating > 5 || (rating * 2) % 1 !== 0) {
      console.error('올바르지 않은 평점 (0.5 단위만 허용):', rating)
      return false
    }

    const reviewData: Partial<WhiskyReview> = {
      user_id: user.id,
      whisky_name: whiskyName,
      rating: rating,
      note: note || undefined
    }

    const { error } = await supabaseBrowser()
      .from('reviews')
      .upsert(reviewData, {
        onConflict: 'user_id, whisky_name',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('리뷰 저장 실패:', error)
      return false
    }

    console.log('✅ 위스키 리뷰 저장 성공:', whiskyName, '평점:', rating)
    return true
  } catch (error) {
    console.error('리뷰 저장 중 오류:', error)
    return false
  }
}

// 사용자의 모든 위스키 리뷰 가져오기
export async function getUserWhiskyReviews(): Promise<WhiskyReview[]> {
  try {
    const { data: { user }, error: userError } = await supabaseBrowser().auth.getUser()

    if (userError || !user) {
      console.log('로그인이 필요합니다')
      return []
    }

    const { data: reviews, error } = await supabaseBrowser()
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('사용자 리뷰 목록 가져오기 실패:', error)
      return []
    }

    console.log(`✅ 사용자 리뷰 ${reviews?.length || 0}개 로드 완료`)
    return reviews || []
  } catch (error) {
    console.error('사용자 리뷰 목록 가져오기 중 오류:', error)
    return []
  }
}

// 위스키 리뷰 삭제
export async function deleteWhiskyReview(whiskyName: string): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabaseBrowser().auth.getUser()

    if (userError || !user) {
      console.log('로그인이 필요합니다')
      return false
    }

    const { error } = await supabaseBrowser()
      .from('reviews')
      .delete()
      .eq('user_id', user.id)
      .eq('whisky_name', whiskyName)

    if (error) {
      console.error('리뷰 삭제 실패:', error)
      return false
    }

    console.log('✅ 위스키 리뷰 삭제 성공:', whiskyName)
    return true
  } catch (error) {
    console.error('리뷰 삭제 중 오류:', error)
    return false
  }
}

// 특정 위스키에 대한 사용자의 리뷰 존재 여부 확인
export async function hasUserReviewedWhisky(whiskyName: string): Promise<boolean> {
  try {
    const review = await getUserWhiskyReview(whiskyName)
    return review !== null
  } catch (error) {
    console.error('리뷰 존재 여부 확인 중 오류:', error)
    return false
  }
}

// 특정 위스키에 대한 사용자의 평점만 확인
export async function getUserWhiskyRating(whiskyName: string): Promise<number | null> {
  try {
    const review = await getUserWhiskyReview(whiskyName)
    return review ? review.rating : null
  } catch (error) {
    console.error('평점 확인 중 오류:', error)
    return null
  }
}