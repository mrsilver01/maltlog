'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import ProfilePageClient from '@/components/ProfilePageClient'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 로딩 중이면 아무것도 하지 않음
    if (loading) return

    // 유저가 없을 때 로그인 페이지로 안전하게 리다이렉트
    if (!user) {
      console.log('❌ 비로그인 상태 감지 → 로그인 페이지로 이동')
      router.replace(`/login?next=${encodeURIComponent(pathname)}`) // 돌아올 위치 보존
      return
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        로그인 상태 확인 중...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        로그인 페이지로 이동 중...
      </div>
    )
  }

  // 빈 초기 데이터로 ProfilePageClient를 렌더링
  const initialReviews: any[] = []
  const initialWhiskies: any[] = []
  const initialStats = {
    reviewCount: 0,
    noteCount: 0,
    wishlistCount: 0
  }

  return (
    <ProfilePageClient
      initialReviews={initialReviews}
      initialWhiskies={initialWhiskies}
      initialStats={initialStats}
    />
  )
}