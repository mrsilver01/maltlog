// lib/server/getLikedWhiskyIdsServer.ts (RSC 전용)
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

/**
 * 서버 컴포넌트에서 현재 로그인된 사용자의 찜한 위스키 ID 목록을 가져옵니다.
 * 초기 하이드레이션에서 찜 상태 깜빡임을 방지하기 위해 사용됩니다.
 */
export async function getLikedWhiskyIdsServer(): Promise<string[]> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('🔒 사용자가 로그인되지 않음 - 빈 찜 목록 반환')
      return []
    }

    console.log('🔍 사용자 찜 목록 조회 중:', user.id)

    const { data, error } = await supabase
      .from('likes')
      .select('whisky_id')
      .eq('user_id', user.id)
      .is('post_id', null) // 위스키 찜만 (게시글 좋아요 제외)

    if (error) {
      console.error('❌ 찜 목록 조회 실패:', error)
      return []
    }

    const likedIds = (data ?? []).map(r => String(r.whisky_id)).filter(Boolean)
    console.log('✅ 찜 목록 조회 완료:', likedIds.length, '개')

    return likedIds
  } catch (error) {
    console.error('❌ 찜 목록 조회 중 예외:', error)
    return []
  }
}