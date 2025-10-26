-- ⚠️ NOTE: 이 스크립트는 "raw_app_meta_data"가 아닌 "app_metadata"를 갱신하려고 시도한 "오류 버전"입니다.
-- Supabase는 auth.users에서 raw_app_meta_data 컬럼을 사용합니다.
-- 운영 시에는 scripts/ops_admin_set_role.sql(정정본)을 사용하세요.

-- 관리자 계정 설정 SQL
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행

-- 1. 사용자 확인 (mingi1001114@gmail.com)
-- 이 쿼리로 사용자 ID를 먼저 확인하세요
SELECT id, email, created_at FROM auth.users WHERE email = 'mingi1001114@gmail.com';

-- 2. 관리자 권한 설정
-- 위 쿼리에서 확인한 사용자 ID를 사용하여 app_metadata 업데이트
-- 아래 USER_ID_HERE 부분을 실제 사용자 ID로 교체하세요

-- UPDATE auth.users
-- SET app_metadata = jsonb_set(
--   COALESCE(app_metadata, '{}'),
--   '{role}',
--   '"admin"'
-- )
-- WHERE id = 'USER_ID_HERE';

-- 3. 설정 확인
-- 관리자 권한이 정상적으로 설정되었는지 확인
-- SELECT id, email, app_metadata FROM auth.users WHERE email = 'mingi1001114@gmail.com';

-- 4. 테스트용 공지사항 생성 (관리자 설정 후 실행)
-- 관리자 계정으로 공지사항 시스템을 테스트해보세요
-- INSERT INTO public.announcements (title, body, level, display, created_by)
-- VALUES (
--   '환영합니다!',
--   '몰트로그 서비스를 이용해주셔서 감사합니다. 만 19세 이상만 이용 가능합니다.',
--   'info',
--   'banner',
--   'USER_ID_HERE'
-- );

-- 주의사항:
-- 1. 먼저 1번 쿼리로 사용자 ID를 확인하세요
-- 2. 확인된 ID로 2번 쿼리의 USER_ID_HERE를 교체하세요
-- 3. 주석을 제거하고 실행하세요
-- 4. 설정 후 3번 쿼리로 확인하세요

COMMENT ON SCHEMA auth IS 'Supabase 인증 스키마 - 관리자 권한 설정 완료';