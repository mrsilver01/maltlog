import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST() {
  try {
    console.log('🔧 [API] Creating test community data...')

    // 샘플 데이터 생성 (최소한의 필드만)
    const samplePosts = [
      {
        title: '위스키 입문자를 위한 추천 목록',
        content: '처음 위스키를 시작하는 분들을 위한 추천 목록을 정리해봤습니다.'
      },
      {
        title: '스코틀랜드 여행 후기',
        content: '스코틀랜드 위스키 증류소 투어를 다녀온 후기입니다.'
      },
      {
        title: '일본 위스키 vs 스코틀랜드 위스키',
        content: '두 위스키의 특징과 차이점에 대해 이야기해보겠습니다.'
      }
    ]

    // 먼저 profiles 테이블에서 첫 번째 사용자 확인
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (profileError || !profiles || profiles.length === 0) {
      console.error('❌ [API] No profiles found')
      return Response.json({
        error: 'No user profiles found. Please create a user first.'
      }, { status: 400 })
    }

    const userId = profiles[0].id

    // community_posts 테이블 먼저 시도
    let tableName = ''
    let insertResult = null

    try {
      console.log('🔧 [API] Trying to insert into community_posts...')
      insertResult = await supabase
        .from('community_posts')
        .insert(
          samplePosts.map(post => ({
            ...post,
            user_id: userId
          }))
        )
        .select()

      if (!insertResult.error) {
        tableName = 'community_posts'
        console.log('✅ [API] Successfully inserted into community_posts')
      } else {
        throw new Error(insertResult.error.message)
      }
    } catch (e) {
      console.log('⚠️ [API] community_posts failed, trying posts...')

      try {
        insertResult = await supabase
          .from('posts')
          .insert(
            samplePosts.map(post => ({
              ...post,
              user_id: userId
            }))
          )
          .select()

        if (!insertResult.error) {
          tableName = 'posts'
          console.log('✅ [API] Successfully inserted into posts')
        } else {
          throw new Error(insertResult.error.message)
        }
      } catch (e2) {
        console.error('❌ [API] Both table insertions failed')
        return Response.json({
          error: 'Failed to insert test data into any table'
        }, { status: 500 })
      }
    }

    console.log('✅ [API] Test data created successfully')
    return Response.json({
      success: true,
      tableName,
      created: insertResult?.data?.length || 0,
      message: `Successfully created ${insertResult?.data?.length} test posts in ${tableName} table`
    })

  } catch (e) {
    console.error('💥 [API] Test data creation failed:', e)
    return Response.json({
      error: 'Failed to create test data'
    }, { status: 500 })
  }
}