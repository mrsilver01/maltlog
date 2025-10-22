// scripts/migrateWhiskyImages.js - 유니코드 정규화 버그 수정 완전 마이그레이션
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs/promises');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service Key for RLS bypass

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

/**
 * 유니코드 정규화 함수 - 핵심 버그 수정
 * @param {string} str - 정규화할 문자열
 * @returns {string} - NFC 정규화된 문자열
 */
function normalizeText(str) {
  return str.normalize('NFC').trim();
}

/**
 * 고급 매칭 함수 - 다양한 매칭 전략 적용
 * @param {string} fileName - 파일명 (확장자 제외)
 * @param {Array} whiskies - DB의 위스키 목록
 * @returns {Object|null} - 매칭된 위스키 객체 또는 null
 */
function findMatchingWhisky(fileName, whiskies) {
  const normalizedFileName = normalizeText(fileName);

  // 1. 정확한 매칭 (유니코드 정규화 후)
  let match = whiskies.find(w => normalizeText(w.name) === normalizedFileName);
  if (match) {
    console.log(`🎯 정확한 매칭 성공: "${fileName}" ↔ "${match.name}"`);
    return match;
  }

  // 2. 브랜드명 매칭 (첫 번째 단어 기준)
  const fileBaseName = normalizedFileName.split(' ')[0];
  match = whiskies.find(w => {
    const dbBaseName = normalizeText(w.name).split(' ')[0];
    return dbBaseName === fileBaseName;
  });
  if (match) {
    console.log(`🎯 브랜드명 매칭 성공: "${fileName}" ↔ "${match.name}"`);
    return match;
  }

  // 3. 부분 문자열 매칭 (전체 브랜드명 포함)
  match = whiskies.find(w => {
    const normalizedDbName = normalizeText(w.name);
    return normalizedDbName.includes(fileBaseName) || fileBaseName.includes(normalizedDbName.split(' ')[0]);
  });
  if (match) {
    console.log(`🎯 부분 매칭 성공: "${fileName}" ↔ "${match.name}"`);
    return match;
  }

  return null;
}

/**
 * 메인 마이그레이션 함수
 */
async function migrateWhiskyImages() {
  console.log('🚀 유니코드 정규화 버그 수정 - 위스키 이미지 마이그레이션 시작...');
  console.log(`📁 로컬 이미지 폴더: ${IMAGES_DIR}`);
  console.log(`☁️ Supabase Storage 버킷: ${BUCKET_NAME}`);
  console.log('🔧 핵심 수정사항: String.prototype.normalize("NFC") 적용');
  console.log('');

  try {
    // 1. 로컬 이미지 디렉토리 존재 확인
    try {
      await fs.access(IMAGES_DIR);
    } catch {
      console.error(`❌ 로컬 이미지 폴더를 찾을 수 없습니다: ${IMAGES_DIR}`);
      return;
    }

    // 2. Storage 버킷 존재 확인
    console.log('1️⃣ Supabase Storage 버킷 확인 중...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('❌ Storage 버킷 목록을 가져오는 데 실패했습니다:', bucketsError.message);
      return;
    }

    const whiskyBucket = buckets.find(bucket => bucket.name === BUCKET_NAME);
    if (!whiskyBucket) {
      console.error(`❌ '${BUCKET_NAME}' 버킷이 존재하지 않습니다. 먼저 05_create_whiskies_bucket.sql을 실행해주세요.`);
      return;
    }
    console.log(`✅ '${BUCKET_NAME}' 버킷이 확인되었습니다.`);

    // 3. DB에서 모든 위스키 정보 가져오기
    console.log('2️⃣ Supabase에서 전체 위스키 목록을 가져오는 중...');
    const { data: whiskies, error: whiskiesError } = await supabase
      .from('whiskies')
      .select('id, name, image');

    if (whiskiesError) {
      console.error('❌ 위스키 목록을 가져오는 데 실패했습니다:', whiskiesError.message);
      return;
    }

    console.log(`✅ ${whiskies.length}개의 위스키 정보를 DB에서 가져왔습니다.`);

    // 유니코드 정규화 전/후 비교 샘플
    const sampleWhisky = whiskies.find(w => w.name.includes('글렌'));
    if (sampleWhisky) {
      console.log(`🔍 정규화 테스트 - 원본: "${sampleWhisky.name}"`);
      console.log(`🔍 정규화 테스트 - NFC: "${normalizeText(sampleWhisky.name)}"`);
      console.log(`🔍 정규화 테스트 - 문자 코드 변화: ${Array.from(sampleWhisky.name).map(c => c.charCodeAt(0)).join(',')} → ${Array.from(normalizeText(sampleWhisky.name)).map(c => c.charCodeAt(0)).join(',')}`);
    }

    // 4. 로컬 이미지 파일 목록 읽기
    console.log(`3️⃣ '${IMAGES_DIR}' 폴더에서 이미지 파일을 읽는 중...`);
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

    // 파일명 정규화 테스트
    const sampleFileName = imageFiles.find(f => f.includes('글렌'));
    if (sampleFileName) {
      const baseName = path.parse(sampleFileName).name;
      console.log(`🔍 파일명 정규화 테스트 - 원본: "${baseName}"`);
      console.log(`🔍 파일명 정규화 테스트 - NFC: "${normalizeText(baseName)}"`);
    }

    console.log('');

    // 통계 변수
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let alreadyMigratedCount = 0;

    // 5. 각 이미지 파일 처리 (전체 처리 - 디버그 모드 제거)
    console.log('4️⃣ 이미지 파일 마이그레이션 시작...');

    for (let i = 0; i < imageFiles.length; i++) {
      const fileName = imageFiles[i];
      const localFilePath = path.join(IMAGES_DIR, fileName);

      console.log(`\n[${i + 1}/${imageFiles.length}] 📤 처리 중: ${fileName}`);

      // 파일 이름에서 확장자를 제거하여 위스키 이름 추출
      const baseName = path.parse(fileName).name;
      console.log(`🔍 파일명에서 추출된 이름: "${baseName}"`);
      console.log(`🔍 정규화된 파일명: "${normalizeText(baseName)}"`);

      // DB에서 일치하는 위스키 찾기 (고급 매칭 + 유니코드 정규화)
      const targetWhisky = findMatchingWhisky(baseName, whiskies);

      if (!targetWhisky) {
        console.warn(`⚠️  매칭 실패: '${baseName}' → DB에서 찾을 수 없습니다. (건너뛰기)`);
        console.warn(`🔍 유사한 이름 검색 결과: ${whiskies.filter(w => normalizeText(w.name).includes(normalizeText(baseName.split(' ')[0]))).slice(0, 3).map(w => `"${w.name}"`).join(', ')}`);
        skippedCount++;
        continue;
      }

      // 이미 마이그레이션되었는지 확인
      if (targetWhisky.image && targetWhisky.image.includes('supabase.co')) {
        console.log(`✔️  이미 완료: '${fileName}' → 이미 Supabase URL이 설정됨 (${targetWhisky.image})`);
        alreadyMigratedCount++;
        continue;
      }

      try {
        // 파일 읽기
        const fileContent = await fs.readFile(localFilePath);
        const fileSizeKB = Math.round(fileContent.length / 1024);

        // Storage 경로 (위스키 ID + 확장자)
        const storagePath = `${targetWhisky.id}${path.extname(fileName)}`;

        console.log(`🔄 업로드: '${fileName}' (${fileSizeKB}KB) → '${storagePath}' (${targetWhisky.name})`);

        // Storage에 업로드
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, fileContent, {
            upsert: true, // 덮어쓰기 허용
            contentType: `image/${path.extname(fileName).slice(1).replace('jpg', 'jpeg')}`
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

      // 진행률 표시 (10개마다 또는 마지막)
      if ((i + 1) % 10 === 0 || i === imageFiles.length - 1) {
        const progress = Math.round(((i + 1) / imageFiles.length) * 100);
        console.log(`📊 진행률: ${i + 1}/${imageFiles.length} (${progress}%)`);
      }
    }

    // 6. 최종 결과 리포트
    console.log('\n🎉 유니코드 정규화 마이그레이션 작업 완료!');
    console.log('='.repeat(70));
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`♻️  이미 완료: ${alreadyMigratedCount}개`);
    console.log(`⚠️  매칭 실패 (건너뜀): ${skippedCount}개`);
    console.log(`❌ 업로드 실패: ${errorCount}개`);
    console.log(`📊 총 처리: ${imageFiles.length}개 파일`);
    console.log(`🔧 핵심 개선: 유니코드 정규화(NFC) 적용으로 한글 매칭 문제 해결`);
    console.log('='.repeat(70));

    if (successCount > 0) {
      console.log(`🌟 ${successCount}개 위스키의 이미지가 성공적으로 Supabase Storage로 이전되었습니다!`);
      console.log(`📁 Storage URL 형식: ${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/[whisky_id].[ext]`);
    }

    if (skippedCount > 0) {
      console.log('💡 팁: 매칭되지 않은 파일들은 DB의 name과 정확히 일치하지 않아 건너뛰었습니다.');
      console.log('   파일명을 DB name과 일치하도록 수정하거나, 수동으로 처리해주세요.');
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
  migrateWhiskyImages().then(() => {
    console.log('\n👋 유니코드 정규화 마이그레이션 스크립트를 종료합니다.');
    console.log('🔗 다음 단계: npm run migrate-images를 통해 실행하세요.');
  });
}

module.exports = { migrateWhiskyImages };