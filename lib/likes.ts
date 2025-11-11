// lib/likes.ts
import { supabaseBrowser } from '@/lib/supabase/browser'

export async function isWhiskyLiked(userId: string, whiskyId: string) {
  const { data, error } = await supabaseBrowser()
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
  const { error } = await supabaseBrowser()
    .from('likes')
    .insert([{ user_id: userId, whisky_id: whiskyId, post_id: null }])

  // 유니크 충돌(이미 찜된 경우)은 무시
  if (error && error.code === '23505') {
    console.log('이미 찜한 위스키입니다.')
    return
  }

  if (error) throw error

  // 위스키 테이블의 likes_count 증가
  await incrementWhiskyLikesCount(whiskyId)
}

export async function unlikeWhisky(userId: string, whiskyId: string) {
  const { error } = await supabaseBrowser()
    .from('likes')
    .delete()
    .eq('user_id', userId)
    .eq('whisky_id', whiskyId)
    .is('post_id', null)

  if (error) throw error

  // 위스키 테이블의 likes_count 감소
  await decrementWhiskyLikesCount(whiskyId)
}

// 사용자의 모든 찜한 위스키 ID 목록 가져오기
export async function getUserWhiskyLikes(userId: string): Promise<string[]> {
  const { data, error } = await supabaseBrowser()
    .from('likes')
    .select('whisky_id')
    .eq('user_id', userId)
    .is('post_id', null) // 위스키 찜만 필터링

  if (error) throw error
  return (data || []).map(like => like.whisky_id)
}

// 위스키 찜 수 증가
async function incrementWhiskyLikesCount(whiskyId: string) {
  try {
    const { error } = await supabaseBrowser().rpc('increment_whisky_likes', {
      whisky_id: whiskyId
    })

    if (error) {
      // RPC 함수가 없는 경우 직접 업데이트
      console.log('RPC 함수 없음, 직접 업데이트 시도')
      await updateWhiskyLikesCountDirect(whiskyId, 1)
    }
  } catch (e) {
    console.error('찜 수 증가 실패:', e)
    // fallback: 직접 업데이트
    await updateWhiskyLikesCountDirect(whiskyId, 1)
  }
}

// 위스키 찜 수 감소
async function decrementWhiskyLikesCount(whiskyId: string) {
  try {
    const { error } = await supabaseBrowser().rpc('decrement_whisky_likes', {
      whisky_id: whiskyId
    })

    if (error) {
      // RPC 함수가 없는 경우 직접 업데이트
      console.log('RPC 함수 없음, 직접 업데이트 시도')
      await updateWhiskyLikesCountDirect(whiskyId, -1)
    }
  } catch (e) {
    console.error('찜 수 감소 실패:', e)
    // fallback: 직접 업데이트
    await updateWhiskyLikesCountDirect(whiskyId, -1)
  }
}

// 직접 업데이트 (fallback 방법)
async function updateWhiskyLikesCountDirect(whiskyId: string, increment: number) {
  // 현재 찜 수를 실제로 계산해서 업데이트
  const { data: likesData, error: likesError } = await supabaseBrowser()
    .from('likes')
    .select('id')
    .eq('whisky_id', whiskyId)
    .is('post_id', null)

  if (likesError) {
    console.error('찜 수 조회 실패:', likesError)
    return
  }

  const actualLikesCount = likesData?.length ?? 0

  // whiskies 테이블 업데이트 (likes 컬럼 사용)
  const { error: updateError } = await supabaseBrowser()
    .from('whiskies')
    .update({ likes: actualLikesCount })
    .eq('id', whiskyId)

  if (updateError) {
    console.error('위스키 찜 수 업데이트 실패:', updateError)
  } else {
    console.log(`✅ 위스키 ${whiskyId} 찜 수 업데이트: ${actualLikesCount}`)
  }
}