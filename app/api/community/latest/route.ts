import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        created_at,
        likes_count,
        comments_count,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('커뮤니티 프리뷰 로드 오류:', error)
      return Response.json([])
    }

    const payload = (data ?? []).map((p: any) => ({
      id: p.id,
      title: p.title,
      author: Array.isArray(p.profiles) ? (p.profiles[0]?.nickname || '익명') : (p.profiles?.nickname || '익명'),
      authorImage: Array.isArray(p.profiles) ? (p.profiles[0]?.avatar_url || null) : (p.profiles?.avatar_url || null),
      createdAt: p.created_at,
      likes: p.likes_count || 0,
      comments: p.comments_count || 0,
    }))

    return Response.json(payload)
  } catch (error) {
    console.error('커뮤니티 프리뷰 API 오류:', error)
    return Response.json([])
  }
}