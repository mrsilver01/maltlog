-- 자동 추천 위스키 설정 (Supabase SQL Editor에서 실행)
-- 상위 평점 + 리뷰 많은 위스키들을 is_featured=true로 설정

-- 1단계: 모든 위스키 추천 해제
UPDATE public.whiskies SET is_featured = false, display_order = null;

-- 2단계: 상위 평점 위스키 8개를 자동 추천으로 설정
WITH top_whiskies AS (
  SELECT
    w.id,
    w.name,
    COALESCE(r.avg_rating, 0) as rating,
    COALESCE(r.reviews_count, 0) as review_count,
    ROW_NUMBER() OVER (
      ORDER BY
        COALESCE(r.avg_rating, 0) DESC,
        COALESCE(r.reviews_count, 0) DESC,
        w.name ASC
    ) as rank
  FROM public.whiskies w
  LEFT JOIN (
    SELECT
      whisky_id,
      ROUND(AVG(rating)::numeric, 1) as avg_rating,
      COUNT(*) as reviews_count
    FROM public.reviews
    GROUP BY whisky_id
  ) r ON r.whisky_id = w.id
  WHERE w.image IS NOT NULL  -- 이미지 있는 것만
  ORDER BY rating DESC, review_count DESC
  LIMIT 8
)
UPDATE public.whiskies
SET
  is_featured = true,
  display_order = tw.rank
FROM top_whiskies tw
WHERE whiskies.id = tw.id;

-- 확인 쿼리
SELECT
  w.name,
  w.is_featured,
  w.display_order,
  COALESCE(r.avg_rating, 0) as rating,
  COALESCE(r.reviews_count, 0) as reviews
FROM public.whiskies w
LEFT JOIN (
  SELECT
    whisky_id,
    ROUND(AVG(rating)::numeric, 1) as avg_rating,
    COUNT(*) as reviews_count
  FROM public.reviews
  GROUP BY whisky_id
) r ON r.whisky_id = w.id
WHERE w.is_featured = true
ORDER BY w.display_order;