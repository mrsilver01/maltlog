import { supabase } from './supabase'

/**
 * 로그인 직후 자동으로 localStorage 데이터를 Supabase로 마이그레이션
 * 한 번만 실행되고, 완료 후 localStorage 데이터 삭제
 */
export const migrateLocalStorageToSupabase = async (userId: string) => {
  // 이미 마이그레이션 완료된 경우 스킵
  const migrationCompleted = localStorage.getItem('migration_completed')
  if (migrationCompleted === 'true') {
    console.log('✅ 마이그레이션 이미 완료됨')
    return
  }

  console.log('🔄 자동 데이터 마이그레이션 시작...')

  try {
    // 1. 사용자 프로필 마이그레이션
    const userNickname = localStorage.getItem('userNickname')
    const userProfileImage = localStorage.getItem('userProfileImage')

    if (userNickname) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          nickname: userNickname,
          avatar_url: userProfileImage || null
        })

      if (profileError) {
        console.error('프로필 마이그레이션 실패:', profileError)
      } else {
        console.log('✅ 프로필 마이그레이션 완료')
      }
    }

    // 2. 위스키 리뷰 마이그레이션
    const userRatingsRaw = localStorage.getItem('userRatings')
    if (userRatingsRaw) {
      const userRatings = JSON.parse(userRatingsRaw)
      const reviewsToInsert = Object.entries(userRatings).map(([whiskyId, data]: [string, any]) => ({
        user_id: userId,
        whisky_name: whiskyId,
        rating: data.rating,
        note: data.note || data.notes || null
      }))

      if (reviewsToInsert.length > 0) {
        const { error: reviewsError } = await supabase
          .from('reviews')
          .upsert(reviewsToInsert, { onConflict: 'user_id, whisky_name' })

        if (reviewsError) {
          console.error('리뷰 마이그레이션 실패:', reviewsError)
        } else {
          console.log(`✅ ${reviewsToInsert.length}개 리뷰 마이그레이션 완료`)
        }
      }
    }

    // 3. 위스키 좋아요 마이그레이션
    const whiskyLikesRaw = localStorage.getItem('whiskyLikes')
    if (whiskyLikesRaw) {
      const whiskyLikes = JSON.parse(whiskyLikesRaw)
      const likesToInsert = whiskyLikes.map((whiskyId: string) => ({
        user_id: userId,
        whisky_name: whiskyId
      }))

      if (likesToInsert.length > 0) {
        const { error: likesError } = await supabase
          .from('likes')
          .upsert(likesToInsert, { onConflict: 'user_id, whisky_name' })

        if (likesError) {
          console.error('좋아요 마이그레이션 실패:', likesError)
        } else {
          console.log(`✅ ${likesToInsert.length}개 좋아요 마이그레이션 완료`)
        }
      }
    }

    // 4. 커뮤니티 게시글 마이그레이션
    const communityPostsRaw = localStorage.getItem('communityPosts')
    if (communityPostsRaw) {
      const communityPosts = JSON.parse(communityPostsRaw)
      const currentUserNickname = localStorage.getItem('userNickname')

      // 현재 사용자가 작성한 게시글만 마이그레이션
      const userPosts = communityPosts.filter((post: any) => post.author === currentUserNickname)

      if (userPosts.length > 0) {
        const postsToInsert = userPosts.map((post: any) => ({
          user_id: userId,
          title: post.title,
          content: post.content,
          image_url: post.image || null
        }))

        const { error: postsError } = await supabase
          .from('posts')
          .insert(postsToInsert)

        if (postsError) {
          console.error('게시글 마이그레이션 실패:', postsError)
        } else {
          console.log(`✅ ${postsToInsert.length}개 게시글 마이그레이션 완료`)
        }
      }
    }

    // 5. 마이그레이션 완료 표시 및 localStorage 정리
    localStorage.setItem('migration_completed', 'true')

    // 마이그레이션된 데이터는 삭제 (선택적)
    // localStorage.removeItem('userRatings')
    // localStorage.removeItem('whiskyLikes')
    // localStorage.removeItem('communityPosts')
    // localStorage.removeItem('postComments')

    console.log('🎉 자동 마이그레이션 완료!')

  } catch (error) {
    console.error('❌ 마이그레이션 중 오류:', error)
  }
}