const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMatching() {
  console.log('🔍 매칭 테스트 시작...');

  // DB에서 위스키 목록 가져오기
  const { data: whiskies, error } = await supabase
    .from('whiskies')
    .select('id, name');

  if (error) {
    console.error('DB 오류:', error);
    return;
  }

  console.log(`DB에서 ${whiskies.length}개 위스키 로드됨`);

  // 테스트할 파일명들
  const testFiles = [
    '글렌피딕 15년.png',
    '글렌드로낙 12년.png',
    '맥켈란 12년.png'
  ];

  testFiles.forEach(fileName => {
    const baseName = path.parse(fileName).name;
    console.log(`\n📁 파일: '${fileName}' → baseName: '${baseName}'`);

    // 매칭 시도
    const targetWhisky = whiskies.find(w => w.name === baseName);

    if (targetWhisky) {
      console.log(`✅ 매칭 성공! ID: ${targetWhisky.id}, Name: '${targetWhisky.name}'`);
    } else {
      console.log(`❌ 매칭 실패`);

      // 유사한 이름들 찾기
      const similar = whiskies.filter(w => w.name && w.name.includes(baseName.substring(0, 2)));
      if (similar.length > 0) {
        console.log(`💡 유사한 이름들:`);
        similar.slice(0, 5).forEach(w => {
          console.log(`  - '${w.name}' (id: ${w.id})`);
        });
      }
    }
  });
}

testMatching().catch(console.error);