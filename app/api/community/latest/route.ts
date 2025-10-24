import { supabase } from '@/lib/supabase'

// 서버 응답 캐시 방지
export const revalidate = 0

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
      console.error('latest API error:', error)
      return new Response('[]', {
        status: 200,
        headers: { 'Cache-Control': 'no-store' }
      })
    }

    const payload = (data ?? []).map((p: any) => ({
      id: p.id,
      title: p.title,
      author: p.profiles?.nickname ?? '익명',
      authorImage: p.profiles?.avatar_url ?? null,
      createdAt: p.created_at,
      likes: p.likes_count ?? 0,
      comments: p.comments_count ?? 0,
    }))

    return Response.json(payload, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (e) {
    console.error('latest API fatal:', e)
    return new Response('[]', {
      status: 200,
      headers: { 'Cache-Control': 'no-store' }
    })
  }
}