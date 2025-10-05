import { supabase } from './supabase'

/**
 * 커뮤니티 게시글 기능을 위한 Supabase 헬퍼 함수들
 */

export interface CommunityPost {
  id?: string
  user_id: string
  title: string
  content: string
  image_url?: string
  likes_count?: number
  comments_count?: number
  created_at?: string
  updated_at?: string
  // JOIN으로 가져올 프로필 정보
  profiles?: {
    nickname: string
    avatar_url?: string
  }
}

export interface CommunityPostWithProfile extends CommunityPost {
  author: string  // 닉네임
  authorImage?: string  // 프로필 이미지
}

// 모든 커뮤니티 게시글 가져오기 (프로필 정보 포함)
export async function getAllCommunityPosts(): Promise<CommunityPostWithProfile[]> {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('게시글 목록 가져오기 실패:', error)
      return []
    }

    // 데이터 변환: 기존 localStorage 형식과 호환되도록
    const transformedPosts = posts?.map(post => ({
      id: post.id,
      user_id: post.user_id,
      title: post.title,
      content: post.content,
      image_url: post.image_url,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      created_at: post.created_at,
      updated_at: post.updated_at,
      // localStorage 호환을 위한 추가 필드
      author: post.profiles?.nickname || '익명 사용자',
      authorImage: post.profiles?.avatar_url || null,
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
      createdAt: post.created_at
    })) || []

    console.log(`✅ ${transformedPosts.length}개 게시글 로드 완료`)
    return transformedPosts
  } catch (error) {
    console.error('게시글 목록 가져오기 중 오류:', error)
    return []
  }
}

// 특정 사용자의 게시글만 가져오기
export async function getUserCommunityPosts(userId: string): Promise<CommunityPostWithProfile[]> {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
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
      console.error('사용자 게시글 가져오기 실패:', error)
      return []
    }

    const transformedPosts = posts?.map(post => ({
      id: post.id,
      user_id: post.user_id,
      title: post.title,
      content: post.content,
      image_url: post.image_url,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author: post.profiles?.nickname || '익명 사용자',
      authorImage: post.profiles?.avatar_url || null,
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
      createdAt: post.created_at
    })) || []

    return transformedPosts
  } catch (error) {
    console.error('사용자 게시글 가져오기 중 오류:', error)
    return []
  }
}

// 새 게시글 작성
export async function createCommunityPost(
  title: string,
  content: string,
  imageUrl?: string
): Promise<{ success: boolean; postId?: string }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('로그인이 필요합니다')
      return { success: false }
    }

    if (!title.trim() || !content.trim()) {
      console.error('제목과 내용을 입력해주세요')
      return { success: false }
    }

    const postData: Partial<CommunityPost> = {
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      image_url: imageUrl || null,
      likes_count: 0,
      comments_count: 0
    }

    const { data: newPost, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single()

    if (error) {
      console.error('게시글 작성 실패:', error)
      return { success: false }
    }

    console.log('✅ 게시글 작성 성공:', newPost.id)
    return { success: true, postId: newPost.id }
  } catch (error) {
    console.error('게시글 작성 중 오류:', error)
    return { success: false }
  }
}

// 게시글 수정
export async function updateCommunityPost(
  postId: string,
  title: string,
  content: string,
  imageUrl?: string
): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('로그인이 필요합니다')
      return false
    }

    const updateData: Partial<CommunityPost> = {
      title: title.trim(),
      content: content.trim(),
      image_url: imageUrl || null
    }

    const { error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .eq('user_id', user.id) // 작성자만 수정 가능

    if (error) {
      console.error('게시글 수정 실패:', error)
      return false
    }

    console.log('✅ 게시글 수정 성공:', postId)
    return true
  } catch (error) {
    console.error('게시글 수정 중 오류:', error)
    return false
  }
}

// 게시글 삭제
export async function deleteCommunityPost(postId: string): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('로그인이 필요합니다')
      return false
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id) // 작성자만 삭제 가능

    if (error) {
      console.error('게시글 삭제 실패:', error)
      return false
    }

    console.log('✅ 게시글 삭제 성공:', postId)
    return true
  } catch (error) {
    console.error('게시글 삭제 중 오류:', error)
    return false
  }
}

// 특정 게시글 상세 정보 가져오기
export async function getCommunityPost(postId: string): Promise<CommunityPostWithProfile | null> {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .eq('id', postId)
      .single()

    if (error) {
      console.error('게시글 가져오기 실패:', error)
      return null
    }

    const transformedPost: CommunityPostWithProfile = {
      id: post.id,
      user_id: post.user_id,
      title: post.title,
      content: post.content,
      image_url: post.image_url,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author: post.profiles?.nickname || '익명 사용자',
      authorImage: post.profiles?.avatar_url || null,
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
      createdAt: post.created_at
    }

    return transformedPost
  } catch (error) {
    console.error('게시글 가져오기 중 오류:', error)
    return null
  }
}

// 게시글 좋아요 수 업데이트 (댓글 시스템과 연동될 때 사용)
export async function updatePostLikesCount(postId: string, newCount: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('posts')
      .update({ likes_count: newCount })
      .eq('id', postId)

    if (error) {
      console.error('좋아요 수 업데이트 실패:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('좋아요 수 업데이트 중 오류:', error)
    return false
  }
}

// 게시글 댓글 수 업데이트 (댓글 시스템과 연동될 때 사용)
export async function updatePostCommentsCount(postId: string, newCount: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('posts')
      .update({ comments_count: newCount })
      .eq('id', postId)

    if (error) {
      console.error('댓글 수 업데이트 실패:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('댓글 수 업데이트 중 오류:', error)
    return false
  }
}