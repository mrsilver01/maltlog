'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authHelpers } from '../../lib/supabase'
import { migrateTempLikesToUser } from '../../lib/whiskyData'

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

        // 로그인 상태를 localStorage에 저장
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userEmail', formData.email)

        // 사용자 정보 가져와서 닉네임 저장
        const user = await authHelpers.getCurrentUser()
        if (user && user.user_metadata && user.user_metadata.nickname) {
          localStorage.setItem('userNickname', user.user_metadata.nickname)
        } else {
          // 닉네임이 없는 경우 이메일로 대체
          localStorage.setItem('userNickname', formData.email.split('@')[0])
        }

        // 로그인 전 임시 찜을 사용자 찜으로 이동
        if (user?.id) {
          migrateTempLikesToUser(user.id)
        }

        alert('로그인 성공!')
        router.push('/')
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
        
        alert('회원가입이 완료되었습니다. 로그인해주세요.')
        setIsLogin(true)
        setFormData({ email: '', password: '', confirmPassword: '', nickname: '' })
      }
    } catch (error: unknown) {
      alert('오류: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
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