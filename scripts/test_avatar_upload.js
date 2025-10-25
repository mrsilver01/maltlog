// scripts/test_avatar_upload.js - 아바타 업로드 기능 테스트
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAvatarBucketSetup() {
  try {
    console.log('🔍 avatars 버킷 확인 중...');

    // 1. 버킷 목록 확인
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ 버킷 목록 확인 실패:', listError);
      return;
    }

    const avatarBucket = buckets?.find(bucket => bucket.name === 'avatars');

    if (avatarBucket) {
      console.log('✅ avatars 버킷이 존재합니다.');
      console.log('버킷 설정:', {
        name: avatarBucket.name,
        public: avatarBucket.public,
        created_at: avatarBucket.created_at
      });
    } else {
      console.log('⚠️ avatars 버킷이 없습니다.');

      // 버킷 생성
      console.log('📁 avatars 버킷 생성 중...');
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 2 * 1024 * 1024 // 2MB
      });

      if (createError) {
        console.error('❌ 버킷 생성 실패:', createError);
        return;
      }

      console.log('✅ avatars 버킷 생성 완료');
    }

    // 2. RLS 정책 확인 (이 부분은 Supabase 대시보드에서 수동으로 확인해야 함)
    console.log('\n📋 RLS 정책 확인사항:');
    console.log('- avatars 버킷에 다음 정책이 설정되어 있는지 확인하세요:');
    console.log('  1. SELECT: auth.uid()::text = (storage.foldername(name))[1]');
    console.log('  2. INSERT: auth.uid()::text = (storage.foldername(name))[1]');
    console.log('  3. UPDATE: auth.uid()::text = (storage.foldername(name))[1]');
    console.log('  4. DELETE: auth.uid()::text = (storage.foldername(name))[1]');

    // 3. 테스트 파일 경로 구조 확인
    console.log('\n📂 파일 경로 구조:');
    console.log('- 올바른 형태: {user_id}/avatar.{ext}');
    console.log('- 예시: abc123-def456/avatar.png');
    console.log('- 이 구조를 통해 사용자는 자신의 폴더에만 접근 가능');

  } catch (error) {
    console.error('💥 오류:', error);
  }
}

testAvatarBucketSetup();