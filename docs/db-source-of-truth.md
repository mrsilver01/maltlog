# DB Source of Truth

이 문서는 Maltlog의 데이터 정합성 기준을 짧고 명확하게 고정하기 위한 문서다.

## 원칙

- 원본 이벤트 테이블을 **단일 진실(Source of Truth)** 로 본다.
- 캐시 컬럼이나 뷰를 직접 수동 갱신하는 방식은 지양한다.
- 화면 표시 경로가 여러 개일 때는, 원본과 어긋나지 않도록 읽기 경로를 맞춘다.

---

## 1. 위스키 좋아요

- **원본 테이블:** `likes`
- 위스키 좋아요는 `likes` 테이블의 `post_id IS NULL` 행으로 판단한다.
- 앱 로직은 좋아요/취소 시 `likes`에만 insert/delete 해야 한다.
- `whiskies.likes` 같은 캐시성 컬럼을 앱에서 직접 증감/재계산하지 않는다.

정리:
- Source of Truth: `likes`
- 직접 갱신 금지: `whiskies.likes`

---

## 2. 위스키 평점

- **원본 테이블:** `reviews`
- 평점의 진짜 기준은 `reviews.rating` 집계다.
- 홈/목록은 기본적으로 `whiskies_with_stats_mat`를 읽는 구조를 유지한다.
- 다만 평점 정합성은 `reviews` 원본 기준으로 맞춰야 하며, stale 집계값을 그대로 신뢰하지 않는다.
- 상세 페이지는 `reviews` 원본 기준으로 평점을 계산하는 것이 맞다.

정리:
- Source of Truth: `reviews`
- 홈/목록 row source: `whiskies_with_stats_mat`
- 상세 평점 기준: `reviews`

---

## 3. 커뮤니티 좋아요

- **원본 테이블:** `post_likes`
- 게시글 좋아요/취소는 `post_likes`에만 insert/delete 해야 한다.
- `posts.likes_count` 하드코딩은 제거했다.
- `posts.likes_count`를 앱 로직에서 직접 갱신하는 수동 fallback/update 함수는 제거했다.

정리:
- Source of Truth: `post_likes`
- 직접 갱신 금지: `posts.likes_count`
- 0 하드코딩 제거 완료

---

## 운영 메모

- materialized view나 캐시 컬럼은 읽기 최적화 레이어일 뿐, 원본 이벤트를 대체하지 않는다.
- 이후 정합성 문제가 다시 생기면 먼저 원본 테이블과 캐시/뷰를 비교해 stale 여부를 확인한다.
