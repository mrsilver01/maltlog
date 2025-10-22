'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import toast from 'react-hot-toast' // 1. 중앙 관리 시스템을 import 합니다.

export default function Header() {
  const router = useRouter()
  const { user, signOut } = useAuth() // 2. Context에서 사용자 정보와 로그아웃 함수를 가져옵니다.

  const handleSignOut = async () => {
    try {
      // 3. Context의 signOut 함수를 호출합니다.
      await signOut()
      toast.success('로그아웃되었습니다.')
      router.push('/') // 홈페이지로 이동
    } catch (error: any) {
      toast.error('로그아웃 중 오류가 발생했습니다: ' + error.message)
    }
  }

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-40">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/LOGO.png"
            alt="Maltlog Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="text-2xl font-bold text-amber-800 font-[family-name:var(--font-jolly-lodger)]">
            Maltlog
          </span>
        </Link>

        {/* 네비게이션 및 로그인 상태 */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-amber-700">HOME</Link>
          
          {/* 4. user 객체의 존재 여부로 로그인 상태를 판단합니다. */}
          {user ? (
            <>
              <Link href="/profile" className="text-gray-600 hover:text-amber-700">PROFILE</Link>
              <button
                onClick={handleSignOut}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="bg-amber-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-900"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

