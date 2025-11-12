import { supabase } from '@/lib/supabase'
import HomePageClient from '@/components/HomePageClient'
import type { WhiskyData } from '@/components/HomePageClient'
import { getLikedWhiskyIdsServer } from '@/lib/server/getLikedWhiskyIdsServer'
import { toPublicImageUrl } from '@/lib/supabase/publicUrl'

// 찜 상태 포함한 사용자별 페이지이므로 동적 렌더링 필요
export const dynamic = 'force-dynamic'

async function getWhiskies(): Promise<WhiskyData[]> {
  console.log('📊 서버에서 위스키 데이터 로드 시작...')

  // [Hotfix] whiskies_with_stats 뷰 사용으로 홈 목록 비표시 해결 + 추천 컬럼 포함
  const { data, error } = await supabase
    .from('whiskies_with_stats')
    .select('id, name, name_ko, image, distillery, region, abv, cask, price, is_featured, display_order, avg_rating, reviews_count, likes_count')
    .order('avg_rating', { ascending: false })
    .order('reviews_count', { ascending: false })
    .limit(100);

  if (error) {
    console.error("❌ 위스키 데이터 로드 실패:", error);
    return [];
  }

  const all = (data ?? []).map((w: any) => ({
    id: w.id,
    name: w.name,
    name_ko: w.name_ko,
    image: toPublicImageUrl(w.image),           // ✅ 절대 URL로 변환
    distillery: w.distillery,
    region: w.region,
    abv: w.abv,
    cask: w.cask,
    price: w.price,
    is_featured: w.is_featured,
    display_order: w.display_order,
    avgRating: Number(w.avg_rating ?? 0),
    totalReviews: w.reviews_count ?? 0,
    likes: w.likes_count ?? 0,
  })) as WhiskyData[];

  // 추천 섹션 fallback 로직
  const featured = all
    .filter(w => w.is_featured)
    .sort((a,b) => (a.display_order ?? 999) - (b.display_order ?? 999));

  const NEED = 8; // 추천 섹션 카드 수
  let recommend = featured.slice(0, NEED);

  if (recommend.length < NEED) {
    const extra = all
      .filter(w => !w.is_featured)
      .sort((a,b) => (Number(b.avgRating ?? 0) - Number(a.avgRating ?? 0)))
      .slice(0, NEED - recommend.length);
    recommend = [...recommend, ...extra];
  }

  // 추천을 맨 앞에 배치하고 나머지는 평점순으로 정렬
  const remaining = all.filter(w => !recommend.some(r => r.id === w.id));
  const transformedData = [...recommend, ...remaining];

  console.log('✅ 서버에서 위스키 데이터 로드 완료:', transformedData.length, '개, 추천:', recommend.length, '개')
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