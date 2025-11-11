import { supabase } from '@/lib/supabase'
import HomePageClient from '@/components/HomePageClient'
import type { WhiskyData } from '@/components/HomePageClient'
import { getLikedWhiskyIdsServer } from '@/lib/server/getLikedWhiskyIdsServer'

// 찜 상태 포함한 사용자별 페이지이므로 동적 렌더링 필요
export const dynamic = 'force-dynamic'

async function getWhiskies(): Promise<WhiskyData[]> {
  console.log('📊 서버에서 위스키 데이터 로드 시작...')

  // [Hotfix] whiskies_with_stats 뷰 사용으로 홈 목록 비표시 해결 + 추천 컬럼 포함
  const { data, error } = await supabase
    .from('whiskies_with_stats')
    .select('id, name, name_ko, image, distillery, region, abv, cask, price, is_featured, display_order, avg_rating, reviews_count, likes_count')
    .not('image', 'is', null)
    .order('display_order', { ascending: true })
    .limit(20);

  if (error) {
    console.error("❌ 위스키 데이터 로드 실패:", error);
    return [];
  }

  const transformedData = data.map(whisky => ({
    ...whisky,
    avgRating: whisky.avg_rating || 0,
    totalReviews: whisky.reviews_count || 0,
    likes: whisky.likes_count || 0
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