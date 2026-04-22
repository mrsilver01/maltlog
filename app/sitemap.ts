import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://maltlog.kr'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// 1시간 캐시 (DB 부하 방지)
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/community`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  const supabase = getSupabase()
  if (!supabase) return staticRoutes

  // 위스키 상세 페이지
  const { data: whiskies } = await supabase
    .from('whiskies')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(2000)

  const whiskyRoutes: MetadataRoute.Sitemap = (whiskies ?? []).map((w) => ({
    url: `${BASE_URL}/whisky/${w.id}`,
    lastModified: w.created_at ? new Date(w.created_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // 커뮤니티 게시글
  const { data: posts } = await supabase
    .from('posts')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(1000)

  const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${BASE_URL}/community/post/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...whiskyRoutes, ...postRoutes]
}
