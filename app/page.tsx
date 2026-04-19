import HomePageClient from '@/components/HomePageClient'
import { getInitialWhiskies } from '@/lib/server/getInitialWhiskies'
import { getLikedWhiskyIdsServer } from '@/lib/server/getLikedWhiskyIdsServer'

// ISR (Incremental Static Regeneration): 10분 캐시
// 위스키 목록은 공개 데이터이므로 ISR로 캐시하여 서버 부하/TTFB를 줄입니다.
// 사용자별 찜 상태는 클라이언트 쪽에서 하이드레이션하므로 페이지 캐시와 충돌하지 않습니다.
export const revalidate = 600

export default async function HomePage() {
  // 위스키 데이터(공개) + 사용자 찜 목록(비공개)을 병렬 로드
  // - getInitialWhiskies: ISR 캐시 대상
  // - getLikedWhiskyIdsServer: 쿠키 기반, 사용자별로 다르므로 동적 렌더링
  const [initialWhiskyData, initialLikedIds] = await Promise.all([
    getInitialWhiskies(100),
    getLikedWhiskyIdsServer(),
  ])

  return (
    <HomePageClient
      initial={initialWhiskyData}
      initialLikedIds={initialLikedIds}
    />
  )
}
