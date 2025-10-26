// scripts/check_posts_table.js - posts 테이블 확인
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPostsTable() {
  try {
    console.log('🔍 posts 테이블 확인 중...');

    // 1. posts 테이블 구조 확인
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(5);

    console.log('📊 posts 테이블 조회 결과:');
    console.log('에러:', postsError?.message || '없음');
    console.log('데이터 개수:', posts?.length || 0);
    if (posts && posts.length > 0) {
      console.log('첫 번째 데이터 구조:', Object.keys(posts[0]));
    }

    // 2. profiles 테이블 확인
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, nickname')
      .limit(3);

    console.log('\n👤 profiles 테이블 조회 결과:');
    console.log('에러:', profilesError?.message || '없음');
    console.log('사용자 수:', profiles?.length || 0);
    if (profiles && profiles.length > 0) {
      console.log('사용자 목록:', profiles.map(p => `${p.nickname} (${p.id})`));
    }

    // 3. 간단한 posts 삽입 테스트
    if (profiles && profiles.length > 0) {
      console.log('\n📝 간단한 post 삽입 테스트...');

      const testPost = {
        title: '테스트 게시글',
        content: '테스트 내용입니다.',
        user_id: profiles[0].id
      };

      const { data: insertResult, error: insertError } = await supabase
        .from('posts')
        .insert([testPost])
        .select();

      console.log('삽입 결과:');
      console.log('에러:', insertError?.message || '없음');
      console.log('삽입된 데이터:', insertResult?.length || 0);
    }

    // 4. 최신 posts 조회 (커뮤니티 프리뷰용)
    console.log('\n🔄 최신 posts 조회 (커뮤니티 프리뷰용)...');
    const { data: latestPosts, error: latestError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        created_at,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    console.log('최신 posts 조회 결과:');
    console.log('에러:', latestError?.message || '없음');
    console.log('데이터 개수:', latestPosts?.length || 0);
    if (latestPosts && latestPosts.length > 0) {
      latestPosts.forEach((post, i) => {
        console.log(`${i+1}. "${post.title}" by ${post.profiles?.nickname || '익명'}`);
      });
    }

  } catch (error) {
    console.error('💥 오류:', error);
  }
}

checkPostsTable();