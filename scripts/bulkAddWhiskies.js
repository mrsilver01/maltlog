const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase 클라이언트 초기화 (관리자 권한)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 배치 크기 설정
const BATCH_SIZE = 50;

/**
 * CSV 파일을 읽어서 위스키 객체 배열로 파싱
 */
function parseWhiskiesFromFile(filePath) {
  try {
    console.log(`📖 파일을 읽는 중: ${filePath}`);

    // 파일 내용 읽기
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.trim().split('\n');

    console.log(`📝 총 ${lines.length}줄 발견`);

    // 첫 줄이 헤더인지 확인 (ID로 시작하지 않으면 헤더로 간주)
    let startIndex = 0;
    if (lines.length > 0 && !lines[0].match(/^[a-z0-9-]+,/i)) {
      startIndex = 1;
      console.log(`📋 헤더 줄 제외: "${lines[0]}"`);
    }

    const whiskies = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();

      // 빈 줄 건너뛰기
      if (!line) continue;

      // CSV 파싱 (콤마로 분리)
      const parts = line.split(',');

      if (parts.length < 11) {
        console.warn(`⚠️  줄 ${i + 1}: 컬럼 수가 부족합니다 (${parts.length}/11) - 건너뜀`);
        continue;
      }

      // 위스키 객체 생성
      const whisky = {
        id: parts[0].trim(),
        name: parts[1].trim(),
        image: parts[2].trim(),
        distillery: parts[3].trim(),
        region: parts[4].trim(),
        abv: parseFloat(parts[5]) || 0,
        cask: parts[6].trim(),
        price: parts[7].trim(),
        avg_rating: parseFloat(parts[8]) || 0,
        likes: parseInt(parts[9]) || 0,
        is_featured: parts[10].trim().toLowerCase() === 'true'
      };

      // 필수 필드 검증
      if (!whisky.id || !whisky.name) {
        console.warn(`⚠️  줄 ${i + 1}: ID 또는 이름이 비어있습니다 - 건너뜀`);
        continue;
      }

      whiskies.push(whisky);
    }

    console.log(`✅ ${whiskies.length}개의 위스키 데이터 파싱 완료`);
    return whiskies;

  } catch (error) {
    console.error(`❌ 파일 읽기 실패: ${error.message}`);
    return [];
  }
}

/**
 * 배치 단위로 중복 검사 수행
 */
async function checkDuplicatesInBatch(whiskeyIds) {
  try {
    const { data: existingWhiskies, error } = await supabase
      .from('whiskies')
      .select('id')
      .in('id', whiskeyIds);

    if (error) {
      console.error(`❌ 중복 검사 실패: ${error.message}`);
      return new Set();
    }

    return new Set(existingWhiskies.map(w => w.id));
  } catch (error) {
    console.error(`❌ 중복 검사 중 오류: ${error.message}`);
    return new Set();
  }
}

/**
 * 배치 단위로 위스키 데이터 삽입
 */
async function insertWhiskiesBatch(whiskies) {
  if (whiskies.length === 0) return 0;

  try {
    const { error } = await supabase
      .from('whiskies')
      .insert(whiskies);

    if (error) {
      console.error(`❌ 배치 삽입 실패: ${error.message}`);
      return 0;
    }

    return whiskies.length;
  } catch (error) {
    console.error(`❌ 배치 삽입 중 오류: ${error.message}`);
    return 0;
  }
}

/**
 * 배열을 지정된 크기의 배치로 나누기
 */
function createBatches(array, batchSize) {
  const batches = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * 메인 벌크 추가 함수
 */
async function bulkAddWhiskies() {
  console.log('🚀 위스키 벌크 추가 작업 시작...');
  console.log('=' * 60);

  // 통계 변수 초기화
  let totalRead = 0;
  let totalAdded = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  try {
    // 1. 파일에서 위스키 데이터 파싱
    const filePath = path.join(__dirname, 'new_whiskies.txt');
    const allWhiskies = parseWhiskiesFromFile(filePath);

    if (allWhiskies.length === 0) {
      console.log('❌ 처리할 위스키 데이터가 없습니다.');
      return;
    }

    totalRead = allWhiskies.length;
    console.log(`📊 총 ${totalRead}개의 위스키 데이터를 처리합니다.`);

    // 2. 배치로 나누기
    const batches = createBatches(allWhiskies, BATCH_SIZE);
    console.log(`📦 ${batches.length}개의 배치로 나누어 처리합니다 (배치 크기: ${BATCH_SIZE}개)`);
    console.log('=' * 60);

    // 3. 각 배치 처리
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchNumber = batchIndex + 1;

      console.log(`\n🔄 배치 ${batchNumber}/${batches.length} 처리 중... (${batch.length}개 항목)`);

      try {
        // 3-1. 현재 배치의 ID 목록 추출
        const batchIds = batch.map(w => w.id);

        // 3-2. 중복 검사
        console.log(`   🔍 중복 검사 중...`);
        const existingIds = await checkDuplicatesInBatch(batchIds);

        // 3-3. 신규 위스키만 필터링
        const newWhiskies = batch.filter(w => !existingIds.has(w.id));
        const duplicateCount = batch.length - newWhiskies.length;

        console.log(`   📋 배치 결과: 신규 ${newWhiskies.length}개, 중복 ${duplicateCount}개`);

        // 3-4. 신규 위스키 삽입
        if (newWhiskies.length > 0) {
          console.log(`   💾 ${newWhiskies.length}개 위스키 삽입 중...`);
          const insertedCount = await insertWhiskiesBatch(newWhiskies);

          if (insertedCount === newWhiskies.length) {
            console.log(`   ✅ 배치 ${batchNumber} 완료: ${insertedCount}개 성공적으로 추가됨`);
            totalAdded += insertedCount;
          } else {
            console.log(`   ⚠️  배치 ${batchNumber} 부분 성공: ${insertedCount}/${newWhiskies.length}개 추가됨`);
            totalAdded += insertedCount;
            totalErrors += (newWhiskies.length - insertedCount);
          }
        } else {
          console.log(`   ⏭️  배치 ${batchNumber}: 모든 위스키가 이미 존재함 - 건너뜀`);
        }

        totalSkipped += duplicateCount;

      } catch (batchError) {
        console.error(`❌ 배치 ${batchNumber} 처리 실패: ${batchError.message}`);
        totalErrors += batch.length;
      }

      // 진행률 표시
      const progressPercent = ((batchNumber / batches.length) * 100).toFixed(1);
      console.log(`   📈 전체 진행률: ${progressPercent}%`);
    }

  } catch (error) {
    console.error(`❌ 벌크 추가 작업 실패: ${error.message}`);
  }

  // 4. 최종 결과 리포트
  console.log('\n' + '=' * 60);
  console.log('🎉 위스키 벌크 추가 작업 완료!');
  console.log('=' * 60);
  console.log('📊 최종 결과 리포트:');
  console.log(`   📖 파일에서 읽어온 총 위스키 개수: ${totalRead.toLocaleString()}개`);
  console.log(`   ✅ 성공적으로 DB에 추가된 위스키 개수: ${totalAdded.toLocaleString()}개`);
  console.log(`   ⚠️  중복으로 인해 건너뛴 위스키 개수: ${totalSkipped.toLocaleString()}개`);
  if (totalErrors > 0) {
    console.log(`   ❌ 오류가 발생한 위스키 개수: ${totalErrors.toLocaleString()}개`);
  }
  console.log('=' * 60);

  // 성공률 계산
  if (totalRead > 0) {
    const successRate = ((totalAdded / totalRead) * 100).toFixed(2);
    const skipRate = ((totalSkipped / totalRead) * 100).toFixed(2);
    console.log(`📈 추가 성공률: ${successRate}%`);
    console.log(`📈 중복 비율: ${skipRate}%`);
  }

  console.log('\n👋 벌크 추가 작업을 종료합니다.');
}

// 스크립트 실행
if (require.main === module) {
  bulkAddWhiskies()
    .then(() => {
      console.log('스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { bulkAddWhiskies, parseWhiskiesFromFile };