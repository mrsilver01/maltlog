'use server'

import { revalidatePath } from 'next/cache'
import { assertAdmin } from '@/lib/server/adminGuard'

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