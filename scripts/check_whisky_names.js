// scripts/check_whisky_names.js - 위스키 이름 확인 도구
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function searchWhiskyNames(searchTerm = '') {
  try {
    console.log(`🔍 "${searchTerm}" 검색 중...`);

    const { data: whiskies, error } = await supabase
      .from('whiskies')
      .select('id, name')
      .ilike('name', `%${searchTerm}%`)
      .limit(20);

    if (error) {
      console.error('❌ 검색 오류:', error);
      return;
    }

    if (!whiskies || whiskies.length === 0) {
      console.log(`⚠️ "${searchTerm}"와 관련된 위스키를 찾을 수 없습니다.`);
      return;
    }

    console.log(`✅ 총 ${whiskies.length}개 결과:`);
    whiskies.forEach((whisky, index) => {
      console.log(`${index + 1}. "${whisky.name}" (ID: ${whisky.id})`);
    });

  } catch (error) {
    console.error('💥 오류:', error);
  }
}

// 명령줄 인수로 검색어 받기
const searchTerm = process.argv[2] || '';

if (!searchTerm) {
  console.log('사용법: node scripts/check_whisky_names.js [검색어]');
  console.log('예시: node scripts/check_whisky_names.js 글렌피딕');
  process.exit(1);
}

searchWhiskyNames(searchTerm);