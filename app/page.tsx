import { supabase } from '@/lib/supabase'
import HomePageClient from '@/components/HomePageClient'
import type { WhiskyData } from '@/components/HomePageClient'

async function getWhiskies(): Promise<WhiskyData[]> {
  // [수정] 성능을 위해 초기 로드 시 20개로 제한, 필요한 컬럼만 선택
  const { data, error } = await supabase
    .from('whiskies')
    .select('id, name, image, abv, region, price, cask, avg_rating, likes')
    .order('name', { ascending: true })
    .limit(20);

  if (error) {
    console.error("Failed to fetch whiskies on server:", error);
    return [];
  }

  return data as WhiskyData[];
}

export default async function HomePage() {
  const initialWhiskies = await getWhiskies();

  return <HomePageClient initialWhiskies={initialWhiskies} />;
}