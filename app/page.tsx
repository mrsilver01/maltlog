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

export default async function HomePage() {
  // 서버에서 직접 위스키 데이터 로드
  const { data: whiskies, error } = await supabase
    .from('whiskies')
    .select('*')
    .order('name')

  if (error) {
    console.error('위스키 데이터 로드 실패:', error)
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

  console.log(`서버에서 ${whiskies?.length || 0}개의 위스키 데이터 로드 완료`)

  return <HomePageClient initialWhiskies={whiskies || []} />
}