-- ===================================================================
-- P0: 위스키 찜(Like) 테이블 정리 및 보안 설정
-- ===================================================================
-- 목적: likes 테이블을 위스키 찜의 단일 진실 소스로 확정
-- 실행 위치: Supabase Dashboard > SQL Editor
-- 실행 순서: 순서대로 단계별 실행 (주석 확인 필수)
-- ===================================================================

-- ===================================================================
-- 1. 실제 테이블 구조 확인 (실행 전 필수 체크)
-- ===================================================================

-- 1-1. 현재 테이블 목록 확인
SELECT table_type, table_name
FROM information_schema.tables
WHERE table_schema='public'
ORDER BY table_type, table_name;

-- 1-2. likes 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name='likes'
ORDER BY ordinal_position;

-- 예상 결과: user_id (uuid), whisky_id (text), post_id (uuid, nullable)

-- ===================================================================
-- 2. RLS 정책 적용 (기존 정책이 있으면 스킵됨)
-- ===================================================================

-- 2-1. RLS 활성화
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- 2-2. 읽기 정책 (모든 사용자가 읽기 가능)
CREATE POLICY IF NOT EXISTS likes_select_all ON public.likes
FOR SELECT USING (true);

-- 2-3. 삽입 정책 (본인만 삽입 가능)
CREATE POLICY IF NOT EXISTS likes_insert_own ON public.likes
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2-4. 삭제 정책 (본인만 삭제 가능)
CREATE POLICY IF NOT EXISTS likes_delete_own ON public.likes
FOR DELETE USING (auth.uid() = user_id);

-- ===================================================================
-- 3. 중복 방지 인덱스 생성 (실행 전 중복 확인 필수)
-- ===================================================================

-- 3-1. 기존 중복 데이터 확인
SELECT user_id, whisky_id, COUNT(*) as cnt
FROM public.likes
WHERE whisky_id IS NOT NULL
GROUP BY user_id, whisky_id
HAVING COUNT(*) > 1;

-- 결과: 중복이 있으면 다음 단계에서 정리 필요
-- 중복이 없으면 바로 3-3 단계로 이동

-- 3-2. 중복 데이터 정리 (중복이 있는 경우에만 실행)
-- 주의: 실제 데이터 상황에 맞게 조정 필요
/*
WITH duplicates AS (
  SELECT user_id, whisky_id,
         ROW_NUMBER() OVER (PARTITION BY user_id, whisky_id ORDER BY created_at DESC) as rn
  FROM public.likes
  WHERE whisky_id IS NOT NULL
)
DELETE FROM public.likes
WHERE (user_id, whisky_id) IN (
  SELECT user_id, whisky_id FROM duplicates WHERE rn > 1
);
*/

-- 3-3. 부분 유니크 인덱스 생성 (위스키 찜 중복 방지)
CREATE UNIQUE INDEX IF NOT EXISTS likes_user_whisky_unique
ON public.likes(user_id, whisky_id)
WHERE whisky_id IS NOT NULL;

-- ===================================================================
-- 4. 검증 쿼리 (정책과 인덱스 적용 확인)
-- ===================================================================

-- 4-1. RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'likes';

-- 4-2. 인덱스 확인
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'likes' AND schemaname = 'public';

-- 4-3. 테스트 쿼리 (로그인된 상태에서 실행)
-- INSERT INTO public.likes (user_id, whisky_id, post_id)
-- VALUES (auth.uid(), 'test-whisky-id', null);

-- ===================================================================
-- 실행 완료 후 확인사항
-- ===================================================================
-- ✅ RLS 정책 3개 생성됨: likes_select_all, likes_insert_own, likes_delete_own
-- ✅ 유니크 인덱스 생성됨: likes_user_whisky_unique
-- ✅ 중복 데이터 없음 확인
-- ✅ 테스트 삽입/삭제 정상 동작
-- ===================================================================