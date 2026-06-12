'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'

interface ReviewRow {
  rating: number | null
  created_at: string
  whisky_id: string | null
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

/** 지역 키워드 → 취향 타이틀 */
function tasteBadge(topRegion: string | null, avgRating: number, total: number): { title: string; desc: string } {
  if (total === 0) return { title: '첫 잔을 기다리는 중', desc: '첫 시음 노트를 남기면 취향 분석이 시작됩니다' }

  const r = (topRegion || '').toLowerCase()
  let title = '위스키 탐험가'
  if (r.includes('islay') || r.includes('아일라')) title = '피트 헌터'
  else if (r.includes('speyside') || r.includes('스페이사이드')) title = '스페이사이드 순례자'
  else if (r.includes('highland') || r.includes('하이랜드')) title = '하이랜드 방랑자'
  else if (r.includes('lowland') || r.includes('로우랜드')) title = '로우랜드 신사'
  else if (r.includes('campbeltown') || r.includes('캠벨타운')) title = '캠벨타운 항해사'
  else if (r.includes('japan') || r.includes('일본')) title = '재패니즈 감별사'
  else if (r.includes('ireland') || r.includes('irish') || r.includes('아일랜드')) title = '아이리시 로머'
  else if (r.includes('america') || r.includes('bourbon') || r.includes('kentucky') || r.includes('테네시') || r.includes('미국') || r.includes('버번')) title = '버번 카우보이'
  else if (r.includes('한국')) title = 'K-위스키 개척자'
  else if (r.includes('대만')) title = '포모사 셀렉터'

  let desc = '균형 잡힌 미각의 소유자'
  if (avgRating >= 4.2) desc = '잔마다 사랑이 넘치는 후한 평가자'
  else if (avgRating > 0 && avgRating <= 3.0) desc = '쉽게 만족하지 않는 깐깐한 미각'

  return { title, desc }
}

export default function TasteProfileCard({ userId }: { userId: string }) {
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [regionByWhisky, setRegionByWhisky] = useState<Map<string, string>>(new Map())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      // reviews ↔ whiskies 는 DB에 FK가 없어 embed 불가 → 2단계 조회
      const { data, error } = await supabaseBrowser()
        .from('reviews')
        .select('rating, created_at, whisky_id')
        .eq('user_id', userId)
      const reviewRows = (data ?? null) as ReviewRow[] | null

      if (error || !reviewRows) {
        if (!cancelled) setLoaded(true)
        if (error) console.error('취향 분석 리뷰 조회 실패:', error)
        return
      }

      const ids = [...new Set(reviewRows.map(r => r.whisky_id).filter(Boolean))] as string[]
      const map = new Map<string, string>()
      if (ids.length > 0) {
        const { data: whiskyData, error: whiskyError } = await supabaseBrowser()
          .from('whiskies')
          .select('id, region')
          .in('id', ids)
        if (whiskyError) console.error('취향 분석 위스키 조회 실패:', whiskyError)
        const whiskyRows = (whiskyData ?? []) as { id: string | null; region: string | null }[]
        whiskyRows.forEach(w => {
          if (w.id && w.region) map.set(w.id, w.region)
        })
      }

      if (!cancelled) {
        setReviews(reviewRows)
        setRegionByWhisky(map)
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

    // 별점 분포 (1.0 단위 5칸: 올림 처리, 0.5는 1칸에 포함)
    const dist = [0, 0, 0, 0, 0]
    ratings.forEach(r => {
      const idx = Math.min(4, Math.max(0, Math.ceil(r) - 1))
      dist[idx] += 1
    })
    const maxDist = Math.max(...dist, 1)

    // 지역별 통계
    const regionMap = new Map<string, { count: number; sum: number }>()
    reviews.forEach(r => {
      const region = r.whisky_id ? regionByWhisky.get(r.whisky_id) : undefined
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
  }, [reviews, regionByWhisky])

  if (!loaded) {
    return (
      <div className="rounded-xl border border-[#E8D9CC] bg-[#FFFCF8] mb-6 sm:mb-8 p-4 animate-pulse">
        <div className="h-4 bg-rose-100 rounded w-1/3 mb-3"></div>
        <div className="h-20 bg-rose-50 rounded"></div>
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden border border-[#E8D9CC] bg-[#FFFCF8] shadow-sm mb-6 sm:mb-8">
      {/* 취향 타이틀 헤더 */}
      <div className="bg-[#2D1520] px-5 py-4">
        <div className="text-[10px] tracking-[0.35em] text-[#C9A961] font-semibold mb-1">TASTE PROFILE</div>
        <div className="text-base sm:text-lg font-bold text-[#F5EBDD] leading-snug">{stats.badge.title}</div>
        <div className="text-xs text-[#B89AA4] mt-0.5">{stats.badge.desc}</div>
      </div>

      {stats.total === 0 ? (
        <div className="text-center text-gray-500 py-8 text-sm">
          시음 노트를 남기면 이곳에 취향 분석이 쌓입니다
        </div>
      ) : (
        <div className="p-5 space-y-6">
          {/* 별점 분포 */}
          <div>
            <div className="flex items-baseline justify-between mb-2.5">
              <h4 className="text-[11px] tracking-[0.2em] font-semibold text-[#7A5C49]">별점 분포</h4>
              <span className="text-xs text-[#722F37] font-medium">평균 {stats.avgRating.toFixed(1)} / 5</span>
            </div>
            <div className="space-y-1.5">
              {[4, 3, 2, 1, 0].map(i => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="text-[11px] text-[#9C8270] w-6 text-right tabular-nums">{i + 1}점</span>
                  <div className="flex-1 h-2 bg-[#F3E9DE] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8B5E34] to-[#B07D45] rounded-full transition-all duration-700"
                      style={{ width: `${(stats.dist[i] / stats.maxDist) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-[#9C8270] w-5 tabular-nums">{stats.dist[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 지역별 선호 */}
          {stats.regions.length > 0 && (
            <div>
              <h4 className="text-[11px] tracking-[0.2em] font-semibold text-[#7A5C49] mb-2.5">지역별 선호</h4>
              <div className="space-y-2">
                {stats.regions.map(r => (
                  <div key={r.region}>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs text-[#4A3527] font-medium truncate" title={r.region}>{r.region}</span>
                      <span className="text-[11px] text-[#9C8270] whitespace-nowrap tabular-nums">{r.count}병 · {r.avgRating.toFixed(1)}점</span>
                    </div>
                    <div className="h-2 bg-[#F3E9DE] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#722F37] to-[#96424E] rounded-full transition-all duration-700"
                        style={{ width: `${(r.count / stats.maxRegion) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 최근 6개월 기록 추이 */}
          <div>
            <h4 className="text-[11px] tracking-[0.2em] font-semibold text-[#7A5C49] mb-2.5">최근 6개월 기록</h4>
            <div className="flex items-end gap-2 h-16 border-b border-[#EADBCD] pb-px">
              {stats.months.map(m => (
                <div key={m.label} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                  <span className="text-[10px] text-[#9C8270] tabular-nums leading-none">{m.count > 0 ? m.count : ''}</span>
                  <div
                    className="w-full max-w-[26px] bg-gradient-to-t from-[#8B5E34] to-[#C9A961] rounded-t-sm transition-all duration-700"
                    style={{ height: `${Math.max((m.count / stats.maxMonth) * 78, m.count > 0 ? 8 : 2)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-1.5">
              {stats.months.map(m => (
                <span key={m.label} className="flex-1 text-center text-[10px] text-[#9C8270]">{m.label}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
