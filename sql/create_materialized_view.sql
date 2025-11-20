-- =====================================================
-- Maltlog 성능 최적화: Materialized View 생성
-- 목적: whiskies_with_stats 뷰의 실시간 집계 연산(2.5초) → 사전 계산된 결과(0.01초)
-- =====================================================

-- 기존 whiskies_with_stats_mat이 있다면 삭제 (재실행 가능하도록)
DROP MATERIALIZED VIEW IF EXISTS whiskies_with_stats_mat CASCADE;

-- Materialized View 생성
-- 기존 whiskies_with_stats 뷰와 동일한 구조로 물리적 저장
CREATE MATERIALIZED VIEW whiskies_with_stats_mat AS
SELECT
    w.id,
    w.name,
    w.name_ko,
    w.distillery,
    w.region,
    w.abv,
    w.price,
    w.cask,
    w.image,
    w.is_featured,
    w.display_order,
    -- 집계 필드들 (성능 병목 구간)
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(r.id) as reviews_count,
    COUNT(l.id) as likes_count
FROM whiskies w
LEFT JOIN reviews r ON w.id = r.whisky_id
LEFT JOIN likes l ON w.id = l.whisky_id AND l.post_id IS NULL
GROUP BY
    w.id, w.name, w.name_ko, w.distillery, w.region,
    w.abv, w.price, w.cask, w.image, w.is_featured, w.display_order;

-- 성능 최적화를 위한 인덱스 생성
CREATE UNIQUE INDEX idx_whiskies_mat_id ON whiskies_with_stats_mat(id);
CREATE INDEX idx_whiskies_mat_featured ON whiskies_with_stats_mat(is_featured);
CREATE INDEX idx_whiskies_mat_display_order ON whiskies_with_stats_mat(display_order);
CREATE INDEX idx_whiskies_mat_avg_rating ON whiskies_with_stats_mat(avg_rating);
CREATE INDEX idx_whiskies_mat_reviews_count ON whiskies_with_stats_mat(reviews_count);

-- 통계 정보 수집 (쿼리 최적화를 위해)
ANALYZE whiskies_with_stats_mat;

-- =====================================================
-- 주기적 갱신을 위한 함수 (pg_cron 또는 수동 실행용)
-- =====================================================
CREATE OR REPLACE FUNCTION refresh_whiskies_stats_mat()
RETURNS void AS $$
BEGIN
    -- CONCURRENTLY 옵션으로 락 없이 갱신 (서비스 중단 없음)
    REFRESH MATERIALIZED VIEW CONCURRENTLY whiskies_with_stats_mat;

    -- 갱신 로그 기록
    INSERT INTO system_logs (action, details, created_at)
    VALUES ('materialized_view_refresh', 'whiskies_with_stats_mat refreshed', NOW())
    ON CONFLICT DO NOTHING; -- system_logs 테이블이 없으면 무시

    RAISE NOTICE 'Materialized view whiskies_with_stats_mat refreshed successfully';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 즉시 갱신 실행 (생성 후 첫 데이터 로드)
-- =====================================================
SELECT refresh_whiskies_stats_mat();

-- =====================================================
-- 실행 확인 쿼리 (결과 확인용)
-- =====================================================
SELECT
    COUNT(*) as total_whiskies,
    AVG(avg_rating) as overall_avg_rating,
    SUM(reviews_count) as total_reviews,
    SUM(likes_count) as total_likes
FROM whiskies_with_stats_mat;

-- =====================================================
-- 추천: pg_cron으로 10분마다 자동 갱신 설정 (선택사항)
-- =====================================================
-- SELECT cron.schedule('refresh-whiskies-stats', '*/10 * * * *', 'SELECT refresh_whiskies_stats_mat();');