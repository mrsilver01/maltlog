'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'      // 경로 수정 (AuthContext 사용)
import { supabase } from '@/lib/supabase'         // 경로 수정

// 필요한 컴포넌트들
import LoadingAnimation from '@/components/LoadingAnimation'
import RatingSystem, { RatingSystemProps } from '@/components/RatingSystem' // RatingSystem과 그 타입을 import

// 데이터 타입을 명확하게 정의합니다.
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
  notes: string | null;
  created_at: string;
  profiles: {
    nickname: string;
    avatar_url: string | null;
  }
}

export default function WhiskyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const whiskyId = params.id as string

  const { user, loading: authLoading } = useAuth()

  const [whisky, setWhisky] = useState<Whisky | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [myReview, setMyReview] = useState<Review | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  const [currentRating, setCurrentRating] = useState(0)
  const [currentNote, setCurrentNote] = useState('')

  const fetchData = useCallback(async () => {
    if (!whiskyId) return
    setLoadingData(true)

    const { data: whiskyData, error: whiskyError } = await supabase
      .from('whiskies')
      .select('*')
      .eq('id', whiskyId)
      .single()

    if (whiskyError || !whiskyData) {
      console.error('위스키 정보 로드 실패:', whiskyError)
      router.push('/')
      return
    }
    setWhisky(whiskyData as Whisky)

    const { data: reviewsData, error: reviewsError } = await supabase
      .from('whisky_reviews')
      .select(`*, profiles (nickname, avatar_url)`)
      .eq('whisky_id', whiskyId)

    if (reviewsError) {
      console.error('리뷰 정보 로드 실패:', reviewsError)
    } else {
      const allReviews = (reviewsData as Review[]) || []
      setReviews(allReviews)
      
      if (user) {
        const myReviewData = allReviews.find((r: Review) => r.user_id === user.id)
        if (myReviewData) {
          setMyReview(myReviewData)
          setCurrentRating(myReviewData.rating)
          setCurrentNote(myReviewData.notes || '')
        } else {
          setMyReview(null)
          setCurrentRating(0)
          setCurrentNote('')
        }
      }
    }

    setLoadingData(false)
  }, [whiskyId, router, user])

  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  const handleReviewSubmit = async () => {
    if (!user) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }
    if (!whisky) return
    if (currentRating === 0) {
      alert('별점을 먼저 선택해주세요.')
      return
    }

    const { error } = await supabase.from('whisky_reviews').upsert({
      id: myReview?.id,
      whisky_id: whisky.id,
      user_id: user.id,
      rating: currentRating,
      notes: currentNote,
    })

    if (error) {
      alert('리뷰 저장에 실패했습니다: ' + error.message)
    } else {
      alert('리뷰가 저장되었습니다!')
      fetchData()
    }
  }

  if (authLoading || loadingData) {
    return <LoadingAnimation message="위스키 노트를 준비 중입니다..." />
  }

  if (!whisky) {
    return <div className="text-center p-8">위스키 정보를 찾을 수 없습니다.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="mb-4 text-sm text-gray-600 hover:text-black">← 뒤로 가기</button>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <img src={whisky.image} alt={whisky.name} className="w-full rounded-lg shadow-lg" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-amber-800">{whisky.name}</h1>
          <p className="text-lg text-gray-600 mb-4">{whisky.distillery}</p>
          {/* ...기타 정보 표시... */}
        </div>
      </div>
      
      <div className="my-12 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {myReview ? '내 리뷰 수정하기' : '이 위스키에 대한 내 리뷰 남기기'}
        </h2>
        {user ? (
          <div>
            <div className="flex justify-center mb-4">
              <RatingSystem
                currentRating={currentRating}
                onRatingChange={setCurrentRating}
                size="lg"
              />
            </div>
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="위스키에 대한 감상을 자유롭게 남겨보세요..."
              className="w-full h-32 p-3 border rounded-md text-black"
            />
            <button
              onClick={handleReviewSubmit}
              className="mt-4 w-full bg-amber-700 text-white py-2 rounded-md hover:bg-amber-800"
            >
              {myReview ? '수정하기' : '리뷰 저장하기'}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-3">리뷰를 남기려면 로그인이 필요해요!</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-amber-700 text-white px-6 py-2 rounded-md hover:bg-amber-800"
            >
              로그인하러 가기
            </button>
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">다른 사람들의 리뷰</h2>
        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="p-4 bg-white rounded-lg shadow">
                <div className="flex items-center mb-2">
                  <img 
                    src={review.profiles.avatar_url || '/whiskies/LOGO.png'} // 프로필 사진 없으면 기본 로고
                    alt={review.profiles.nickname}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                  <div>
                    <p className="font-semibold">{review.profiles.nickname}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center my-2">
                  <RatingSystem 
                    currentRating={review.rating} 
                    readOnly={true} 
                    size="sm" 
                  />
                </div>
                {review.notes && <p className="text-gray-700">{review.notes}</p>}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">아직 작성된 리뷰가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}

