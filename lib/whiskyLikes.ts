import { supabase } from './supabase'

/**
 * 위스키 찜하기 기능을 위한 Supabase 헬퍼 함수들
 */

// 현재 사용자의 모든 찜한 위스키 목록 가져오기
export async function getUserWhiskyLikes(): Promise<string[]> {
  try {
    console.log('⚠️ 위스키 찜 기능 임시 비활성화됨 - 데이터베이스 스키마 문제로 인해')
    return []

    // TODO: likes 테이블에 whisky_id 컬럼이 존재하지 않음.
    // 데이터베이스 스키마 확인 후 다시 활성화 필요
    /*
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('로그인되지 않음 - 찜 목록 없음')
      return []
    }

    const { data: likes, error } = await supabase
      .from('likes')
      .select('whisky_id')
      .eq('user_id', user.id)
      .is('post_id', null) // 위스키 찜만 가져오기 (게시글 좋아요 제외)

    if (error) {
      console.error('찜 목록 가져오기 실패:', error)
      return []
    }

    return likes?.map(like => like.whisky_id) || []
    */
  } catch (error) {
    console.error('찜 목록 가져오기 중 오류:', error)
    return []
  }
}

// 위스키 찜하기 (좋아요 추가)
export async function addWhiskyLike(whiskyId: string): Promise<boolean> {
  try {
    console.log('⚠️ 위스키 찜 기능 임시 비활성화됨:', whiskyId)
    return false
    // TODO: likes 테이블 스키마 문제로 임시 비활성화
  } catch (error) {
    console.error('찜하기 중 오류:', error)
    return false
  }
}

// 위스키 찜 취소 (좋아요 제거)
export async function removeWhiskyLike(whiskyId: string): Promise<boolean> {
  try {
    console.log('⚠️ 위스키 찜 취소 기능 임시 비활성화됨:', whiskyId)
    return false
    // TODO: likes 테이블 스키마 문제로 임시 비활성화
  } catch (error) {
    console.error('찜 취소 중 오류:', error)
    return false
  }
}

// 특정 위스키가 찜되어 있는지 확인
export async function isWhiskyLiked(whiskyId: string): Promise<boolean> {
  try {
    console.log('⚠️ 위스키 찜 상태 확인 기능 임시 비활성화됨:', whiskyId)
    return false
    // TODO: likes 테이블 스키마 문제로 임시 비활성화
  } catch (error) {
    console.error('찜 상태 확인 중 오류:', error)
    return false
  }
}