// scripts/migrateImages-final.js - 완전 자동화 이미지 마이그레이션
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs/promises');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service Key 사용

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  console.error('필요한 환경변수: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const IMAGES_DIR = path.join(__dirname, '../public/whiskies');
const BUCKET_NAME = 'whiskies';

// 지원되는 이미지 파일 확장자
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

async function migrateImages() {
  console.log('🚀 완전 자동화 이미지 마이그레이션 시작...');
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

    // 2. DB에서 모든 위스키 정보 가져오기
    console.log('1️⃣ Supabase에서 전체 위스키 목록을 가져오는 중...');
    const { data: whiskies, error: whiskiesError } = await supabase
      .from('whiskies')
      .select('id, name, image');

    if (whiskiesError) {
      console.error('❌ 위스키 목록을 가져오는 데 실패했습니다:', whiskiesError.message);
      return;
    }

    console.log(`✅ ${whiskies.length}개의 위스키 정보를 DB에서 가져왔습니다.`);
    console.log(`🔍 처음 3개 위스키 이름: ${whiskies.slice(0, 3).map(w => `"${w.name}"`).join(', ')}`);

    // 글렌드로낙 관련 위스키가 있는지 확인
    const glendronachWhiskies = whiskies.filter(w => w.name.includes('글렌드로낙'));
    console.log(`🔍 글렌드로낙 관련 위스키 수: ${glendronachWhiskies.length}`);
    if (glendronachWhiskies.length > 0) {
      console.log(`🔍 글렌드로낙 위스키들: ${glendronachWhiskies.map(w => `"${w.name}"`).join(', ')}`);
    }

    // 3. 로컬 이미지 파일 목록 읽기
    console.log(`2️⃣ '${IMAGES_DIR}' 폴더에서 이미지 파일을 읽는 중...`);
    const allFiles = await fs.readdir(IMAGES_DIR);

    // 이미지 파일만 필터링 (시스템 파일 제외)
    const imageFiles = allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return SUPPORTED_EXTENSIONS.includes(ext) && !file.startsWith('.DS_Store');
    });

    console.log(`✅ ${imageFiles.length}개의 이미지 파일을 로컬에서 찾았습니다.`);

    if (imageFiles.length === 0) {
      console.log('📝 처리할 이미지 파일이 없습니다.');
      return;
    }

    console.log('');

    // 통계 변수
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let alreadyMigratedCount = 0;

    // 4. 각 이미지 파일 처리 (디버그 모드: 처음 3개만)
    const debugMode = true;
    const processingCount = debugMode ? Math.min(3, imageFiles.length) : imageFiles.length;

    for (let i = 0; i < processingCount; i++) {
      const fileName = imageFiles[i];
      const localFilePath = path.join(IMAGES_DIR, fileName);

      console.log(`\n[${i + 1}/${imageFiles.length}] 📤 처리 중: ${fileName}`);

      // 파일 이름에서 확장자를 제거하여 위스키 이름 추출
      const baseName = path.parse(fileName).name;
      console.log(`🔍 파일명에서 추출된 이름: "${baseName}"`);
      console.log(`🔍 DB 총 위스키 수: ${whiskies.length}`);
      console.log(`🔍 첫 번째 위스키: "${whiskies[0]?.name}"`);

      // DB에서 일치하는 위스키 찾기 (스마트 매칭)
      let targetWhisky = whiskies.find(w => w.name === baseName);
      console.log(`🎯 정확한 매칭 결과: ${targetWhisky ? '성공' : '실패'}`);

      // 직접 글렌드로낙 12년 테스트
      if (baseName === '글렌드로낙 12년') {
        const directMatch = whiskies.find(w => w.name === '글렌드로낙 12년');
        console.log(`🔍 직접 매칭 테스트: ${directMatch ? '성공' : '실패'}`);
        console.log(`🔍 baseName 길이: ${baseName.length}, 문자 코드: ${Array.from(baseName).map(c => c.charCodeAt(0)).join(', ')}`);
        const glendronach12 = whiskies.find(w => w.name.includes('글렌드로낙') && w.name.includes('12'));
        if (glendronach12) {
          console.log(`🔍 DB의 글렌드로낙 12년 이름: "${glendronach12.name}"`);
          console.log(`🔍 DB 이름 길이: ${glendronach12.name.length}, 문자 코드: ${Array.from(glendronach12.name).map(c => c.charCodeAt(0)).join(', ')}`);
        }
      }
      if (!targetWhisky) {
        const searchTerm = baseName.split(' ')[0];
        console.log(`🔍 검색어: "${searchTerm}"`);
        console.log(`🔍 모든 위스키 중 첫 10개: ${whiskies.slice(0, 10).map(w => `"${w.name}"`).join(', ')}`);
        const similarNames = whiskies.filter(w => w.name.includes(searchTerm)).slice(0, 3);
        console.log(`🔍 유사한 이름들: ${similarNames.map(w => `"${w.name}"`).join(', ')}`);

        // 글렌드로낙 관련 모든 이름 출력
        if (searchTerm === '글렌드로낙') {
          const allGlendronach = whiskies.filter(w => w.name.includes('글렌드로낙'));
          console.log(`🔍 모든 글렌드로낙: ${allGlendronach.map(w => `"${w.name}"`).join(', ')}`);
        }
      }

      // 정확한 매칭이 없으면 유사한 이름으로 매칭 시도
      if (!targetWhisky) {
        targetWhisky = whiskies.find(w => {
          // 기본 브랜드명으로 매칭 (예: "글렌피딕"으로 시작하는 것들)
          const fileBaseName = baseName.split(' ')[0];
          const dbBaseName = w.name.split(' ')[0];
          return fileBaseName === dbBaseName;
        });
        console.log(`🎯 브랜드명 매칭 결과: ${targetWhisky ? '성공' : '실패'}`);
      }

      if (!targetWhisky) {
        console.warn(`⚠️  매칭 실패: '${baseName}' → DB에서 찾을 수 없습니다. (건너뛰기)`);
        skippedCount++;
        continue;
      }

      // 이미 마이그레이션되었는지 확인
      if (targetWhisky.image && targetWhisky.image.includes('supabase.co')) {
        console.log(`✔️  이미 완료: '${fileName}' → 이미 Supabase URL이 설정됨`);
        alreadyMigratedCount++;
        continue;
      }

      try {
        // 파일 읽기
        const fileContent = await fs.readFile(localFilePath);

        // Storage 경로 (위스키 ID + 확장자)
        const storagePath = `${targetWhisky.id}${path.extname(fileName)}`;

        console.log(`🔄 업로드: '${fileName}' → '${storagePath}' (${targetWhisky.name})`);

        // Storage에 업로드
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, fileContent, {
            upsert: true, // 덮어쓰기 허용
            contentType: `image/${path.extname(fileName).slice(1)}`
          });

        if (uploadError) throw uploadError;

        // 공개 URL 받아오기
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(storagePath);

        // DB 업데이트 (image 컬럼에 URL 저장)
        const { error: updateError } = await supabase
          .from('whiskies')
          .update({ image: urlData.publicUrl })
          .eq('id', targetWhisky.id);

        if (updateError) throw updateError;

        console.log(`✅ 성공: '${fileName}' → ${urlData.publicUrl}`);
        successCount++;

      } catch (error) {
        console.error(`❌ 실패: '${fileName}' → ${error.message}`);
        errorCount++;
      }

      // 진행률 표시 (5개마다 또는 마지막)
      if ((i + 1) % 5 === 0 || i === imageFiles.length - 1) {
        const progress = Math.round((i + 1) / imageFiles.length * 100);
        console.log(`📊 진행률: ${i + 1}/${imageFiles.length} (${progress}%)`);
      }
    }

    // 5. 최종 결과 리포트
    console.log('\n🎉 마이그레이션 작업 완료!');
    console.log('='.repeat(60));
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`♻️  이미 완료: ${alreadyMigratedCount}개`);
    console.log(`⚠️  매칭 실패 (건너뜀): ${skippedCount}개`);
    console.log(`❌ 업로드 실패: ${errorCount}개`);
    console.log(`📊 총 처리: ${imageFiles.length}개 파일`);
    console.log('='.repeat(60));

    if (successCount > 0) {
      console.log(`🌟 ${successCount}개 위스키의 이미지가 성공적으로 Supabase Storage로 이전되었습니다!`);
    }

    if (skippedCount > 0) {
      console.log('💡 팁: 매칭되지 않은 파일들은 DB의 name과 정확히 일치하지 않아 건너뛰었습니다.');
      console.log('   이후 관리자가 수동으로 처리하거나 파일명을 수정해주세요.');
    }

    if (errorCount > 0) {
      console.log('⚡ 일부 파일의 업로드에 실패했습니다. 네트워크나 권한을 확인해주세요.');
    }

  } catch (error) {
    console.error('❌ 마이그레이션 작업 중 예상치 못한 오류가 발생했습니다:', error.message);
    console.error('스택 트레이스:', error.stack);
  }
}

// 스크립트 실행
if (require.main === module) {
  migrateImages().then(() => {
    console.log('\n👋 마이그레이션 스크립트를 종료합니다.');
  });
}

module.exports = { migrateImages };