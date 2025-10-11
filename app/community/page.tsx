import { supabase } from '@/lib/supabase'
import CommunityClient from '@/components/CommunityClient'
import { CommunityPostWithProfile } from '@/lib/communityPosts'

export default async function CommunityPage() {
  // 서버에서 게시글 데이터 로드 (profiles 테이블과 JOIN)
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
  }

  // 데이터 변환
  const transformedPosts: CommunityPostWithProfile[] = posts?.map(post => ({
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
    // 추가 필드
    author: post.profiles?.nickname || '익명 사용자',
    authorImage: post.profiles?.avatar_url || null,
    likes: post.likes_count || 0,
    comments: post.comments_count || 0,
    createdAt: post.created_at
  })) || []

  console.log(`서버에서 ${transformedPosts.length}개 커뮤니티 게시글 로드 완료`)

  return <CommunityClient initialPosts={transformedPosts} />
}