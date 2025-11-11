-- 안전 집계 뷰 업데이트 (is_featured, display_order 포함)
-- Supabase SQL Editor에서 실행하세요

create or replace view public.whiskies_with_stats as
with r as (
  select
    whisky_id,
    round(avg(rating)::numeric, 1) as avg_rating,
    count(*)::int                  as reviews_count
  from public.reviews
  group by whisky_id
),
l as (
  select
    whisky_id,
    count(*)::int as likes_count
  from public.likes
  where post_id is null
  group by whisky_id
)
select
  w.id,
  w.name,
  w.name_ko,
  w.image,
  w.distillery,
  w.region,
  w.abv,
  w.cask,
  w.price,
  w.is_featured,         -- ✅ 추천
  w.display_order,       -- ✅ 정렬
  coalesce(r.avg_rating, 0)::numeric(3,1) as avg_rating,
  coalesce(r.reviews_count, 0)             as reviews_count,
  coalesce(l.likes_count, 0)               as likes_count
from public.whiskies w
left join r on r.whisky_id = w.id
left join l on l.whisky_id = w.id;