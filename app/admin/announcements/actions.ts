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

export async function createAnnouncement(formData: FormData) {
  const { supabase, user } = await assertAdmin()

  const payload = {
    title: formData.get('title') as string,
    body: formData.get('body') as string,
    level: formData.get('level') as 'info' | 'warning' | 'critical',
    display: formData.get('display') as 'banner' | 'modal',
    audience: (formData.get('audience') as string) || 'all',
    dismissible: (formData.get('dismissible') as string) === 'on',
    start_at: formData.get('start_at')
      ? new Date(formData.get('start_at') as string).toISOString()
      : new Date().toISOString(),
    end_at: formData.get('end_at')
      ? new Date(formData.get('end_at') as string).toISOString()
      : null,
    created_by: user.id,
  }

  const { error } = await supabase.from('announcements').insert(payload)
  if (error) throw error

  revalidatePath('/admin/announcements')
}

export async function updateAnnouncement(id: string, formData: FormData) {
  const { supabase } = await assertAdmin()

  const patch: any = {
    title: formData.get('title'),
    body: formData.get('body'),
    level: formData.get('level'),
    display: formData.get('display'),
    audience: (formData.get('audience') as string) || 'all',
    dismissible: (formData.get('dismissible') as string) === 'on',
    start_at: formData.get('start_at')
      ? new Date(formData.get('start_at') as string).toISOString()
      : null,
    end_at: formData.get('end_at')
      ? new Date(formData.get('end_at') as string).toISOString()
      : null,
  }

  const { error } = await supabase.from('announcements').update(patch).eq('id', id)
  if (error) throw error

  revalidatePath('/admin/announcements')
}

export async function deleteAnnouncement(id: string) {
  const { supabase } = await assertAdmin()

  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) throw error

  revalidatePath('/admin/announcements')
}