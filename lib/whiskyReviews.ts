import { supabaseBrowser } from '@/lib/supabase/browser'

/**
 * 위스키 리뷰(평점 및 노트) 기능을 위한 Supabase 헬퍼 함수들
 */

export interface WhiskyReview {
  id?: string
  user_id: string
  whisky_id: string
  rating: number
  note?: string
  created_at?: string
  updated_at?: string
  // ⭐ JOIN 쿼리로 가져오는 위스키 정보 (타입 안전성 개선)
  whiskies?: {
    name?: string
    name_ko?: string
    image?: string
  }
}

// 현재 사용자의 특정 위스키에 대한 리뷰 가져오기
export async function getUserWhiskyReview(whiskyId: string): Promise<WhiskyReview | null> {
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
      .eq('whisky_id', whiskyId)
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
  whiskyId: string,
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

    const reviewData = {
      user_id: user.id,
      whisky_id: whiskyId,
      rating: rating,
      note: note ?? null
    }

    const { error } = await (supabaseBrowser() as any)
      .from('reviews')
      .upsert(reviewData, {
        onConflict: 'whisky_id,user_id',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('리뷰 저장 실패:', error)
      return false
    }

    console.log('✅ 위스키 리뷰 저장 성공:', whiskyId, '평점:', rating)
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
      .select('*')  // ⭐ JOIN 제거, reviews만 조회
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
export async function deleteWhiskyReview(whiskyId: string): Promise<boolean> {
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
      .eq('whisky_id', whiskyId)

    if (error) {
      console.error('리뷰 삭제 실패:', error)
      return false
    }

    console.log('✅ 위스키 리뷰 삭제 성공:', whiskyId)
    return true
  } catch (error) {
    console.error('리뷰 삭제 중 오류:', error)
    return false
  }
}

// Review ID로 직접 삭제하는 안전한 함수
export async function deleteWhiskyReviewById(reviewId: string): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabaseBrowser().auth.getUser()

    if (userError || !user) {
      console.log('로그인이 필요합니다')
      return false
    }

    const { error } = await supabaseBrowser()
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id)  // 보안: 본인 리뷰만 삭제 가능

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

// 특정 위스키에 대한 사용자의 리뷰 존재 여부 확인
export async function hasUserReviewedWhisky(whiskyId: string): Promise<boolean> {
  try {
    const review = await getUserWhiskyReview(whiskyId)
    return review !== null
  } catch (error) {
    console.error('리뷰 존재 여부 확인 중 오류:', error)
    return false
  }
}

// 특정 위스키에 대한 사용자의 평점만 확인
export async function getUserWhiskyRating(whiskyId: string): Promise<number | null> {
  try {
    const review = await getUserWhiskyReview(whiskyId)
    return review ? review.rating : null
  } catch (error) {
    console.error('평점 확인 중 오류:', error)
    return null
  }
}

/**
 * whisky_id 배열로 위스키 정보 일괄 조회
 * @param whiskyIds - 조회할 위스키 ID 배열
 * @returns whisky_id를 key로 하는 위스키 정보 맵
 */
export async function getWhiskiesByIds(
  whiskyIds: string[]
): Promise<Record<string, { name?: string; name_ko?: string; image?: string }>> {
  if (whiskyIds.length === 0) {
    return {}
  }

  try {
    const { data, error } = await supabaseBrowser()
      .from('whiskies')
      .select('id, name, name_ko, image')
      .in('id', whiskyIds)

    if (error) {
      console.error('위스키 정보 조회 실패:', error)
      return {}
    }

    // id를 key로 하는 객체로 변환
    const whiskyMap: Record<string, { name?: string; name_ko?: string; image?: string }> = {}
    data?.forEach((whisky: any) => {
      whiskyMap[whisky.id] = {
        name: whisky.name,
        name_ko: whisky.name_ko,
        image: whisky.image
      }
    })

    console.log(`✅ 위스키 정보 ${Object.keys(whiskyMap).length}개 로드 완료`)
    return whiskyMap
  } catch (error) {
    console.error('위스키 정보 조회 중 오류:', error)
    return {}
  }
}