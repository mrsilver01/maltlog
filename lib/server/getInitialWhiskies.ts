// lib/server/getInitialWhiskies.ts (RSC 전용)
// 서버 컴포넌트 / API 라우트 공용 Supabase 조회 & 정렬 유틸.
// 기존 /api/whiskies로의 HTTP 자기호출(antipattern)을 제거하고,
// 홈 RSC와 API 사이에서 "정렬 기준"을 단일 소스로 공유합니다.

import { createClient } from '@supabase/supabase-js'
import { toPublicImageUrl } from '@/lib/images'
import type { WhiskyListResponse, WhiskyWithStats } from '@/types/whisky'

const SELECT_COLUMNS = [
  'abv',
  'id',
  'price',
  'cask',
  'name',
  'name_ko',
  'image',
  'distillery',
  'is_featured',
  'display_order',
  'avg_rating',
  'reviews_count',
  'likes_count',
  'region',
].join(',')

/**
 * Server 전용 Supabase 클라이언트 (anon key).
 * 읽기 전용 / 공개 데이터 조회에 사용합니다.
 */
function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Supabase env vars are not set')
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * 이미지가 "실제" 이미지인지(플레이스홀더가 아닌지) 판별.
 * 홈/목록 정렬 품질의 기준입니다.
 */
function hasRealImage(image: string | null | undefined): boolean {
  if (!image) return false
  const lower = image.toLowerCase()
  if (lower.includes('no.pic')) return false
  if (lower.includes('placeholder')) return false
  return true
}

/**
 * 공용 정렬: 실제 이미지 > 추천 > 평점 > 리뷰수.
 * 홈 RSC와 /api/whiskies가 같은 결과를 반환하도록 이 함수를 공유합니다.
 */
export function sortWhiskiesForDisplay<T extends WhiskyWithStats>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const imgA = hasRealImage(a.image)
    const imgB = hasRealImage(b.image)
    if (imgA !== imgB) return imgA ? -1 : 1

    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1

    const ratingA = a.avg_rating ?? 0
    const ratingB = b.avg_rating ?? 0
    if (ratingA !== ratingB) return ratingB - ratingA

    return (b.reviews_count || 0) - (a.reviews_count || 0)
  })
}

/**
 * materialized view에서 전체 위스키 목록을 가져와 정렬한 뒤 반환합니다.
 * API route와 홈 RSC 양쪽에서 호출됩니다.
 */
export async function fetchSortedWhiskies(): Promise<WhiskyWithStats[]> {
  const supabase = getServerSupabase()

  const { data, error } = await supabase
    .from('whiskies_with_stats_mat')
    .select(SELECT_COLUMNS)
    .order('display_order', { ascending: true })
    .order('id', { ascending: true })

  if (error) {
    console.error('[fetchSortedWhiskies] Supabase error:', error.message)
    return []
  }

  const raw = (data ?? []) as unknown as WhiskyWithStats[]
  const normalized: WhiskyWithStats[] = raw.map((w) => ({
    ...w,
    image: toPublicImageUrl(w.image ?? undefined),
  }))

  return sortWhiskiesForDisplay(normalized)
}

/**
 * 홈 페이지 초기 렌더에 필요한 위스키 목록을 반환합니다.
 * - materialized view(whiskies_with_stats_mat) 사용
 * - ISR 캐시와 함께 동작하도록 side-effect 없는 순수 함수
 */
export async function getInitialWhiskies(limit = 100): Promise<WhiskyListResponse> {
  try {
    const items = await fetchSortedWhiskies()
    const paginated = items.slice(0, limit)
    const nextCursor = items.length > limit ? limit : null
    return { items: paginated, nextCursor }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error'
    console.error('[getInitialWhiskies] Unhandled error:', message)
    return { items: [], nextCursor: null }
  }
}
