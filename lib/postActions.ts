import { supabaseBrowser } from '@/lib/supabase/browser'

/**
 * 게시글 좋아요 기능을 위한 Supabase 헬퍼 함수들
 */

// 게시글에 좋아요 추가
export async function likePost(postId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await (supabaseBrowser() as any)
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: userId
      })

    if (error) {
      console.error('게시글 좋아요 실패:', error)
      return false
    }

    console.log('✅ 게시글 좋아요 성공:', postId)
    return true
  } catch (error) {
    console.error('게시글 좋아요 중 오류:', error)
    return false
  }
}

// 게시글 좋아요 취소
export async function unlikePost(postId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabaseBrowser()
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)

    if (error) {
      console.error('게시글 좋아요 취소 실패:', error)
      return false
    }

    console.log('✅ 게시글 좋아요 취소 성공:', postId)
    return true
  } catch (error) {
    console.error('게시글 좋아요 취소 중 오류:', error)
    return false
  }
}

// 게시글에 좋아요를 눌렀는지 확인
export async function checkIfPostLiked(postId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseBrowser()
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116은 "no rows returned" 에러
      console.error('게시글 좋아요 상태 확인 실패:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('게시글 좋아요 상태 확인 중 오류:', error)
    return false
  }
}

// 특정 게시글의 총 좋아요 개수 가져오기
export async function getPostLikesCount(postId: string): Promise<number> {
  try {
    const { count, error } = await supabaseBrowser()
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)

    if (error) {
      console.error('게시글 좋아요 개수 조회 실패:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('게시글 좋아요 개수 조회 중 오류:', error)
    return 0
  }
}

// 여러 게시글의 좋아요 상태를 한번에 확인 (성능 최적화)
export async function checkMultiplePostsLiked(postIds: string[], userId: string): Promise<{[key: string]: boolean}> {
  try {
    const { data, error } = await supabaseBrowser()
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds)

    if (error) {
      console.error('여러 게시글 좋아요 상태 확인 실패:', error)
      return {}
    }

    // 결과를 객체로 변환
    const likedPosts: {[key: string]: boolean} = {}
    postIds.forEach(id => {
      likedPosts[id] = false
    })

    data?.forEach((like: any) => {
      likedPosts[like.post_id] = true
    })

    return likedPosts
  } catch (error) {
    console.error('여러 게시글 좋아요 상태 확인 중 오류:', error)
    return {}
  }
}

// 게시글 좋아요 개수 업데이트 (posts 테이블의 likes_count 필드)
// 참고: 실제 Supabase에서는 RPC 함수나 트리거를 사용하는 것이 더 안전함
export async function updatePostLikesCount(postId: string): Promise<boolean> {
  try {
    // 현재 좋아요 개수 조회
    const currentCount = await getPostLikesCount(postId)

    // posts 테이블의 likes_count 업데이트
    const { error } = await (supabaseBrowser() as any)
      .from('posts')
      .update({ likes_count: currentCount })
      .eq('id', postId)

    if (error) {
      console.error('게시글 좋아요 개수 업데이트 실패:', error)
      return false
    }

    console.log('✅ 게시글 좋아요 개수 업데이트 성공:', postId, currentCount)
    return true
  } catch (error) {
    console.error('게시글 좋아요 개수 업데이트 중 오류:', error)
    return false
  }
}