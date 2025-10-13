'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import toast from 'react-hot-toast'
// Migration functions removed as we now use Supabase only

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL에서 인증 토큰을 처리합니다
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          toast.error('로그인 중 오류가 발생했습니다.')
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

          // 카카오 로그인 성공 - Supabase가 모든 데이터를 처리합니다
          console.log('카카오 로그인 성공:', nickname)

          toast.success('카카오 로그인 성공!')
          router.push('/')
        } else {
          console.error('No session found')
          router.push('/login')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        toast.error('로그인 중 오류가 발생했습니다.')
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