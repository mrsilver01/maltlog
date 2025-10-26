-- whiskies 테이블 RLS 보안 설정
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행
--
-- 전제조건: public.is_admin() 함수가 존재해야 함
-- (setup_admin_system.sql에서 생성되므로 먼저 실행 필요)

-- 1. whiskies 테이블에 RLS 활성화
ALTER TABLE public.whiskies ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS whiskies_select_all ON public.whiskies;
DROP POLICY IF EXISTS whiskies_admin_cud ON public.whiskies;

-- 3. 읽기 정책: 모든 사용자가 위스키 정보 조회 가능
CREATE POLICY whiskies_select_all ON public.whiskies
FOR SELECT USING (true);

-- 4. 생성/수정/삭제 정책: 관리자만 가능
CREATE POLICY whiskies_admin_cud ON public.whiskies
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 확인용 쿼리 (선택사항)
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'whiskies';
-- SELECT * FROM pg_policies WHERE tablename = 'whiskies';

COMMENT ON POLICY whiskies_select_all ON public.whiskies IS '모든 사용자가 위스키 정보를 조회할 수 있음';
COMMENT ON POLICY whiskies_admin_cud ON public.whiskies IS '관리자만 위스키 정보를 생성/수정/삭제할 수 있음';