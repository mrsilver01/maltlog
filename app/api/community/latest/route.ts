import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type LatestPostRow = {
  id: string
  title: string
  created_at: string
  likes_count: number | null
  comments_count: number | null
  profiles:
    | {
        nickname?: string | null
        avatar_url?: string | null
      }
    | {
        nickname?: string | null
        avatar_url?: string | null
      }[]
    | null
}

function normalizeProfile(profile: LatestPostRow['profiles']) {
  if (Array.isArray(profile)) {
    return profile[0] ?? null
  }

  return profile
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        id,
        title,
        created_at,
        likes_count,
        comments_count,
        profiles (
          nickname,
          avatar_url
        )
      `,
      )
      .order('created_at', { ascending: false })
      .limit(3)

    if (error || !data) {
      console.error('[/api/community/latest] posts query error:', error)
      return new Response('[]', {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      })
    }

    const payload = (data as LatestPostRow[]).map((post) => {
      const profile = normalizeProfile(post.profiles)

      return {
        id: post.id,
        title: post.title,
        author: profile?.nickname ?? '익명',
        authorImage: profile?.avatar_url ?? null,
        createdAt: post.created_at,
        likes: post.likes_count ?? 0,
        comments: post.comments_count ?? 0,
      }
    })

    return Response.json(payload, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('[/api/community/latest] fatal:', error)
    return new Response('[]', {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
