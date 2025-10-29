import { supabase } from './supabase'

/**
 * 커뮤니티 게시글 기능을 위한 Supabase 헬퍼 함수들
 */

// Storage 설정 상수
const STORAGE_BUCKET = 'community' // 운영 버킷명이 다르면 여기서 변경
const IMAGE_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
} as const

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
  likes: number  // 좋아요 수
  comments: number  // 댓글 수
  createdAt?: string  // 생성 일시 (변환된 형태)
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

    // 데이터 변환
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
      // 추가 필드
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

// dataURL을 File 객체로 변환하는 헬퍼 함수
function dataUrlToFile(dataUrl: string, filename: string): File {
  const [meta, b64] = dataUrl.split(',')
  const mime = /data:(.*?);base64/.exec(meta)?.[1] || 'image/jpeg'
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i)
  }
  return new File([bytes], filename, { type: mime })
}

// 새 게시글 작성
export async function createCommunityPost(
  title: string,
  content: string,
  imageDataUrl?: string
): Promise<{ success: boolean; id?: string }> {
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

    let image_url: string | null = null

    // 이미지가 있으면 Storage에 업로드
    if (imageDataUrl) {
      console.log('🖼️ 이미지 업로드 시작...')
      const file = dataUrlToFile(imageDataUrl, 'post.jpg')

      // 업로드 경로: userId/randomUUID.jpg (RLS 정책 준수)
      const fileExtension = IMAGE_EXTENSIONS[file.type as keyof typeof IMAGE_EXTENSIONS] || '.jpg'
      const path = `${user.id}/${crypto.randomUUID()}${fileExtension}`

      console.log('📁 업로드 설정:', {
        bucket: STORAGE_BUCKET,
        path: path,
        userId: user.id
      })
      console.log('📊 파일 정보:', {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeInMB: (file.size / 1024 / 1024).toFixed(2)
      })

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, {
          cacheControl: '31536000',
          upsert: false
        })

      if (uploadError) {
        console.error('❌ 이미지 업로드 실패 상세:', {
          error: uploadError,
          message: uploadError.message,
          bucket: STORAGE_BUCKET,
          path: path,
          fileSize: file.size,
          fileType: file.type
        })
        throw new Error(`이미지 업로드 실패: ${uploadError.message}`)
      }

      console.log('✅ 이미지 업로드 성공:', uploadData)

      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(path)

      console.log('🔗 생성된 public URL:', publicUrl)
      image_url = publicUrl
    }

    const postData: Partial<CommunityPost> = {
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      image_url: image_url || undefined
    }

    console.log('📝 게시글 작성 시도 - 입력 데이터:', postData)

    const { data: newPost, error } = await supabase
      .from('posts')
      .insert(postData)
      .select('id')
      .single()

    if (error) {
      console.error('Supabase 게시글 insert 실패! 상세 오류:', error)
      return { success: false }
    }

    console.log('✅ 게시글 작성 성공:', newPost.id)
    return { success: true, id: newPost.id }
  } catch (error) {
    console.error('게시글 작성 중 예상치 못한 오류:', error)
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
      image_url: imageUrl || undefined
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

// 전체 게시글 개수 가져오기 (페이지네이션용)
export async function getPostsCount(searchQuery?: string): Promise<number> {
  try {
    let query = supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })

    // 검색어가 있고 2글자 이상이면 제목 또는 내용에서 검색
    if (searchQuery && searchQuery.trim().length >= 2) {
      const searchTerm = searchQuery.trim()
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    }

    const { count, error } = await query

    if (error) {
      console.error('게시글 개수 가져오기 실패:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('게시글 개수 가져오기 중 오류:', error)
    return 0
  }
}

// 페이지네이션을 지원하는 커뮤니티 게시글 가져오기 (검색 지원, 제목+내용 검색)
export async function getCommunityPosts(
  page: number = 0,
  limit: number = 4,
  searchQuery?: string
): Promise<CommunityPostWithProfile[]> {
  try {
    const startIndex = page * limit
    const endIndex = startIndex + limit - 1

    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles (
          nickname,
          avatar_url
        )
      `)

    // 검색어가 있고 2글자 이상이면 제목 또는 내용에서 검색
    if (searchQuery && searchQuery.trim().length >= 2) {
      const searchTerm = searchQuery.trim()
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    }

    const { data: posts, error } = await query
      .order('created_at', { ascending: false })
      .range(startIndex, endIndex)

    if (error) {
      console.error('게시글 페이지네이션 가져오기 실패:', error)
      return []
    }

    // 데이터 변환
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
      // 추가 필드
      author: post.profiles?.nickname || '익명 사용자',
      authorImage: post.profiles?.avatar_url || null,
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
      createdAt: post.created_at
    })) || []

    const searchInfo = (searchQuery && searchQuery.trim().length >= 2) ? ` (검색어: "${searchQuery.trim()}")` : ''
    console.log(`✅ 페이지 ${page + 1}: ${transformedPosts.length}개 게시글 로드 완료${searchInfo}`)
    return transformedPosts
  } catch (error) {
    console.error('게시글 페이지네이션 가져오기 중 오류:', error)
    return []
  }
}