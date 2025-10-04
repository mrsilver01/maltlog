'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { migrateTempLikesToUser } from '../../../lib/whiskyData'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL에서 인증 토큰을 처리합니다
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          alert('로그인 중 오류가 발생했습니다.')
          router.push('/login')
          return
        }

        if (data.session && data.session.user) {
          const user = data.session.user

          // 카카오 사용자 정보에서 닉네임 설정
          const nickname = user.user_metadata?.nickname ||
                          user.user_metadata?.full_name ||
                          user.user_metadata?.name ||
                          user.email?.split('@')[0] ||
                          '카카오사용자'

          // Supabase 세션이 자동으로 관리되므로 localStorage는 필요 시에만 사용
          localStorage.setItem('userNickname', nickname)

          // 프로필 이미지가 있다면 저장
          if (user.user_metadata?.avatar_url) {
            localStorage.setItem('userProfileImage', user.user_metadata.avatar_url)
          }

          // 로그인 전 임시 찜을 사용자 찜으로 이동
          if (user.id) {
            migrateTempLikesToUser(user.id)
          }

          alert('카카오 로그인 성공!')
          router.push('/')
        } else {
          console.error('No session found')
          router.push('/login')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        alert('로그인 중 오류가 발생했습니다.')
        router.push('/login')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  )
}