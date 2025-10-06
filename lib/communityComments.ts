import { supabase } from './supabase'

/**
 * 커뮤니티 댓글 기능을 위한 Supabase 헬퍼 함수들
 */

export interface CommunityComment {
  id?: string
  post_id: string
  user_id: string
  content: string
  created_at?: string
  updated_at?: string
  // JOIN으로 가져올 프로필 정보
  profiles?: {
    nickname: string
    avatar_url?: string
  }
}

export interface CommunityCommentWithProfile extends CommunityComment {
  author: string  // 닉네임
  authorImage?: string  // 프로필 이미지
  postId: string
  createdAt: string
}

// 특정 게시글의 모든 댓글 가져오기 (프로필 정보 포함)
export async function getPostComments(postId: string): Promise<CommunityCommentWithProfile[]> {
  try {
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true }) // 댓글은 시간 순으로 정렬

    if (error) {
      console.error('댓글 목록 가져오기 실패:', error)
      return []
    }

    // 데이터 변환
    const transformedComments = comments?.map(comment => ({
      id: comment.id,
      post_id: comment.post_id,
      user_id: comment.user_id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      // 추가 필드
      author: comment.profiles?.nickname || '익명 사용자',
      authorImage: comment.profiles?.avatar_url || undefined,
      postId: comment.post_id,
      createdAt: comment.created_at
    })) || []

    console.log(`✅ 게시글 ${postId}의 댓글 ${transformedComments.length}개 로드 완료`)
    return transformedComments
  } catch (error) {
    console.error('댓글 목록 가져오기 중 오류:', error)
    return []
  }
}

// 새 댓글 작성
export async function createComment(
  postId: string,
  content: string
): Promise<{ success: boolean; commentId?: string }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('로그인이 필요합니다')
      return { success: false }
    }

    if (!content.trim()) {
      console.error('댓글 내용을 입력해주세요')
      return { success: false }
    }

    const commentData: Partial<CommunityComment> = {
      post_id: postId,
      user_id: user.id,
      content: content.trim()
    }

    const { data: newComment, error } = await supabase
      .from('comments')
      .insert(commentData)
      .select()
      .single()

    if (error) {
      console.error('댓글 작성 실패:', error)
      return { success: false }
    }

    console.log('✅ 댓글 작성 성공:', newComment.id)
    return { success: true, commentId: newComment.id }
  } catch (error) {
    console.error('댓글 작성 중 오류:', error)
    return { success: false }
  }
}

// 댓글 수정
export async function updateComment(
  commentId: string,
  content: string
): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('로그인이 필요합니다')
      return false
    }

    if (!content.trim()) {
      console.error('댓글 내용을 입력해주세요')
      return false
    }

    const { error } = await supabase
      .from('comments')
      .update({ content: content.trim() })
      .eq('id', commentId)
      .eq('user_id', user.id) // 작성자만 수정 가능

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
export async function deleteComment(commentId: string): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('로그인이 필요합니다')
      return false
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id) // 작성자만 삭제 가능

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

// 특정 사용자의 모든 댓글 가져오기
export async function getUserComments(userId: string): Promise<CommunityCommentWithProfile[]> {
  try {
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('사용자 댓글 가져오기 실패:', error)
      return []
    }

    const transformedComments = comments?.map(comment => ({
      id: comment.id,
      post_id: comment.post_id,
      user_id: comment.user_id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      author: comment.profiles?.nickname || '익명 사용자',
      authorImage: comment.profiles?.avatar_url || undefined,
      postId: comment.post_id,
      createdAt: comment.created_at
    })) || []

    return transformedComments
  } catch (error) {
    console.error('사용자 댓글 가져오기 중 오류:', error)
    return []
  }
}

// 특정 댓글 상세 정보 가져오기
export async function getComment(commentId: string): Promise<CommunityCommentWithProfile | null> {
  try {
    const { data: comment, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .eq('id', commentId)
      .single()

    if (error) {
      console.error('댓글 가져오기 실패:', error)
      return null
    }

    const transformedComment: CommunityCommentWithProfile = {
      id: comment.id,
      post_id: comment.post_id,
      user_id: comment.user_id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      author: comment.profiles?.nickname || '익명 사용자',
      authorImage: comment.profiles?.avatar_url || undefined,
      postId: comment.post_id,
      createdAt: comment.created_at
    }

    return transformedComment
  } catch (error) {
    console.error('댓글 가져오기 중 오류:', error)
    return null
  }
}

// 게시글의 댓글 수 업데이트 (게시글과 연동될 때 사용)
export async function updatePostCommentsCount(postId: string): Promise<boolean> {
  try {
    // 해당 게시글의 총 댓글 수 계산
    const { count, error: countError } = await supabase
      .from('comments')
      .select('id', { count: 'exact' })
      .eq('post_id', postId)

    if (countError) {
      console.error('댓글 수 계산 실패:', countError)
      return false
    }

    // 게시글의 comments_count 업데이트
    const { error: updateError } = await supabase
      .from('posts')
      .update({ comments_count: count || 0 })
      .eq('id', postId)

    if (updateError) {
      console.error('게시글 댓글 수 업데이트 실패:', updateError)
      return false
    }

    console.log(`✅ 게시글 ${postId}의 댓글 수 업데이트: ${count}`)
    return true
  } catch (error) {
    console.error('댓글 수 업데이트 중 오류:', error)
    return false
  }
}