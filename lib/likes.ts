// lib/likes.ts
import { supabase } from '@/lib/supabase'

export async function isWhiskyLiked(userId: string, whiskyId: string) {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('whisky_id', whiskyId)
    .is('post_id', null)        // 안전: 위스키 찜만
    .limit(1)
  if (error) throw error
  return (data?.length ?? 0) > 0
}

export async function likeWhisky(userId: string, whiskyId: string) {
  // post_id는 사용하지 않음 → 항상 null
  const { error } = await supabase
    .from('likes')
    .insert([{ user_id: userId, whisky_id: whiskyId, post_id: null }])
  // 유니크 충돌(이미 찜된 경우)은 무시 가능
  if (error && error.code !== '23505') throw error
}

export async function unlikeWhisky(userId: string, whiskyId: string) {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', userId)
    .eq('whisky_id', whiskyId)
    .is('post_id', null)
  if (error) throw error
}