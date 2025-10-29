import { supabase } from '@/lib/supabase'
import HomePageClient from '@/components/HomePageClient'
import type { WhiskyData } from '@/components/HomePageClient'
import { getLikedWhiskyIdsServer } from '@/lib/server/getLikedWhiskyIdsServer'

// 찜 상태 포함한 사용자별 페이지이므로 동적 렌더링 필요
export const dynamic = 'force-dynamic'

async function getWhiskies(): Promise<WhiskyData[]> {
  console.log('📊 서버에서 위스키 데이터 로드 시작...')

  // [수정] 이미지가 있는 위스키를 우선적으로 표시 (Supabase Storage 이미지 우선)
  const { data, error } = await supabase
    .from('whiskies')
    .select('id, name, image, abv, region, price, cask, avg_rating, likes')
    .neq('image', '')
    .not('image', 'is', null)
    .order('image', { ascending: false }) // Supabase Storage URL이 먼저 오도록 (s로 시작)
    .order('name', { ascending: true })
    .limit(20);

  if (error) {
    console.error("❌ 위스키 데이터 로드 실패:", error);
    return [];
  }

  const transformedData = data.map(whisky => ({
    ...whisky,
    avgRating: whisky.avg_rating || 0,
    totalReviews: whisky.likes || 0
  })) as WhiskyData[];

  console.log('✅ 서버에서 위스키 데이터 로드 완료:', transformedData.length, '개')
  return transformedData;
}

export default async function HomePage() {
  console.log('🏠 홈페이지 서버 렌더링 시작...')

  // 위스키 데이터와 사용자 찜 목록을 병렬로 가져오기
  const [initialWhiskies, initialLikedIds] = await Promise.all([
    getWhiskies(),
    getLikedWhiskyIdsServer()
  ])

  console.log('🎯 홈페이지 데이터 준비 완료:', {
    whiskiesCount: initialWhiskies.length,
    likedCount: initialLikedIds.length
  })

  return (
    <HomePageClient
      initialWhiskies={initialWhiskies}
      initialLikedIds={initialLikedIds}
    />
  );
}