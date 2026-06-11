'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'

interface ReviewRow {
  rating: number | null
  created_at: string
  whiskies: { region: string | null } | { region: string | null }[] | null
}

interface RegionStat {
  region: string
  count: number
  avgRating: number
}

interface MonthStat {
  label: string
  count: number
}

/** 지역 키워드 → 취향 뱃지 타이틀 */
function tasteBadge(topRegion: string | null, avgRating: number, total: number): { emoji: string; title: string; desc: string } {
  if (total === 0) return { emoji: '🥃', title: '첫 잔을 기다리는 중', desc: '첫 시음 노트를 남겨보세요' }

  const r = (topRegion || '').toLowerCase()
  let regionPart: { emoji: string; title: string } = { emoji: '🥃', title: '위스키 탐험가' }
  if (r.includes('islay') || r.includes('아일라')) regionPart = { emoji: '🔥', title: '피트 헌터' }
  else if (r.includes('speyside') || r.includes('스페이사이드')) regionPart = { emoji: '🍯', title: '스페이사이드 순례자' }
  else if (r.includes('highland') || r.includes('하이랜드')) regionPart = { emoji: '⛰️', title: '하이랜드 방랑자' }
  else if (r.includes('lowland') || r.includes('로우랜드')) regionPart = { emoji: '🌾', title: '로우랜드 신사' }
  else if (r.includes('campbeltown') || r.includes('캠벨타운')) regionPart = { emoji: '⚓', title: '캠벨타운 항해사' }
  else if (r.includes('japan') || r.includes('일본')) regionPart = { emoji: '🌸', title: '재패니즈 감별사' }
  else if (r.includes('ireland') || r.includes('irish') || r.includes('아일랜드')) regionPart = { emoji: '🍀', title: '아이리시 로머' }
  else if (r.includes('america') || r.includes('bourbon') || r.includes('kentucky') || r.includes('미국') || r.includes('버번')) regionPart = { emoji: '🤠', title: '버번 카우보이' }

  let desc = '균형 잡힌 미각의 소유자'
  if (avgRating >= 4.2) desc = '잔마다 사랑이 넘치는 후한 평가자'
  else if (avgRating > 0 && avgRating <= 3.0) desc = '쉽게 만족하지 않는 깐깐한 미각'

  return { ...regionPart, desc }
}

export default function TasteProfileCard({ userId }: { userId: string }) {
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error } = await supabaseBrowser()
        .from('reviews')
        .select('rating, created_at, whiskies(region)')
        .eq('user_id', userId)

      if (!cancelled) {
        if (!error && data) setReviews(data as ReviewRow[])
        setLoaded(true)
      }
    }
    load()
    return () => { cancelled = true }
  }, [userId])

  const stats = useMemo(() => {
    const total = reviews.length
    const ratings = reviews.map(r => r.rating || 0).filter(r => r > 0)
    const avgRating = ratings.length > 0
      ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length * 10) / 10
      : 0

    // 별점 분포 (1.0 단위 5칸: 내림 처리, 5.0은 5칸에 포함)
    const dist = [0, 0, 0, 0, 0]
    ratings.forEach(r => {
      const idx = Math.min(4, Math.max(0, Math.ceil(r) - 1))
      dist[idx] += 1
    })
    const maxDist = Math.max(...dist, 1)

    // 지역별 통계
    const regionMap = new Map<string, { count: number; sum: number }>()
    reviews.forEach(r => {
      const w = Array.isArray(r.whiskies) ? r.whiskies[0] : r.whiskies
      const region = w?.region?.trim()
      if (!region) return
      const cur = regionMap.get(region) || { count: 0, sum: 0 }
      cur.count += 1
      cur.sum += r.rating || 0
      regionMap.set(region, cur)
    })
    const regions: RegionStat[] = [...regionMap.entries()]
      .map(([region, { count, sum }]) => ({
        region,
        count,
        avgRating: Math.round((sum / count) * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
    const maxRegion = Math.max(...regions.map(r => r.count), 1)

    // 최근 6개월 기록 추이
    const months: MonthStat[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const count = reviews.filter(r => r.created_at?.startsWith(key)).length
      months.push({ label: `${d.getMonth() + 1}월`, count })
    }
    const maxMonth = Math.max(...months.map(m => m.count), 1)

    const topRegion = regions.length > 0 ? regions[0].region : null
    const badge = tasteBadge(topRegion, avgRating, total)

    return { total, avgRating, dist, maxDist, regions, maxRegion, months, maxMonth, badge }
  }, [reviews])

  if (!loaded) {
    return (
      <div className="border border-rose-300 rounded mb-6 sm:mb-8 bg-rose-50 p-4 animate-pulse">
        <div className="h-4 bg-rose-200 rounded w-1/3 mb-3"></div>
        <div className="h-20 bg-rose-100 rounded"></div>
      </div>
    )
  }

  return (
    <div className="border border-rose-300 rounded mb-6 sm:mb-8 bg-rose-50 overflow-hidden">
      {/* 취향 뱃지 헤더 */}
      <div className="bg-gradient-to-r from-amber-800 to-rose-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{stats.badge.emoji}</span>
          <div>
            <div className="text-sm sm:text-base font-bold text-amber-100">{stats.badge.title}</div>
            <div className="text-xs text-rose-200">{stats.badge.desc}</div>
          </div>
        </div>
      </div>

      {stats.total === 0 ? (
        <div className="text-center text-gray-500 py-6 text-sm">
          시음 노트를 남기면 취향 분석이 시작됩니다 🍂
        </div>
      ) : (
        <div className="p-4 space-y-5">
          {/* 별점 분포 */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <h4 className="text-sm font-bold text-gray-800">별점 분포</h4>
              <span className="text-xs text-rose-700">평균 ★{stats.avgRating}</span>
            </div>
            <div className="space-y-1">
              {[4, 3, 2, 1, 0].map(i => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-7 text-right">★{i + 1}</span>
                  <div className="flex-1 h-3 bg-rose-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.dist[i] / stats.maxDist) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-5">{stats.dist[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 지역별 선호 */}
          {stats.regions.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2">지역별 선호</h4>
              <div className="space-y-1.5">
                {stats.regions.map(r => (
                  <div key={r.region} className="flex items-center gap-2">
                    <span className="text-xs text-gray-700 w-20 truncate" title={r.region}>{r.region}</span>
                    <div className="flex-1 h-3 bg-rose-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-700 rounded-full transition-all duration-500"
                        style={{ width: `${(r.count / stats.maxRegion) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{r.count}병 · ★{r.avgRating}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 최근 6개월 기록 추이 */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2">최근 6개월 기록</h4>
            <div className="flex items-end gap-1.5 h-16">
              {stats.months.map(m => (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[10px] text-gray-500">{m.count > 0 ? m.count : ''}</span>
                  <div
                    className="w-full bg-amber-700/80 rounded-t transition-all duration-500"
                    style={{ height: `${Math.max((m.count / stats.maxMonth) * 100, m.count > 0 ? 8 : 2)}%` }}
                  />
                  <span className="text-[10px] text-gray-600">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
