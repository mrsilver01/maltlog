import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const role = (user as any)?.raw_app_meta_data?.role || (user as any)?.role

  if (!user || role !== 'admin') {
    redirect('/')
  }

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