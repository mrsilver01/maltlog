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
      likes_count,
      comments_count,
      created_at,
      updated_at,
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

  // 서버에서 댓글 데이터 로드
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select(`
      id,
      user_id,
      post_id,
      content,
      created_at,
      updated_at,
      profiles (
        nickname,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  // 댓글 로드 오류는 치명적이지 않으므로 빈 배열로 처리

  // 데이터 변환
  const transformedPost = {
    id: post.id,
    user_id: post.user_id,
    title: post.title,
    content: post.content,
    image_url: post.image_url,
    likes_count: post.likes_count || 0,
    comments_count: post.comments_count || 0,
    created_at: post.created_at,
    updated_at: post.updated_at,
    profiles: post.profiles,
    author: post.profiles?.nickname || '익명 사용자',
    authorImage: post.profiles?.avatar_url || null
  }

  const transformedComments = comments?.map(comment => ({
    id: comment.id,
    user_id: comment.user_id,
    post_id: comment.post_id,
    content: comment.content,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    profiles: comment.profiles,
    author: comment.profiles?.nickname || '익명 사용자',
    authorImage: comment.profiles?.avatar_url || null
  })) || []

  // 서버 로그 제거 (운영 시 Sentry 연결 권장)

  return (
    <PostDetailClient
      post={transformedPost}
      initialComments={transformedComments}
    />
  )
}