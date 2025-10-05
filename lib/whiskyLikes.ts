import { supabase } from './supabase'

/**
 * 위스키 찜하기 기능을 위한 Supabase 헬퍼 함수들
 */

// 현재 사용자의 모든 찜한 위스키 목록 가져오기
export async function getUserWhiskyLikes(): Promise<string[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('로그인되지 않음 - 찜 목록 없음')
      return []
    }

    const { data: likes, error } = await supabase
      .from('likes')
      .select('whisky_name')
      .eq('user_id', user.id)
      .is('post_id', null) // 위스키 찜만 가져오기 (게시글 좋아요 제외)

    if (error) {
      console.error('찜 목록 가져오기 실패:', error)
      return []
    }

    return likes?.map(like => like.whisky_name) || []
  } catch (error) {
    console.error('찜 목록 가져오기 중 오류:', error)
    return []
  }
}

// 위스키 찜하기 (좋아요 추가)
export async function addWhiskyLike(whiskyId: string): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('로그인이 필요합니다')
      return false
    }

    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        whisky_name: whiskyId,
        post_id: null
      })

    if (error) {
      console.error('찜하기 실패:', error)
      return false
    }

    console.log('✅ 위스키 찜하기 성공:', whiskyId)
    return true
  } catch (error) {
    console.error('찜하기 중 오류:', error)
    return false
  }
}

// 위스키 찜 취소 (좋아요 제거)
export async function removeWhiskyLike(whiskyId: string): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('로그인이 필요합니다')
      return false
    }

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('whisky_name', whiskyId)
      .is('post_id', null)

    if (error) {
      console.error('찜 취소 실패:', error)
      return false
    }

    console.log('✅ 위스키 찜 취소 성공:', whiskyId)
    return true
  } catch (error) {
    console.error('찜 취소 중 오류:', error)
    return false
  }
}

// 특정 위스키가 찜되어 있는지 확인
export async function isWhiskyLiked(whiskyId: string): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return false
    }

    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('whisky_name', whiskyId)
      .is('post_id', null)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116은 "no rows returned" 에러
      console.error('찜 상태 확인 실패:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('찜 상태 확인 중 오류:', error)
    return false
  }
}