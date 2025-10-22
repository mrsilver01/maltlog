import { supabase } from '@/lib/supabase'
import HomePageClient from '@/components/HomePageClient'
import type { WhiskyData } from '@/components/HomePageClient'

async function getWhiskies(): Promise<WhiskyData[]> {
  // [수정] 이미지 URL이 있는 위스키만 표시 (nopic 제외)
  const { data, error } = await supabase
    .from('whiskies')
    .select('id, name, image, abv, region, price, cask, avg_rating, likes')
    .not('image', 'like', '%nopic%')
    .not('image', 'like', '%no.pic%')
    .neq('image', '')
    .not('image', 'is', null)
    .order('name', { ascending: true })
    .limit(20);

  if (error) {
    console.error("Failed to fetch whiskies on server:", error);
    return [];
  }

  return data.map(whisky => ({
    ...whisky,
    avgRating: whisky.avg_rating || 0,
    totalReviews: whisky.likes || 0
  })) as WhiskyData[];
}

export default async function HomePage() {
  const initialWhiskies = await getWhiskies();

  return <HomePageClient initialWhiskies={initialWhiskies} />;
}