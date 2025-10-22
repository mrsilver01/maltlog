-- ===================================================================
-- 성능 최적화: 검색 인덱스 (GIN 트라이그램) - Phase 1 최소 필수 항목
-- ===================================================================
-- 목적: whiskies 테이블의 name_ko, name_en 컬럼 검색 성능 향상
-- 실행 위치: Supabase Dashboard > SQL Editor
-- ===================================================================

-- pg_trgm 확장 활성화 (트라이그램 검색을 위한 PostgreSQL 확장)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- whiskies 테이블의 name_ko 컬럼에 GIN 트라이그램 인덱스 생성
-- 한국어 위스키명 검색 최적화
CREATE INDEX IF NOT EXISTS idx_whiskies_name_ko_gin_trgm
ON whiskies
USING GIN (name_ko gin_trgm_ops);

-- whiskies 테이블의 name_en 컬럼에 GIN 트라이그램 인덱스 생성
-- 영어 위스키명 검색 최적화
CREATE INDEX IF NOT EXISTS idx_whiskies_name_en_gin_trgm
ON whiskies
USING GIN (name_en gin_trgm_ops);

-- ===================================================================
-- 인덱스 생성 완료 확인
-- ===================================================================

-- 생성된 인덱스 확인 쿼리
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'whiskies'
  AND (indexname = 'idx_whiskies_name_ko_gin_trgm' OR indexname = 'idx_whiskies_name_en_gin_trgm')
ORDER BY indexname;

COMMENT ON INDEX idx_whiskies_name_ko_gin_trgm IS '한국어 위스키명 트라이그램 검색 인덱스';
COMMENT ON INDEX idx_whiskies_name_en_gin_trgm IS '영어 위스키명 트라이그램 검색 인덱스';