# 현재 데이터베이스 스키마 분석 - 20251110

## 실제 테이블 구조 (스키마 체크 결과)

### 1. whiskies 테이블
```sql
Columns: [
  'id',           -- Primary Key (string type, 예: 'glenfiddich-12')
  'name',         -- 위스키 이름
  'image',        -- 이미지 경로
  'distillery',   -- 증류소
  'region',       -- 지역
  'abv',          -- 도수
  'cask',         -- 캐스크 정보
  'price',        -- 가격
  'avg_rating',   -- 평균 평점 (현재 0으로 초기화됨)
  'likes',        -- 찜 수 (현재 0으로 초기화됨)
  'is_featured',  -- 추천 여부
  'display_order', -- 정렬 순서
  'name_ko'       -- 한국어 이름
]
```
**중요: slug 컬럼이 존재하지 않음. id가 slug 역할을 함**

### 2. reviews 테이블
```sql
Columns: [
  'id',        -- Primary Key
  'user_id',   -- 사용자 ID (UUID)
  'whisky_id', -- 위스키 ID (whiskies.id 참조)
  'rating',    -- 평점 (1-5)
  'note',      -- 리뷰 내용
  'created_at' -- 생성일시
]
```

### 3. likes 테이블
```sql
Columns: [
  'id',        -- Primary Key
  'user_id',   -- 사용자 ID (UUID)
  'post_id',   -- 포스트 ID (nullable)
  'created_at', -- 생성일시
  'whisky_id'  -- 위스키 ID (whiskies.id 참조)
]
```

### 4. post_likes 테이블
```sql
Columns: [
  'id',        -- Primary Key
  'user_id',   -- 사용자 ID
  'post_id',   -- 포스트 ID
  'created_at' -- 생성일시
]
```

### 5. review_likes 테이블
```sql
Columns: [
  'id',       -- Primary Key
  'review_id', -- 리뷰 ID
  'user_id'   -- 사용자 ID
]
```

## 현재 데이터 현황

### 테이블별 레코드 수
- **likes**: 10건
- **post_likes**: 4건
- **review_likes**: 1건
- **whiskies**: 659건 (모든 id 고유)

### 최근 30일 likes 삽입 트렌드
```
2025-10-13: 1
2025-10-25: 1
2025-10-26: 1
2025-10-27: 1
2025-10-29: 2
2025-10-30: 3
2025-11-06: 1
```

### 중복 데이터 검사 결과
- **likes 테이블**: (user_id, whisky_id) 중복 없음
- **whiskies 테이블**: id 중복 없음 (659개 모두 고유)

## 집계 컬럼 정확성 검증

### whiskies 테이블 집계 현황
- **avg_rating**: 모든 위스키 0으로 초기화됨
- **likes**: 모든 위스키 0으로 초기화됨

### 실제 vs 저장된 데이터 비교
- 실제 likes 카운트와 whiskies.likes 컬럼 값이 일치하지 않음
- 데이터베이스 트리거나 집계 업데이트 로직이 작동하지 않고 있음

## 스토리지 상태
- 홈페이지 표시 위스키 12개 이미지 **모두 정상 접근 가능** (200 OK)
- Supabase Storage URL: `https://rigpqjrlrtabcwpqwmcw.supabase.co/storage/v1/object/public/whiskies/`

## 발견된 문제점

1. **집계 데이터 동기화 부족**: likes, avg_rating이 실제 데이터와 동기화되지 않음
2. **스키마 혼동**: 코드에서 slug를 참조하지만 실제로는 id 사용
3. **트리거/함수 부재**: 자동 집계 업데이트 로직 없음

## 권장 수정 사항

1. **Foreign Key 제약조건 추가**
   - `likes.whisky_id → whiskies.id`
   - `reviews.whisky_id → whiskies.id`

2. **집계 업데이트 트리거 생성**
   - likes 변경 시 whiskies.likes 자동 업데이트
   - reviews 변경 시 whiskies.avg_rating 자동 업데이트

3. **인덱스 최적화**
   - `CREATE INDEX idx_likes_whisky_id ON likes(whisky_id);`
   - `CREATE INDEX idx_reviews_whisky_id ON reviews(whisky_id);`