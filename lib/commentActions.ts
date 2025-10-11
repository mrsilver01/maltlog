import { supabase } from './supabase'

/**
 * 리뷰 댓글 기능을 위한 Supabase 헬퍼 함수들
 */

export interface ReviewComment {
  id: string
  review_id?: string
  post_id?: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  parent_comment_id?: number | null
  profiles: {
    nickname: string
    avatar_url: string | null
  } | null
}

// 특정 리뷰의 모든 댓글 가져오기
export async function getReviewComments(reviewId: string): Promise<ReviewComment[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .eq('review_id', reviewId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('댓글 조회 실패:', error)
      return []
    }

    return data as ReviewComment[]
  } catch (error) {
    console.error('댓글 조회 중 오류:', error)
    return []
  }
}

// 새 댓글 추가 (리뷰 또는 게시글용)
export async function addComment(
  targetId: string,
  userId: string,
  content: string,
  type: 'review' | 'post' = 'review',
  parentCommentId?: number
): Promise<boolean> {
  try {
    const commentData: any = {
      user_id: userId,
      content: content.trim(),
      parent_comment_id: parentCommentId || null
    }

    if (type === 'review') {
      commentData.review_id = targetId
      commentData.post_id = null
    } else {
      commentData.post_id = targetId
      commentData.review_id = null
    }

    const { error } = await supabase
      .from('comments')
      .insert(commentData)

    if (error) {
      console.error('댓글 추가 실패:', error)
      return false
    }

    console.log('✅ 댓글 추가 성공:', targetId)
    return true
  } catch (error) {
    console.error('댓글 추가 중 오류:', error)
    return false
  }
}

// 댓글 수정
export async function updateComment(commentId: string, userId: string, content: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .eq('user_id', userId) // 본인이 작성한 댓글만 수정 가능

    if (error) {
      console.error('댓글 수정 실패:', error)
      return false
    }

    console.log('✅ 댓글 수정 성공:', commentId)
    return true
  } catch (error) {
    console.error('댓글 수정 중 오류:', error)
    return false
  }
}

// 댓글 삭제
export async function deleteComment(commentId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId) // 본인이 작성한 댓글만 삭제 가능

    if (error) {
      console.error('댓글 삭제 실패:', error)
      return false
    }

    console.log('✅ 댓글 삭제 성공:', commentId)
    return true
  } catch (error) {
    console.error('댓글 삭제 중 오류:', error)
    return false
  }
}

// 특정 리뷰의 댓글 개수 가져오기
export async function getReviewCommentsCount(reviewId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId)

    if (error) {
      console.error('댓글 개수 조회 실패:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('댓글 개수 조회 중 오류:', error)
    return 0
  }
}

// === 게시글 댓글 관련 함수들 ===

// 게시글의 최상위 댓글만 가져오기 (답글 제외)
export async function getPostComments(postId: string): Promise<ReviewComment[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .is('parent_comment_id', null) // 최상위 댓글만
      .order('created_at', { ascending: true })

    if (error) {
      console.error('게시글 댓글 조회 실패:', error)
      return []
    }

    return data as ReviewComment[]
  } catch (error) {
    console.error('게시글 댓글 조회 중 오류:', error)
    return []
  }
}

// 특정 댓글의 답글들 가져오기
export async function getReplies(commentId: number): Promise<ReviewComment[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .eq('parent_comment_id', commentId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('답글 조회 실패:', error)
      return []
    }

    return data as ReviewComment[]
  } catch (error) {
    console.error('답글 조회 중 오류:', error)
    return []
  }
}

// 게시글의 전체 댓글 개수 가져오기 (답글 포함)
export async function getPostCommentsCount(postId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)

    if (error) {
      console.error('게시글 댓글 개수 조회 실패:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('게시글 댓글 개수 조회 중 오류:', error)
    return 0
  }
}