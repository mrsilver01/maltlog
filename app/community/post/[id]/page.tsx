import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import PostDetailClient from '@/components/PostDetailClient'

export const revalidate = 60;

interface PostDetailPageProps {
  params: {
    id: string
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id: postId } = params

  // 서버에서 게시글 상세 정보 로드
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(`
      id,
      user_id,
      title,
      content,
      image_url,
      created_at,
      profiles (
        nickname,
        avatar_url
      )
    `)
    .eq('id', postId)
    .single()

  if (postError || !post) {
    redirect('/community')
  }

  // 서버에서 댓글 데이터 로드 (comments 테이블이 존재하지 않을 수 있으므로 안전하게 처리)
  let comments: any[] = []
  try {
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        user_id,
        post_id,
        content,
        created_at,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (!commentsError && commentsData) {
      comments = commentsData
    }
  } catch (error) {
    // comments 테이블이 존재하지 않으면 빈 배열로 처리
    console.log('Comments table does not exist, using empty array')
    comments = []
  }

  // 데이터 변환
  const transformedPost = {
    id: post.id,
    user_id: post.user_id,
    title: post.title,
    content: post.content,
    image_url: post.image_url,
    likes_count: 0, // Default to 0 since likes_count doesn't exist yet
    comments_count: comments?.length || 0, // Count comments array length
    created_at: post.created_at,
    profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
    author: Array.isArray(post.profiles) ? (post.profiles[0]?.nickname || '익명 사용자') : ((post.profiles as any)?.nickname || '익명 사용자'),
    authorImage: Array.isArray(post.profiles) ? (post.profiles[0]?.avatar_url || null) : ((post.profiles as any)?.avatar_url || null)
  }

  const transformedComments = comments?.map(comment => ({
    id: comment.id,
    user_id: comment.user_id,
    post_id: comment.post_id,
    content: comment.content,
    created_at: comment.created_at,
    profiles: Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles,
    author: Array.isArray(comment.profiles) ? (comment.profiles[0]?.nickname || '익명 사용자') : ((comment.profiles as any)?.nickname || '익명 사용자'),
    authorImage: Array.isArray(comment.profiles) ? (comment.profiles[0]?.avatar_url || null) : ((comment.profiles as any)?.avatar_url || null)
  })) || []

  // 서버 로그 제거 (운영 시 Sentry 연결 권장)

  return (
    <PostDetailClient
      post={transformedPost}
      initialComments={transformedComments}
    />
  )
}