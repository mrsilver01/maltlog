import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-3">
          페이지를 찾을 수 없어요
        </h1>
        <p className="text-neutral-600 mb-8 leading-relaxed">
          주소가 잘못되었거나 삭제된 페이지일 수 있습니다.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-amber-800 text-white rounded-md text-sm font-medium hover:bg-amber-900 transition-colors"
          >
            홈으로
          </Link>
          <Link
            href="/community"
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            커뮤니티
          </Link>
        </div>
      </div>
    </div>
  )
}
