// scripts/check_all_whiskies.js - 모든 위스키 확인
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllWhiskies() {
  try {
    console.log('🔍 모든 위스키 조회 중...');

    const { data: whiskies, error } = await supabase
      .from('whiskies')
      .select('id, name, image, likes')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ 조회 오류:', error);
      return;
    }

    if (!whiskies || whiskies.length === 0) {
      console.log('⚠️ 위스키가 없습니다.');
      return;
    }

    console.log(`✅ 총 ${whiskies.length}개 위스키:`)
    whiskies.forEach((whisky, index) => {
      const imageType = whisky.image ?
        (whisky.image.includes('supabase.co') ? '📷 Supabase' : '🖼️ Local') :
        '❌ No Image';

      console.log(`${index + 1}. "${whisky.name}" (ID: ${whisky.id})`);
      console.log(`   이미지: ${imageType}`);
      console.log(`   찜 수: ${whisky.likes || 0}`);
      console.log('');
    });

  } catch (error) {
    console.error('💥 오류:', error);
  }
}

checkAllWhiskies();