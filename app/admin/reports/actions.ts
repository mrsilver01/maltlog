'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

async function assertAdmin() {
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

  // DB 기반 관리자 권한 확인 (최종 판정)
  const { data: ok } = await supabase.rpc('is_admin')
  if (!ok) throw new Error('FORBIDDEN')

  // 기존 체크는 보조로 유지
  const { data: { user } } = await supabase.auth.getUser()
  const role = (user as any)?.raw_app_meta_data?.role || (user as any)?.role

  if (!user || role !== 'admin') {
    throw new Error('FORBIDDEN')
  }

  return { supabase, user }
}

export async function updateReportStatus(
  id: string,
  status: 'triage' | 'resolved' | 'rejected',
  note?: string
) {
  const { supabase, user } = await assertAdmin()

  const { error } = await supabase
    .from('reports')
    .update({
      status,
      handled_by: user.id,
      handled_at: new Date().toISOString(),
      handled_note: note ?? null,
    })
    .eq('id', id)

  if (error) throw error

  revalidatePath('/admin/reports')
}