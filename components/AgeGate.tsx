'use client'

import { useEffect, useState } from 'react'

export default function AgeGate() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // 쿠키에서 연령 확인 여부 체크
    const hasAgeConfirmed = typeof window !== 'undefined' &&
      document.cookie.includes('age_confirmed=true')

    if (!hasAgeConfirmed) {
      setOpen(true)
    }
  }, [])

  const handleConfirmAge = () => {
    // 1년간 유지되는 쿠키 설정
    const oneYear = 60 * 60 * 24 * 365
    document.cookie = `age_confirmed=true; Max-Age=${oneYear}; Path=/; SameSite=Lax`
    setOpen(false)
  }

  const handleDenyAge = () => {
    alert('죄송합니다. 만 19세 미만은 본 사이트를 이용할 수 없습니다.')
    // 외부 사이트로 리다이렉트 (청소년보호 관련 사이트)
    window.location.href = 'https://www.youth.go.kr/'
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-[1000] bg-black/70 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl border border-gray-200">
        {/* 로고 */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-12 flex items-center justify-center">
              <img
                src="/LOGO.png"
                alt="Maltlog Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-amber-800 font-[family-name:var(--font-jolly-lodger)]">
              Maltlog
            </h1>
          </div>
        </div>

        {/* 제목 */}
        <h2
          id="age-gate-title"
          className="text-xl font-bold text-center mb-4 text-gray-800"
        >
          만 19세 이상입니까?
        </h2>

        {/* 법령 근거 및 안내 */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            <strong>청소년보호법 제28조</strong>에 따라 청소년유해약물등(주류 포함)의
            판매·대여·배포는 금지됩니다.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mb-2">
            몰트로그는 주류 정보를 다루므로 <strong>만 19세 이상</strong>만 이용할 수 있습니다.
          </p>
          <p className="text-xs text-gray-500">
            ※ 과도한 음주는 건강에 해롭습니다.
          </p>
        </div>

        {/* 버튼들 */}
        <div className="flex gap-3">
          <button
            onClick={handleDenyAge}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            19세 미만
          </button>
          <button
            onClick={handleConfirmAge}
            className="flex-1 px-4 py-3 rounded-lg bg-amber-800 text-white hover:bg-amber-900 transition-colors font-medium"
          >
            19세 이상
          </button>
        </div>

        {/* 법령 출처 */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            법령 근거: 청소년보호법 제28조 (청소년유해약물등의 판매·대여 등의 금지)
          </p>
        </div>
      </div>
    </div>
  )
}