-- whiskies_with_stats 뷰 생성
-- 목적: 홈페이지에서 실시간 집계 데이터를 안전하게 조회하기 위한 읽기 전용 뷰

CREATE OR REPLACE VIEW whiskies_with_stats AS
SELECT
  w.id,
  w.name,
  w.image,
  w.distillery,
  w.region,
  w.abv,
  w.cask,
  w.price,
  w.is_featured,
  w.display_order,
  w.name_ko,
  -- 실시간 계산된 평균 평점 (소수점 2자리까지 계산, 표시는 1자리)
  COALESCE(ROUND(AVG(r.rating::numeric), 2), 0) AS avg_rating,
  -- 리뷰 개수
  COUNT(r.id) AS reviews_count,
  -- 찜 개수
  COUNT(l.id) AS likes_count
FROM whiskies w
LEFT JOIN reviews r ON r.whisky_id = w.id
LEFT JOIN likes l ON l.whisky_id = w.id
GROUP BY
  w.id, w.name, w.image, w.distillery, w.region, w.abv,
  w.cask, w.price, w.is_featured, w.display_order, w.name_ko
ORDER BY w.name;