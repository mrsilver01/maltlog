'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browser'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('이메일을 입력해 주세요')
      return
    }

    setLoading(true)
    try {
      const supabase = supabaseBrowser()
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/update-password`
          : undefined

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (error) {
        console.error('resetPasswordForEmail error', error)
        toast.error(error.message || '비밀번호 재설정 메일 전송에 실패했어요')
        return
      }

      toast.success('비밀번호 재설정 메일을 보냈어요. 이메일을 확인해 주세요.')
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center px-6 relative">
      {/* 뒤로가기 버튼 */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => router.push('/login')}
          className="bg-rose-100 border border-rose-200 rounded-lg px-3 py-2 hover:bg-rose-150 transition-all duration-200 shadow-sm text-gray-700 hover:text-gray-800 text-sm font-medium hover:scale-105 transform hover:shadow-md hover:border-rose-300"
        >
          ← 로그인으로
        </button>
      </div>

      <div className="max-w-md w-full">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-16 flex items-center justify-center">
              <img
                src="/LOGO.png"
                alt="Maltlog Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-amber-800 font-[family-name:var(--font-jolly-lodger)]">Maltlog</h1>
          </div>
          <p className="text-gray-600">비밀번호 재설정</p>
        </div>

        {/* 비밀번호 재설정 폼 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h1 className="text-lg font-semibold mb-4">비밀번호 재설정</h1>
            <p className="text-sm text-gray-500 mb-6">
              가입할 때 사용하신 이메일 주소를 입력하시면,
              비밀번호를 다시 설정할 수 있는 링크를 보내드려요.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                placeholder="example@maltlog.kr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? '전송 중…' : '재설정 메일 보내기'}
            </button>
          </form>

          {/* 로그인으로 돌아가기 */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              로그인 화면으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}