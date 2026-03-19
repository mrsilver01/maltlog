import { supabaseBrowser } from '@/lib/supabase/browser'

type WhiskyLikeInsert = {
  user_id: string
  whisky_id: string
  post_id: null
}

type WhiskyLikeRow = {
  whisky_id: string
}

export async function isWhiskyLiked(userId: string, whiskyId: string) {
  const { data, error } = await supabaseBrowser()
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('whisky_id', whiskyId)
    .is('post_id', null)
    .limit(1)

  if (error) throw error
  return (data?.length ?? 0) > 0
}

export async function likeWhisky(userId: string, whiskyId: string) {
  const payload: WhiskyLikeInsert = {
    user_id: userId,
    whisky_id: whiskyId,
    post_id: null,
  }

  const { error } = await supabaseBrowser().from('likes').insert([payload])

  if (error && error.code === '23505') {
    console.log('이미 찜한 위스키입니다.')
    return
  }

  if (error) throw error
}

export async function unlikeWhisky(userId: string, whiskyId: string) {
  const { error } = await supabaseBrowser()
    .from('likes')
    .delete()
    .eq('user_id', userId)
    .eq('whisky_id', whiskyId)
    .is('post_id', null)

  if (error) throw error
}

export async function getUserWhiskyLikes(userId: string): Promise<string[]> {
  console.log('🔍 getUserWhiskyLikes 호출:', { userId })

  const { data, error } = await supabaseBrowser()
    .from('likes')
    .select('whisky_id')
    .eq('user_id', userId)
    .is('post_id', null)

  if (error) {
    console.error('❌ getUserWhiskyLikes 오류:', error)
    throw error
  }

  const result = ((data ?? []) as WhiskyLikeRow[]).map((like) => like.whisky_id)
  console.log('✅ getUserWhiskyLikes 결과:', { userId, count: result.length, likes: result.slice(0, 5) })

  return result
}
