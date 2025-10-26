-- 관리자 시스템 설정 SQL
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행

-- 1. 관리자 판단 함수 생성
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  j JSONB := auth.jwt();
BEGIN
  RETURN COALESCE((j ->> 'role') = 'admin', FALSE)
      OR COALESCE((j -> 'app_metadata' ->> 'role') = 'admin', FALSE);
END; $$;

-- 2. 공지사항 테이블 생성
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('info','warning','critical')),
  display TEXT NOT NULL CHECK (display IN ('banner','modal')),
  audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all','guest','auth')),
  dismissible BOOLEAN NOT NULL DEFAULT TRUE,
  start_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 3. 공지사항 해제 기록 테이블
CREATE TABLE IF NOT EXISTS public.announcement_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (notice_id, user_id)
);

-- 4. RLS 활성화
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_dismissals ENABLE ROW LEVEL SECURITY;

-- 5. 공지사항 정책들
-- 읽기: 기간/대상에 맞는 것 또는 관리자
DROP POLICY IF EXISTS ann_select ON public.announcements;
CREATE POLICY ann_select ON public.announcements
FOR SELECT USING (
  public.is_admin()
  OR (
    NOW() BETWEEN start_at AND COALESCE(end_at, 'infinity'::TIMESTAMPTZ)
  )
);

-- 생성/수정/삭제: 관리자만
DROP POLICY IF EXISTS ann_cud ON public.announcements;
CREATE POLICY ann_cud ON public.announcements
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. 해제 기록 정책들
-- 본인 또는 관리자만 조회
DROP POLICY IF EXISTS ann_dismiss_select ON public.announcement_dismissals;
CREATE POLICY ann_dismiss_select ON public.announcement_dismissals
FOR SELECT USING (public.is_admin() OR user_id = auth.uid());

-- 본인만 해제 기록 생성
DROP POLICY IF EXISTS ann_dismiss_insert ON public.announcement_dismissals;
CREATE POLICY ann_dismiss_insert ON public.announcement_dismissals
FOR INSERT WITH CHECK (user_id = auth.uid());

-- 7. 업데이트 트리거 (updated_at 자동 설정)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_announcements_updated_at ON public.announcements;
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 8. 테스트 공지사항 삽입 (관리자 계정 설정 후 실행)
-- INSERT INTO public.announcements (title, body, level, display, created_by)
-- VALUES (
--   '환영합니다!',
--   '몰트로그 서비스를 이용해주셔서 감사합니다. 만 19세 이상만 이용 가능합니다.',
--   'info',
--   'banner',
--   '관리자_USER_ID_여기에_입력'
-- );

COMMENT ON FUNCTION public.is_admin() IS '사용자가 관리자인지 확인하는 함수';
COMMENT ON TABLE public.announcements IS '사이트 공지사항 테이블';
COMMENT ON TABLE public.announcement_dismissals IS '사용자별 공지사항 해제 기록';