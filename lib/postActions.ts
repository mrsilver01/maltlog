import { supabaseBrowser } from '@/lib/supabase/browser'

/**
 * 게시글 좋아요 기능을 위한 Supabase 헬퍼 함수들
 */

type PostLikeInsert = {
  post_id: string
  user_id: string
}

type PostLikeRow = {
  post_id: string
}

export async function likePost(postId: string, userId: string): Promise<boolean> {
  try {
    const payload: PostLikeInsert = {
      post_id: postId,
      user_id: userId,
    }

    const { error } = await supabaseBrowser().from('post_likes').insert(payload)

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

export async function checkIfPostLiked(postId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseBrowser()
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('게시글 좋아요 상태 확인 실패:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('게시글 좋아요 상태 확인 중 오류:', error)
    return false
  }
}

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

export async function checkMultiplePostsLiked(
  postIds: string[],
  userId: string,
): Promise<Record<string, boolean>> {
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

    const likedPosts: Record<string, boolean> = {}
    postIds.forEach((id) => {
      likedPosts[id] = false
    })

    ;((data ?? []) as PostLikeRow[]).forEach((like) => {
      likedPosts[like.post_id] = true
    })

    return likedPosts
  } catch (error) {
    console.error('여러 게시글 좋아요 상태 확인 중 오류:', error)
    return {}
  }
}
