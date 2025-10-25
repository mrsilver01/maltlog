import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('🔍 [API] /api/community/latest called')

    // 양방향 호환: community_posts 테이블 먼저 시도, 실패시 posts 테이블 시도
    let data = null
    let error = null
    let tableName = ''

    // 1차 시도: community_posts 테이블
    try {
      console.log('🔍 [API] Trying community_posts table...')
      const result = await supabase
        .from('community_posts')
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

      if (!result.error && result.data) {
        data = result.data
        tableName = 'community_posts'
        console.log('✅ [API] community_posts table found and used')
      } else {
        throw new Error(result.error?.message || 'community_posts table query failed')
      }
    } catch (e) {
      console.log('⚠️ [API] community_posts failed, trying posts table...')

      // 2차 시도: posts 테이블
      try {
        const result = await supabase
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

        if (!result.error && result.data) {
          data = result.data
          tableName = 'posts'
          console.log('✅ [API] posts table found and used')
        } else {
          throw new Error(result.error?.message || 'posts table query failed')
        }
      } catch (e2) {
        console.error('❌ [API] Both table attempts failed')
        error = e2
      }
    }

    console.log('🔍 [API] Query result:', {
      tableName,
      dataLength: data?.length ?? 0,
      error: error ? (error as Error).message : null,
      rawData: data
    })

    if (error || !data) {
      console.error('❌ [API] No valid data found, returning empty array')
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

    console.log('✅ [API] Final payload:', {
      tableName,
      payloadLength: payload.length,
      payload: payload.slice(0, 1) // 첫 번째 항목만 로그
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