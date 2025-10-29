// 찜 상태 포함한 사용자별 페이지이므로 동적 렌더링 필요
export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import WhiskyDetailClient from '../../../components/WhiskyDetailClient'


interface Whisky {
  id: string;
  name: string;
  image: string;
  distillery: string;
  region: string;
  abv: string;
  cask: string;
  price: string;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  note: string | null;
  created_at: string;
  profiles: {
    nickname: string;
    avatar_url: string | null;
  } | null;
}

interface WhiskyDetailPageProps {
  params: {
    id: string
  }
}

export default async function WhiskyDetailPage({ params }: WhiskyDetailPageProps) {
  const { id: whiskyId } = await params

  // 서버에서 위스키 정보 로드
  const { data: whisky, error: whiskyError } = await supabase
    .from('whiskies')
    .select('*')
    .eq('id', whiskyId)
    .single()

  if (whiskyError || !whisky) {
    console.error('위스키 정보 로드 실패:', whiskyError)
    redirect('/')
  }

  // 서버에서 리뷰 데이터 로드
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select(`*, profiles (nickname, avatar_url)`)
    .eq('whisky_id', whiskyId)
    .order('created_at', { ascending: false })

  if (reviewsError) {
    console.error('리뷰 정보 로드 실패:', reviewsError)
  }

  console.log(`서버에서 위스키 "${whisky.name}" 데이터 로드 완료: 리뷰 ${reviews?.length || 0}개`)

  return (
    <WhiskyDetailClient
      whisky={whisky as Whisky}
      initialReviews={(reviews as Review[]) || []}
    />
  )
}

