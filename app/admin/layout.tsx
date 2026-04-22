import Link from 'next/link'
import { requireAdmin } from '@/lib/server/adminGuard'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // DB의 is_admin() RPC로 관리자 권한 확인 (미인증/비관리자는 / 로 redirect)
  await requireAdmin('/')

  return (
    <div className="mx-auto max-w-6xl p-4">
      <nav className="mb-6 flex gap-4 text-sm border-b pb-4">
        <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-medium">
          대시보드
        </Link>
        <Link href="/admin/announcements" className="text-blue-600 hover:text-blue-800 font-medium">
          공지
        </Link>
        <Link href="/admin/reports" className="text-blue-600 hover:text-blue-800 font-medium">
          신고
        </Link>
        <Link href="/admin/moderation" className="text-blue-600 hover:text-blue-800 font-medium">
          모더레이션
        </Link>
      </nav>
      {children}
    </div>
  )
}