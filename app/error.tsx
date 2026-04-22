'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-4">🥃</div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-3">
          잠시 문제가 생겼어요
        </h1>
        <p className="text-neutral-600 mb-8 leading-relaxed">
          페이지를 불러오는 중 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해 주세요.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-amber-800 text-white rounded-md text-sm font-medium hover:bg-amber-900 transition-colors"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            홈으로
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs text-gray-400 mt-6">
            오류 코드: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
