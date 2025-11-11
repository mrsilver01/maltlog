const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyExactSchema() {
  console.log('=== EXACT SCHEMA VERIFICATION FOR SENIOR ===\n');

  try {
    // 1. whiskies 테이블 정확한 스키마
    console.log('1. WHISKIES TABLE EXACT SCHEMA:');
    const { data: whiskiesData, error: whiskiesError } = await supabase
      .from('whiskies')
      .select('*')
      .limit(1);

    if (whiskiesData && whiskiesData.length > 0) {
      console.log('Columns:', Object.keys(whiskiesData[0]));
      console.log('Sample record:', whiskiesData[0]);
      console.log('Primary Key (id) example:', whiskiesData[0].id);
    }

    // 2. reviews 정확한 관계 확인
    console.log('\n2. REVIEWS TABLE & RELATIONSHIP:');
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .limit(3);

    if (reviewsData) {
      console.log('Columns:', Object.keys(reviewsData[0] || {}));
      console.log('Sample records:');
      reviewsData.forEach((review, index) => {
        console.log(`  ${index + 1}. user_id: ${review.user_id}, whisky_id: ${review.whisky_id}, rating: ${review.rating}`);
      });
    }

    // 3. likes 정확한 관계 확인
    console.log('\n3. LIKES TABLE & RELATIONSHIP:');
    const { data: likesData, error: likesError } = await supabase
      .from('likes')
      .select('*')
      .limit(5);

    if (likesData) {
      console.log('Columns:', Object.keys(likesData[0] || {}));
      console.log('Sample records:');
      likesData.forEach((like, index) => {
        console.log(`  ${index + 1}. user_id: ${like.user_id}, whisky_id: ${like.whisky_id}, post_id: ${like.post_id}`);
      });
    }

    // 4. 실제 JOIN 가능성 테스트
    console.log('\n4. JOIN TEST (whiskies.id = reviews.whisky_id):');
    const { data: joinTest, error: joinError } = await supabase
      .from('reviews')
      .select(`
        whisky_id,
        rating,
        whiskies!inner(id, name)
      `)
      .limit(3);

    if (joinError) {
      console.log('JOIN ERROR:', joinError.message);
    } else {
      console.log('✓ JOIN SUCCESS - Sample results:');
      joinTest.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.whiskies.name} (${item.whisky_id}) - Rating: ${item.rating}`);
      });
    }

    // 5. 집계 데이터 실제 vs 저장
    console.log('\n5. AGGREGATION MISMATCH ANALYSIS:');

    // 실제 likes 계산
    const { data: actualLikes } = await supabase
      .from('likes')
      .select('whisky_id');

    const likeCounts = {};
    actualLikes?.forEach(like => {
      likeCounts[like.whisky_id] = (likeCounts[like.whisky_id] || 0) + 1;
    });

    // 저장된 likes와 비교
    const { data: storedLikes } = await supabase
      .from('whiskies')
      .select('id, name, likes')
      .in('id', Object.keys(likeCounts));

    console.log('Actual vs Stored Likes:');
    storedLikes?.forEach(whisky => {
      const actual = likeCounts[whisky.id] || 0;
      const stored = whisky.likes;
      console.log(`  ${whisky.name}: actual=${actual}, stored=${stored} ${actual === stored ? '✓' : '✗'}`);
    });

    // 6. 테이블 제약조건 체크 (가능한 경우)
    console.log('\n6. CONSTRAINT CHECK:');
    console.log('Note: 제약조건 정보는 Supabase Dashboard > Database > Tables에서 확인 필요');

  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verifyExactSchema();