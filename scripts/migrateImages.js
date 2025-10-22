// scripts/migrateImages.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs/promises');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const IMAGES_DIR = path.join(__dirname, '../public/whiskies');
const BUCKET_NAME = 'whiskies';

// 지원되는 이미지 파일 확장자
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

async function migrateImages() {
  console.log('🚀 이미지 마이그레이션을 시작합니다...');
  console.log(`📁 로컬 이미지 폴더: ${IMAGES_DIR}`);
  console.log(`☁️ Supabase Storage 버킷: ${BUCKET_NAME}`);
  console.log('');

  try {
    // 1. 로컬 이미지 디렉토리 존재 확인
    try {
      await fs.access(IMAGES_DIR);
    } catch {
      console.error(`❌ 로컬 이미지 폴더를 찾을 수 없습니다: ${IMAGES_DIR}`);
      return;
    }

    // 2. DB에서 모든 위스키의 id, name, 현재 image URL을 가져옵니다.
    console.log('1. Supabase에서 전체 위스키 목록을 가져오는 중...');
    const { data: whiskies, error: whiskiesError } = await supabase
      .from('whiskies')
      .select('id, name, image');

    if (whiskiesError) {
      console.error('❌ 위스키 목록을 가져오는 데 실패했습니다:', whiskiesError.message);
      return;
    }

    console.log(`✅ ${whiskies.length}개의 위스키 정보를 DB에서 가져왔습니다.`);

    // 디버깅: 글렌피딕이 실제로 있는지 확인
    const glenTest = whiskies.filter(w => w.name && w.name.includes('글렌피딕'));
    console.log(`🔍 글렌피딕 포함 위스키들: ${glenTest.length}개`);
    glenTest.forEach(w => {
      console.log(`  - '${w.name}' (id: ${w.id})`);
    });

    // 3. 로컬 이미지 파일 목록을 읽습니다.
    console.log(`2. '${IMAGES_DIR}' 폴더에서 이미지 파일을 읽는 중...`);
    const allFiles = await fs.readdir(IMAGES_DIR);

    // 이미지 파일만 필터링
    const imageFiles = allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return SUPPORTED_EXTENSIONS.includes(ext);
    });

    console.log(`✅ ${imageFiles.length}개의 이미지 파일을 로컬에서 찾았습니다.`);

    if (imageFiles.length === 0) {
      console.log('📝 처리할 이미지 파일이 없습니다.');
      return;
    }

    console.log('');

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let alreadyMigratedCount = 0;

    // 4. 각 이미지 파일 처리
    for (let i = 0; i < imageFiles.length; i++) {
      const fileName = imageFiles[i];
      const localFilePath = path.join(IMAGES_DIR, fileName);

      console.log(`[${i + 1}/${imageFiles.length}] 처리 중: ${fileName}`);

      // 파일 이름에서 확장자를 제외하여 한글 이름을 얻습니다.
      const baseName = path.parse(fileName).name;

      console.log(`[${i + 1}/${imageFiles.length}] 🔍 '${fileName}' → '${baseName}'`);

      // 5. 파일 이름과 일치하는 'name'을 가진 위스키를 DB 목록에서 찾습니다.

      // 특별 디버깅 - 글렌피딕인 경우 직접 테스트
      if (baseName === '글렌피딕 15년') {
        console.log(`\n🔍 글렌피딕 15년 특별 매칭 테스트:`);
        console.log(`  baseName: '${baseName}'`);
        console.log(`  baseName 길이: ${baseName.length}`);
        console.log(`  whiskies 배열 크기: ${whiskies.length}`);

        // 수동으로 찾기
        const manualFind = whiskies.find(w => w.name === '글렌피딕 15년');
        console.log(`  수동 찾기 결과: ${manualFind ? `✅ 찾음 (${manualFind.id})` : '❌ 못찾음'}`);

        // DB에 있는 모든 글렌피딕 항목 보기
        const allGlen = whiskies.filter(w => w.name && w.name.includes('글렌피딕'));
        console.log(`  DB의 모든 글렌피딕 항목들:`);
        allGlen.forEach(w => {
          const exactMatch = w.name === baseName;
          console.log(`    - '${w.name}' (정확매칭: ${exactMatch})`);
        });
      }

      const targetWhisky = whiskies.find(w => w.name === baseName);

      if (!targetWhisky) {
        console.warn(`⚠️  매칭 실패: '${fileName}' → DB에서 name='${baseName}'인 위스키를 찾을 수 없습니다.`);

        // 디버깅: 유사한 이름들 찾기
        const similarNames = whiskies
          .filter(w => w.name && w.name.includes(baseName.slice(0, 3)))
          .slice(0, 3)
          .map(w => `'${w.name}'`)
          .join(', ');

        if (similarNames) {
          console.log(`💡 유사한 이름들: ${similarNames}`);
        }

        skippedCount++;
        continue;
      }

      // 6. 이미 마이그레이션되었는지 확인합니다.
      if (targetWhisky.image && targetWhisky.image.includes('supabase.co')) {
        console.log(`✔️  이미 완료: '${fileName}' (${targetWhisky.name})`);
        alreadyMigratedCount++;
        continue;
      }

      try {
        // 7. 파일 읽기
        const fileContent = await fs.readFile(localFilePath);

        // Storage에는 URL-safe한 'id'를 파일 이름으로 사용합니다.
        const storagePath = `${targetWhisky.id}${path.extname(fileName)}`;

        console.log(`🔄 업로드: '${fileName}' → '${storagePath}' (${targetWhisky.name})`);

        // 8. Storage에 업로드
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, fileContent, {
            upsert: true,
            contentType: `image/${path.extname(fileName).slice(1)}`
          });

        if (uploadError) throw uploadError;

        // 9. 공개 URL 받아오기
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(storagePath);

        // 10. DB 업데이트
        const { error: updateError } = await supabase
          .from('whiskies')
          .update({ image: urlData.publicUrl })
          .eq('id', targetWhisky.id);

        if (updateError) throw updateError;

        console.log(`✅ 성공: '${fileName}' 마이그레이션 완료!`);
        successCount++;

      } catch (error) {
        console.error(`❌ 실패: '${fileName}' 처리 중 오류:`, error.message);
        errorCount++;
      }

      // 진행률 표시
      if ((i + 1) % 5 === 0 || i === imageFiles.length - 1) {
        console.log(`📊 진행률: ${i + 1}/${imageFiles.length} (${Math.round((i + 1) / imageFiles.length * 100)}%)`);
        console.log('');
      }
    }

    // 11. 최종 결과 리포트
    console.log('🎉 마이그레이션 작업 완료!');
    console.log('='.repeat(50));
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`♻️  이미 완료: ${alreadyMigratedCount}개`);
    console.log(`⚠️  매칭 실패: ${skippedCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    console.log(`📊 총 처리: ${imageFiles.length}개 파일`);
    console.log('='.repeat(50));

    if (errorCount > 0) {
      console.log('💡 실패한 파일들을 다시 확인해보세요.');
    }

    if (skippedCount > 0) {
      console.log('💡 매칭되지 않은 파일들의 이름을 DB의 name_ko와 정확히 일치하도록 수정해보세요.');
    }

  } catch (error) {
    console.error('❌ 마이그레이션 작업 중 예상치 못한 오류가 발생했습니다:', error.message);
    console.error('스택 트레이스:', error.stack);
  }
}

// 스크립트 실행
if (require.main === module) {
  migrateImages().then(() => {
    console.log('👋 마이그레이션 스크립트를 종료합니다.');
  });
}

module.exports = { migrateImages };