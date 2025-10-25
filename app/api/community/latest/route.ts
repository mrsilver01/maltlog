import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('🔍 [API] /api/community/latest called')

    // 직접 posts 테이블 사용 (Supabase에서 데이터 존재 확인됨)
    console.log('🔍 [API] Querying posts table directly...')
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

    console.log('🔍 [API] Query result:', {
      dataLength: data?.length ?? 0,
      error: error?.message ?? null,
      rawData: data
    })

    if (error) {
      console.error('❌ [API] posts table query error:', error)
      return new Response('[]', {
        status: 200,
        headers: { 'Cache-Control': 'no-store' }
      })
    }

    if (!data || data.length === 0) {
      console.log('⚠️ [API] No posts found in database')
      return new Response('[]', {
        status: 200,
        headers: { 'Cache-Control': 'no-store' }
      })
    }

    const payload = data.map((p: any) => ({
      id: p.id,
      title: p.title,
      author: p.profiles?.nickname ?? '익명',
      authorImage: p.profiles?.avatar_url ?? null,
      createdAt: p.created_at,
      likes: p.likes_count ?? 0,
      comments: p.comments_count ?? 0,
    }))

    console.log('✅ [API] Final payload:', {
      payloadLength: payload.length,
      payload: payload
    })

    return Response.json(payload, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (e) {
    console.error('💥 [API] latest API fatal:', e)
    return new Response('[]', {
      status: 200,
      headers: { 'Cache-Control': 'no-store' }
    })
  }
}