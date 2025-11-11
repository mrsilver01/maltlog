# 시니어 참고용 - DB 현황 및 에러 원인 분석

## SQL 에러 원인 분석

### 에러 1: `column w.slug does not exist`
**원인**: whiskies 테이블에 `slug` 컬럼이 존재하지 않음
**실제 구조**: `id` 컬럼이 slug 역할을 함 (예: 'glenfiddich-12')

### 에러 2: `duplicate key value violates unique constraint "whiskies_slug_key"`
**원인**: slug 컬럼을 추가하려는 시도가 있었으나 중복 데이터로 인해 실패
**현재 상태**: slug 컬럼 없음, id만 존재

## 실제 테이블 구조 (확인됨)

### whiskies 테이블
```
Primary Key: id (string, 659개 모두 고유)
Columns: id, name, image, distillery, region, abv, cask, price,
         avg_rating, likes, is_featured, display_order, name_ko
```

### reviews 테이블
```
Columns: id, user_id, whisky_id, rating, note, created_at
관계: reviews.whisky_id → whiskies.id
```

### likes 테이블
```
Columns: id, user_id, post_id, created_at, whisky_id
관계: likes.whisky_id → whiskies.id
현재 데이터: 10건, 중복 없음
```

## 올바른 JOIN 쿼리 (slug → id 변경 필요)

```sql
-- 에러나는 쿼리
SELECT w.name, COUNT(r.id) as review_count
FROM whiskies w
LEFT JOIN reviews r ON r.whisky_id = w.slug  -- ❌ slug 없음

-- 올바른 쿼리
SELECT w.name, COUNT(r.id) as review_count
FROM whiskies w
LEFT JOIN reviews r ON r.whisky_id = w.id   -- ✅ id 사용
GROUP BY w.id, w.name;
```

## 집계 데이터 동기화 문제

### 현재 상태
- **whiskies.likes**: 모두 0 (동기화 안됨)
- **whiskies.avg_rating**: 모두 0 (동기화 안됨)
- **실제 likes**: 10건 존재
- **실제 reviews**: 다수 존재

### 필요 작업
1. 집계 업데이트 트리거 생성
2. 기존 데이터 재계산
3. FK 제약조건 추가

## 현재 작동하는 쿼리 예시

```sql
-- 위스키별 찜 수 실제 계산
SELECT w.name, COUNT(l.id) as actual_likes
FROM whiskies w
LEFT JOIN likes l ON l.whisky_id = w.id
GROUP BY w.id, w.name
ORDER BY actual_likes DESC;

-- 위스키별 리뷰 수 및 평균 평점
SELECT w.name,
       COUNT(r.id) as review_count,
       COALESCE(AVG(r.rating::numeric), 0) as avg_rating
FROM whiskies w
LEFT JOIN reviews r ON r.whisky_id = w.id
GROUP BY w.id, w.name
ORDER BY review_count DESC;
```

## Storage 상태
- 홈페이지 이미지 12개 모두 정상 (200 OK)
- 경로: `/storage/v1/object/public/whiskies/`

## 권장 즉시 조치
1. **slug 참조 코드 모두 id로 변경**
2. **집계 함수/트리거 생성 후 데이터 동기화**
3. **FK 제약조건 추가로 데이터 무결성 보장**