import { supabase } from '../../../lib/supabase'
import AdminImagesClient from '../../../components/AdminImagesClient'

interface WhiskyData {
  id: string
  name: string
  image: string
  distillery?: string
  region: string
  abv: string
  cask: string
  price: string
}

export default async function AdminImagesPage() {
  // 서버에서 위스키 데이터 로드 (이미지가 있는 것들만)
  const { data: whiskies, error } = await supabase
    .from('whiskies')
    .select('*')
    .not('image', 'like', '%no-pic%')
    .not('image', 'like', '%supabase%')
    .limit(20)
    .order('name')

  if (error) {
    console.error('위스키 데이터 로드 실패:', error)
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">데이터 로드 실패</h2>
          <p className="text-gray-600">위스키 데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    )
  }

  console.log(`서버에서 ${whiskies?.length || 0}개의 위스키 데이터 로드 완료`)

  return <AdminImagesClient initialWhiskies={whiskies || []} />
}