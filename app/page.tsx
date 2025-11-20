import HomePageClient from '@/components/HomePageClient'
import { getLikedWhiskyIdsServer } from '@/lib/server/getLikedWhiskyIdsServer'
import type { WhiskyListResponse } from '@/types/whisky'

// 찜 상태 포함한 사용자별 페이지이므로 동적 렌더링 필요
export const dynamic = 'force-dynamic'

/**
 * 새로운 /api/whiskies를 사용한 초기 데이터 로딩
 * 커서 기반 페이지네이션 API로 통일된 데이터 소스 사용
 */
async function getInitialWhiskies(): Promise<WhiskyListResponse> {
  console.log('📊 서버에서 위스키 초기 데이터 로드 시작...')

  try {
    // 운영환경에서는 절대 URL, 개발환경에서는 상대 URL 사용
    let apiUrl: string
    if (process.env.NODE_ENV === 'production') {
      apiUrl = 'https://maltlog.kr/api/whiskies?limit=100'
    } else {
      apiUrl = 'http://localhost:3000/api/whiskies?limit=100'
    }

    console.log('🌐 API 호출:', apiUrl)

    const response = await fetch(apiUrl, {
      cache: 'no-store',  // 항상 최신 데이터 가져오기
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('❌ API 응답 실패:', response.status, response.statusText)
      throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`)
    }

    const data: WhiskyListResponse = await response.json()

    console.log('✅ 서버에서 위스키 초기 데이터 로드 완료:', {
      itemsCount: data.items.length,
      nextCursor: data.nextCursor,
      hasMorePages: data.nextCursor !== null
    })

    return data

  } catch (error) {
    console.error('❌ 위스키 초기 데이터 로드 실패:', error)

    // fallback으로 빈 응답 반환
    return {
      items: [],
      nextCursor: null
    }
  }
}

export default async function HomePage() {
  console.log('🏠 홈페이지 서버 렌더링 시작...')

  // 위스키 데이터와 사용자 찜 목록을 병렬로 가져오기
  const [initialWhiskyData, initialLikedIds] = await Promise.all([
    getInitialWhiskies(),
    getLikedWhiskyIdsServer()
  ])

  console.log('🎯 홈페이지 데이터 준비 완료:', {
    whiskiesCount: initialWhiskyData.items.length,
    likedCount: initialLikedIds.length,
    nextCursor: initialWhiskyData.nextCursor
  })

  return (
    <HomePageClient
      initial={initialWhiskyData}
      initialLikedIds={initialLikedIds}
    />
  );
}