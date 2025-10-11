import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import PostDetailClient from '@/components/PostDetailClient'

interface PostDetailPageProps {
  params: {
    id: string
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id: postId } = await params

  // 서버에서 게시글 상세 정보 로드
  const { data: post, error: postError } = await supabase
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

  if (postError || !post) {
    console.error('Supabase 게시글 로드 실패! 상세 오류:', postError)
    console.error('게시글 오류 코드:', postError?.code)
    console.error('게시글 오류 메시지:', postError?.message)
    console.error('게시글 오류 상세:', postError?.details)
    console.error('게시글 오류 힌트:', postError?.hint)
    console.error('게시글 쿼리 파라미터 - postId:', postId)
    redirect('/community')
  }

  // 서버에서 댓글 데이터 로드
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select(`
      *,
      profiles (
        nickname,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (commentsError) {
    console.error('Supabase 댓글 로드 실패! 상세 오류:', commentsError)
    console.error('댓글 오류 코드:', commentsError.code)
    console.error('댓글 오류 메시지:', commentsError.message)
    console.error('댓글 오류 상세:', commentsError.details)
    console.error('댓글 오류 힌트:', commentsError.hint)
    console.error('댓글 쿼리 파라미터 - postId:', postId)
  }

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

  console.log(`서버에서 게시글 "${post.title}" 데이터 로드 완료: 댓글 ${transformedComments.length}개`)

  return (
    <PostDetailClient
      post={transformedPost}
      initialComments={transformedComments}
    />
  )
}