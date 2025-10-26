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

  const { data: { user } } = await supabase.auth.getUser()
  const role = (user as any)?.raw_app_meta_data?.role || (user as any)?.role

  if (!user || role !== 'admin') {
    throw new Error('FORBIDDEN')
  }

  return supabase
}

export async function hardDelete(table: 'posts' | 'comments' | 'reviews', id: string) {
  const supabase = await assertAdmin()

  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error

  revalidatePath('/admin/moderation')
}

export async function softHide(table: 'posts' | 'comments' | 'reviews', id: string) {
  const supabase = await assertAdmin()

  const { error } = await supabase.from(table).update({ is_deleted: true }).eq('id', id)
  if (error) throw error

  revalidatePath('/admin/moderation')
}