// scripts/delete_test_posts.js - 테스트 게시글 삭제
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deleteTestPosts() {
  try {
    console.log('🔍 현재 posts 테이블 내용 확인...');

    // 1. 현재 모든 posts 조회
    const { data: allPosts, error: selectError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        created_at,
        profiles (
          nickname
        )
      `)
      .order('created_at', { ascending: false });

    if (selectError) {
      console.error('❌ posts 조회 실패:', selectError);
      return;
    }

    console.log('📋 현재 게시글 목록:');
    allPosts.forEach((post, i) => {
      console.log(`${i+1}. ID: ${post.id} | 제목: "${post.title}" | 작성자: ${post.profiles?.nickname || '익명'} | 날짜: ${post.created_at}`);
    });

    // 2. "테스트 게시글" 제목을 가진 게시글들 찾기
    const testPosts = allPosts.filter(post => post.title === '테스트 게시글');

    if (testPosts.length === 0) {
      console.log('⚠️  "테스트 게시글"이라는 제목의 게시글을 찾을 수 없습니다.');
      return;
    }

    console.log(`\n🎯 삭제 대상 게시글 ${testPosts.length}개 발견:`);
    testPosts.forEach((post, i) => {
      console.log(`${i+1}. ID: ${post.id} | 작성자: ${post.profiles?.nickname || '익명'} | 날짜: ${post.created_at}`);
    });

    // 3. 테스트 게시글들 삭제
    console.log('\n🗑️  테스트 게시글들 삭제 중...');

    const deleteIds = testPosts.map(post => post.id);
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .in('id', deleteIds);

    if (deleteError) {
      console.error('❌ 삭제 실패:', deleteError);
      return;
    }

    console.log(`✅ ${testPosts.length}개의 테스트 게시글이 성공적으로 삭제되었습니다!`);

    // 4. 삭제 후 남은 게시글 확인
    console.log('\n🔍 삭제 후 남은 게시글들:');
    const { data: remainingPosts, error: finalError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        created_at,
        profiles (
          nickname
        )
      `)
      .order('created_at', { ascending: false });

    if (finalError) {
      console.error('❌ 최종 조회 실패:', finalError);
      return;
    }

    if (remainingPosts.length === 0) {
      console.log('📭 게시글이 모두 삭제되었습니다.');
    } else {
      remainingPosts.forEach((post, i) => {
        console.log(`${i+1}. ID: ${post.id} | 제목: "${post.title}" | 작성자: ${post.profiles?.nickname || '익명'}`);
      });
    }

  } catch (error) {
    console.error('💥 오류:', error);
  }
}

deleteTestPosts();