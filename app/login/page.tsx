'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authHelpers } from '../../lib/supabase'
import { migrateTempLikesToUser } from '../../lib/whiskyData'
import { migrateLocalStorageToSupabase } from '../../lib/autoMigration'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        // 로그인
        const { data, error } = await authHelpers.signIn(formData.email, formData.password)
        if (error) {
          console.error('Login error:', error)
          throw new Error(error.message || '로그인에 실패했습니다.')
        }

        if (data.user) {
          // 사용자 정보에서 닉네임 설정
          const nickname = data.user.user_metadata?.nickname || formData.email.split('@')[0]
          localStorage.setItem('userNickname', nickname)

          // 프로필 이미지가 있다면 저장
          if (data.user.user_metadata?.avatar_url) {
            localStorage.setItem('userProfileImage', data.user.user_metadata.avatar_url)
          }

          // 로그인 전 임시 찜을 사용자 찜으로 이동
          migrateTempLikesToUser(data.user.id)

          // 🔄 자동 데이터 마이그레이션 실행
          await migrateLocalStorageToSupabase(data.user.id)

          alert('로그인 성공!')
          router.push('/')
        }
      } else {
        // 회원가입
        if (formData.password !== formData.confirmPassword) {
          alert('비밀번호가 일치하지 않습니다.')
          return
        }

        const { data, error } = await authHelpers.signUp(formData.email, formData.password, formData.nickname)
        if (error) {
          console.error('Signup error:', error)
          throw new Error(error.message || '회원가입에 실패했습니다.')
        }

        alert('회원가입이 완료되었습니다. 이메일을 확인해주세요.')
        setIsLogin(true)
        setFormData({ email: '', password: '', confirmPassword: '', nickname: '' })
      }
    } catch (error: unknown) {
      alert('오류: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleKakaoLogin = async () => {
    setLoading(true)
    try {
      const { data, error } = await authHelpers.signInWithKakao()
      if (error) {
        console.error('Kakao login error:', error)
        throw new Error(error.message || 'Kakao 로그인에 실패했습니다.')
      }
      // OAuth 리다이렉트 처리는 callback 페이지에서 진행
    } catch (error: unknown) {
      alert('오류: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center px-6 relative">
      {/* 뒤로가기 버튼 */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => router.push('/')}
          className="bg-rose-100 border border-rose-200 rounded-lg px-3 py-2 hover:bg-rose-150 transition-all duration-200 shadow-sm text-gray-700 hover:text-gray-800 text-sm font-medium hover:scale-105 transform hover:shadow-md hover:border-rose-300"
        >
          ← 메인으로
        </button>
      </div>

      <div className="max-w-md w-full">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-16 flex items-center justify-center">
              <img
                src="/whiskies/LOGO.png"
                alt="Maltlog Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-amber-800 font-[family-name:var(--font-jolly-lodger)]">Maltlog</h1>
          </div>
          <p className="text-gray-600">위스키의 모든 기록</p>
        </div>

        {/* 로그인/회원가입 폼 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-center border-b-2 ${
                isLogin 
                  ? 'border-red-500 text-red-500 font-bold' 
                  : 'border-gray-200 text-gray-500'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-center border-b-2 ${
                !isLogin 
                  ? 'border-red-500 text-red-500 font-bold' 
                  : 'border-gray-200 text-gray-500'
              }`}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                placeholder="example@email.com"
                required
                disabled={loading}
              />
            </div>

            {/* 닉네임 (회원가입 시에만) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  닉네임
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                  placeholder="닉네임을 입력하세요"
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
            )}

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                placeholder="비밀번호를 입력하세요"
                required
                disabled={loading}
              />
            </div>

            {/* 비밀번호 확인 (회원가입 시에만) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                  placeholder="비밀번호를 다시 입력하세요"
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
            </button>
          </form>

          {/* 구분선 */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-3 text-gray-500 text-sm">또는</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* 카카오 로그인 버튼 */}
          <button
            onClick={handleKakaoLogin}
            disabled={loading}
            className="w-full bg-yellow-400 text-black py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C7.1 3 3 6.4 3 10.6c0 2.7 1.8 5.1 4.5 6.5L6.5 21l4.3-2.3c.4 0 .8.1 1.2.1 4.9 0 9-3.4 9-7.6C21 6.4 16.9 3 12 3z"/>
            </svg>
            {loading ? '처리 중...' : '카카오톡으로 로그인'}
          </button>

          {/* 홈으로 돌아가기 */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}