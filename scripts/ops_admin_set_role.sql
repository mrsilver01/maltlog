-- ops_admin_set_role.sql
-- 목적: 특정 이메일 사용자에게 관리자 롤 부여 (raw_app_meta_data)
-- 사용 시나리오: 운영자가 수동으로 관리자 할당할 때 사용

-- 1) 대상 사용자 확인
SELECT id, email, raw_app_meta_data
FROM auth.users
WHERE email = '<<ADMIN_EMAIL>>';  -- ex) 'mingi1001114@gmail.com'

-- 2) 관리자 롤 부여
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role','admin')
WHERE email = '<<ADMIN_EMAIL>>';

-- 3) 확인
SELECT id, email, raw_app_meta_data
FROM auth.users
WHERE email = '<<ADMIN_EMAIL>>';

-- 주의: 해당 사용자는 "재로그인"해야 JWT에 반영됨