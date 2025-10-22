const { createClient } = require('@supabase/supabase-js');
const fs = require('fs/promises');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service key 사용
const supabase = createClient(supabaseUrl, supabaseKey);

const IMAGES_DIR = path.join(__dirname, 'public/whiskies');
const BUCKET_NAME = 'whiskies';

// 확실히 매칭되는 파일들만 수동으로 처리
const CONFIRMED_MATCHES = [
  { file: '글렌피딕 15년.png', id: 'glenfiddich-15' },
  { file: '글렌드로낙 12년.png', id: 'glendronach-12' },
  { file: '글렌드로낙 15년.png', id: 'glendronach-15' },
  { file: '글렌드로낙 18년.png', id: 'glendronach-18' }
];

async function manualUpload() {
  console.log('🚀 수동 이미지 업로드 시작...');

  let successCount = 0;
  let errorCount = 0;

  for (const match of CONFIRMED_MATCHES) {
    const { file, id } = match;
    const localFilePath = path.join(IMAGES_DIR, file);

    try {
      console.log(`📤 업로드 중: ${file} → ${id}`);

      // 파일 존재 확인
      await fs.access(localFilePath);

      // 파일 읽기
      const fileContent = await fs.readFile(localFilePath);

      // Storage 경로
      const storagePath = `${id}${path.extname(file)}`;

      // Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileContent, {
          upsert: true,
          contentType: `image/${path.extname(file).slice(1)}`
        });

      if (uploadError) throw uploadError;

      // 공개 URL 받아오기
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

      // DB 업데이트
      const { error: updateError } = await supabase
        .from('whiskies')
        .update({ image: urlData.publicUrl })
        .eq('id', id);

      if (updateError) throw updateError;

      console.log(`✅ 성공: ${file} → ${urlData.publicUrl}`);
      successCount++;

    } catch (error) {
      console.error(`❌ 실패: ${file} - ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n🎉 수동 업로드 완료!');
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${errorCount}개`);
}

manualUpload().catch(console.error);