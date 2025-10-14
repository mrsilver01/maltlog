import { supabase } from '../lib/supabase'
import HomePageClient from '../components/HomePageClient'

interface WhiskyData {
  id: string
  name: string
  image: string
  abv: string
  region: string
  price: string
  cask: string
  avgRating: number
  totalReviews: number
  likes: number
  distillery?: string
  created_at?: string
  updated_at?: string
}

// app/page.tsx 파일의 getWhiskies 함수
async function getWhiskies(): Promise<WhiskyData[]> {
  const { data, error } = await supabase
    .from('whiskies')
    .select('*')
    .eq('is_featured', true) // 추천 위스키만 선택
    .limit(12) // 최대 12개로 제한
    .order('name', { ascending: true });

  if (error) {
    console.error("Failed to fetch featured whiskies on server:", error);
    return [];
  }

  return data as WhiskyData[];
}

export default async function HomePage() {
  // 서버에서 추천 위스키 데이터만 로드
  const whiskies = await getWhiskies();

  if (whiskies.length === 0) {
    console.error('위스키 데이터 로드 실패')
    return (
      <div className="min-h-screen bg-rose-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">데이터 로드 실패</h2>
          <p className="text-gray-600">위스키 데이터를 불러올 수 없습니다.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600"
          >
            새로고침
          </button>
        </div>
      </div>
    )
  }

  console.log(`서버에서 ${whiskies.length}개의 추천 위스키 데이터 로드 완료`)

  return <HomePageClient initialWhiskies={whiskies} />
}