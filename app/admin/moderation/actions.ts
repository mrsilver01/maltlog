'use server'

import { revalidatePath } from 'next/cache'
import { assertAdmin } from '@/lib/server/adminGuard'

export async function hardDelete(table: 'posts' | 'comments' | 'reviews', id: string) {
  const { supabase } = await assertAdmin()

  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error

  revalidatePath('/admin/moderation')
}

export async function softHide(table: 'posts' | 'comments' | 'reviews', id: string) {
  const { supabase } = await assertAdmin()

  const { error } = await supabase.from(table).update({ is_deleted: true }).eq('id', id)
  if (error) throw error

  revalidatePath('/admin/moderation')
}