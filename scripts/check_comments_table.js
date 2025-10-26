// scripts/check_comments_table.js - comments 테이블 확인
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCommentsTable() {
  try {
    console.log('🔍 comments 테이블 확인 중...');

    // 1. comments 테이블 구조 확인
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .limit(5);

    console.log('📊 comments 테이블 조회 결과:');
    console.log('에러:', commentsError?.message || '없음');
    console.log('데이터 개수:', comments?.length || 0);
    if (comments && comments.length > 0) {
      console.log('첫 번째 데이터 구조:', Object.keys(comments[0]));
      console.log('첫 번째 데이터:', comments[0]);
    }

    // 2. 간단한 comment 삽입 테스트 (posts 테이블에서 첫 번째 게시글 가져와서)
    const { data: firstPost } = await supabase
      .from('posts')
      .select('id, user_id')
      .limit(1)
      .single();

    if (firstPost) {
      console.log('\n📝 간단한 comment 삽입 테스트...');

      const testComment = {
        post_id: firstPost.id,
        user_id: firstPost.user_id,
        content: '테스트 댓글입니다.'
      };

      const { data: insertResult, error: insertError } = await supabase
        .from('comments')
        .insert([testComment])
        .select();

      console.log('삽입 결과:');
      console.log('에러:', insertError?.message || '없음');
      console.log('삽입된 데이터:', insertResult?.length || 0);

      if (insertResult && insertResult.length > 0) {
        console.log('삽입된 댓글 구조:', Object.keys(insertResult[0]));

        // 테스트 댓글 삭제
        await supabase
          .from('comments')
          .delete()
          .eq('id', insertResult[0].id);
        console.log('테스트 댓글 삭제 완료');
      }
    }

    // 3. posts와 comments 조인 테스트
    console.log('\n🔄 posts-comments 조인 테스트...');
    const { data: joinResult, error: joinError } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        post_id,
        user_id,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .limit(3);

    console.log('조인 테스트 결과:');
    console.log('에러:', joinError?.message || '없음');
    console.log('데이터 개수:', joinResult?.length || 0);
    if (joinResult && joinResult.length > 0) {
      joinResult.forEach((comment, i) => {
        console.log(`${i+1}. "${comment.content}" by ${comment.profiles?.nickname || '익명'}`);
      });
    }

  } catch (error) {
    console.error('💥 오류:', error);
  }
}

checkCommentsTable();