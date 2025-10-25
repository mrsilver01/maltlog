// scripts/fix_invalid_whisky.js - 잘못된 위스키 데이터 수정
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixInvalidWhisky() {
  try {
    console.log('🔍 잘못된 위스키 데이터 확인 중...');

    // name이 "name"인 위스키 찾기
    const { data: invalidWhiskies, error: findError } = await supabase
      .from('whiskies')
      .select('id, name')
      .eq('name', 'name');

    if (findError) {
      console.error('❌ 검색 오류:', findError);
      return;
    }

    if (!invalidWhiskies || invalidWhiskies.length === 0) {
      console.log('✅ 잘못된 데이터가 없습니다.');
      return;
    }

    console.log(`⚠️ 잘못된 위스키 ${invalidWhiskies.length}개 발견:`);
    invalidWhiskies.forEach(whisky => {
      console.log(`- ID: "${whisky.id}", Name: "${whisky.name}"`);
    });

    // 삭제 확인
    console.log('\n🗑️ 잘못된 데이터를 삭제합니다...');

    for (const whisky of invalidWhiskies) {
      const { error: deleteError } = await supabase
        .from('whiskies')
        .delete()
        .eq('id', whisky.id);

      if (deleteError) {
        console.error(`❌ ${whisky.id} 삭제 실패:`, deleteError);
      } else {
        console.log(`✅ ${whisky.id} 삭제 완료`);
      }
    }

    console.log('\n🎉 잘못된 데이터 정리 완료!');

  } catch (error) {
    console.error('💥 오류:', error);
  }
}

fixInvalidWhisky();