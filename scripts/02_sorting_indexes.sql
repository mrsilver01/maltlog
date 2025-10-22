-- ===================================================================
-- 성능 최적화: 정렬 인덱스 (내림차순) - Phase 1 최소 필수 항목
-- ===================================================================
-- 목적: posts 테이블의 created_at 컬럼 시간순 정렬 성능 향상
-- 실행 위치: Supabase Dashboard > SQL Editor
-- ===================================================================

-- posts 테이블의 created_at 컬럼에 내림차순(DESC) 인덱스 생성
-- 최신 게시물 조회 성능 최적화
CREATE INDEX IF NOT EXISTS idx_posts_created_at_desc
ON posts (created_at DESC);

-- ===================================================================
-- 인덱스 생성 완료 확인
-- ===================================================================

-- 생성된 정렬 인덱스 확인 쿼리
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'posts'
  AND indexname = 'idx_posts_created_at_desc'
ORDER BY indexname;

COMMENT ON INDEX idx_posts_created_at_desc IS '게시물 생성일 내림차순 정렬 인덱스';