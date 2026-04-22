'use server'

import { revalidatePath } from 'next/cache'
import { assertAdmin } from '@/lib/server/adminGuard'

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