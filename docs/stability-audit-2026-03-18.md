# Maltlog 정합성 복구 및 안정화 분석

작성일: 2026-03-18
목적: 새 기능 개발이 아니라 **데이터/코드/운영 구조를 다시 신뢰할 수 있게 만드는 것**
범위: 코드 수정 없이, 실제 코드 경로 기준으로 현재 데이터 흐름과 충돌 지점을 추적

---

## 현재 구조

### 1. 데이터 소스별 현재 역할과 읽기/갱신 경로

#### A. `whiskies`
- 역할: 위스키 원본 메타데이터 테이블
- 실제 컬럼(문서 기준): `id`, `name`, `image`, `distillery`, `region`, `abv`, `cask`, `price`, `avg_rating`, `likes`, `is_featured`, `display_order`, `name_ko`
- 읽는 곳:
  - `app/whisky/[id]/page.tsx` → 상세 페이지 원본 데이터 조회
  - `lib/whiskyReviews.ts` → 리뷰 목록과 별개로 위스키 정보 일괄 조회 시 사용
  - `app/admin/images/page.tsx`, `lib/whiskyManager.ts`, `lib/whiskyImageStorage.ts` → 관리/이미지 용도
- 갱신하는 곳:
  - `lib/likes.ts` → fallback 경로에서 `whiskies.likes` 직접 업데이트
  - 관리용 코드/스크립트에서 이미지/메타데이터 갱신 흔적 존재
- 비고:
  - 상세 페이지는 원본 `whiskies`를 읽고, 홈은 materialized view를 읽는다. 읽기 경로가 분리되어 있다.

#### B. `reviews`
- 역할: 위스키 리뷰 원본 테이블
- 읽는 곳:
  - `app/whisky/[id]/page.tsx` → 상세 페이지 초기 리뷰 로딩
  - `components/WhiskyDetailClient.tsx` → 리뷰 refresh / pagination / 사용자 리뷰 확인
  - `lib/whiskyReviews.ts` → 사용자 리뷰 CRUD
  - `app/api/profile/summary/route.ts` → 사용자 평균 평점 계산용
  - `app/api/profile/reviews/route.ts` → 프로필 리뷰 목록 API
  - `app/api/profile/first-reviewed/route.ts`
  - `sql/create_materialized_view.sql`, `database_view_update.sql` → 평균 평점/리뷰 수 집계 원본
- 갱신하는 곳:
  - `lib/whiskyReviews.ts` → `upsert`, `delete`
  - `components/WhiskyDetailClient.tsx` → `saveWhiskyReview()`를 통해 간접 갱신
  - `lib/reviewActions.ts` → 리뷰 삭제
- 비고:
  - 평균 평점은 UI 일부에서 `reviews`로 계산하고, 다른 곳은 `avg_rating` 또는 materialized view를 사용한다.

#### C. `likes`
- 역할: **위스키 좋아요 원본 이벤트 테이블** (`post_id is null` 조건으로 위스키 좋아요 구분)
- 읽는 곳:
  - `lib/likes.ts` → 좋아요 여부/목록/카운트 조회
  - `lib/server/getLikedWhiskyIdsServer.ts` → 홈 초기 hydration용 사용자 좋아요 목록
  - `sql/create_materialized_view.sql`, `database_view_update.sql` → `likes_count` 집계 원본
- 갱신하는 곳:
  - `lib/likes.ts` → insert / delete
- 비고:
  - `likes` 자체는 원본 이벤트 테이블처럼 쓰고 있지만, 동일 파일에서 `whiskies.likes`도 직접 갱신하려고 한다.

#### D. `posts`
- 역할: 커뮤니티 게시글 원본 테이블
- 읽는 곳:
  - `lib/communityPosts.ts` → 목록/상세/검색/유저 게시글/카운트
  - `app/community/post/[id]/page.tsx` → 상세 페이지 초기 로딩
  - `app/api/community/latest/route.ts` → 홈 커뮤니티 미리보기
  - `app/api/profile/summary/route.ts` → 사용자 게시글 수 집계
  - `components/PostDetailClient.tsx` → 게시글 삭제 직접 수행
- 갱신하는 곳:
  - `lib/communityPosts.ts` → 생성/수정/삭제, `likes_count`, `comments_count` 직접 업데이트
  - `components/PostDetailClient.tsx` → 게시글 delete 직접 호출
- 비고:
  - 게시글 자체는 `posts`가 원본으로 비교적 명확하지만, likes/comments 집계는 별도 경로가 섞여 있다.

#### E. `post_likes`
- 역할: 게시글 좋아요 원본 이벤트 테이블
- 읽는 곳:
  - `lib/postActions.ts` → 개별 여부, 개수, 다중 상태 확인
- 갱신하는 곳:
  - `lib/postActions.ts` → insert / delete
- 비고:
  - 게시글 좋아요의 원본 이벤트는 여기지만, 화면은 종종 `posts.likes_count`를 바로 신뢰한다.

#### F. `whiskies_with_stats_mat`
- 역할: 위스키 목록용 materialized view
- 정의 위치:
  - `sql/create_materialized_view.sql`
- 읽는 곳:
  - `app/api/whiskies/route.ts` → 홈/목록의 사실상 핵심 데이터 소스
- 갱신하는 곳:
  - 정의상 `refresh_whiskies_stats_mat()` 함수로 갱신하도록 설계됨
  - `sql/create_materialized_view.sql` 마지막에 최초 refresh 수행
  - `pg_cron` 10분 주기 추천 주석 존재하나, 실제 운영 연결 여부는 코드상 확인 불가
- 비고:
  - 홈 데이터 로딩은 이 뷰를 전제로 움직인다. 즉 운영상 핵심 데이터 소스일 가능성이 높다.

#### G. `posts.likes_count`
- 역할: 게시글 좋아요 캐시 컬럼
- 읽는 곳:
  - `lib/communityPosts.ts` → 목록/상세 변환 시 `post.likes_count`
  - `components/PostDetailClient.tsx` → 초기 `post.likes_count` 사용
  - `components/ProfilePageClient.tsx`
- 갱신하는 곳:
  - `lib/communityPosts.ts` → `updatePostLikesCount(postId, newCount)`
  - `lib/postActions.ts` → `updatePostLikesCount(postId)`가 `post_likes` count를 읽어 직접 반영
  - SQL 파일 `database_fix.sql`, `database_fix 2.sql`, `supabase-migration.sql` 에 트리거/함수 정의 흔적 존재
- 비고:
  - 코드상 “존재한다고 가정하는 경로”와 “없다고 가정하는 경로”가 동시에 존재한다.

#### H. `whiskies.likes`
- 역할: 위스키 좋아요 캐시 컬럼처럼 사용되려 했던 흔적
- 읽는 곳:
  - 앱 본체에서 핵심 읽기 경로로는 거의 사용되지 않음
  - 문서/스크립트에서 존재 확인
- 갱신하는 곳:
  - `lib/likes.ts` fallback에서 직접 갱신
- 비고:
  - 홈/API/UI의 주력 통계 필드는 `likes_count` 쪽이다. 따라서 `whiskies.likes`는 현재 설계상 반쯤 고립된 컬럼이다.

#### I. `whiskies.avg_rating`
- 역할: 위스키 평균 평점 캐시 컬럼처럼 사용되려 했던 흔적
- 읽는 곳:
  - 일부 컴포넌트가 `avg_rating` 필드를 기대하지만, 홈에서는 materialized view의 `avg_rating`을 받음
  - 문서에서 실제 `whiskies.avg_rating`이 모두 0이라고 기록됨
- 갱신하는 곳:
  - 현재 코드에서 직접 갱신 경로 확인되지 않음
  - SQL/문서상 트리거 필요성이 언급됨
- 비고:
  - 현재 운영에서 신뢰 가능한 단일 진실로 보기 어렵다.

---

### 2. 주요 화면별 실제 읽기 구조

#### 홈 (`app/page.tsx` → `app/api/whiskies/route.ts` → `components/HomePageClient.tsx`)
- 위스키 목록: `whiskies_with_stats_mat`
- 사용자 찜 상태: `lib/server/getLikedWhiskyIdsServer.ts`에서 `likes`
- 화면 렌더링 값:
  - 좋아요 수: `likes_count`
  - 평균 평점: `avg_rating`
- 특징:
  - 홈은 **원본 테이블이 아니라 materialized view 기반**
  - 사용자별 좋아요 여부는 별도로 `likes`에서 읽음

#### 위스키 상세 (`app/whisky/[id]/page.tsx` → `components/WhiskyDetailClient.tsx`)
- 위스키 메타: `whiskies`
- 리뷰 목록: `reviews`
- 위스키 찜 여부: `likes` (`lib/likes.ts`)
- 리뷰 좋아요: `review_likes`
- 평균 평점 표시: 클라이언트에서 `reviews` 배열 평균 계산
- 특징:
  - 상세 페이지는 materialized view를 사용하지 않음
  - 홈과 상세가 같은 통계를 서로 다른 데이터 소스에서 계산/표시할 수 있다.

#### 커뮤니티 목록/상세
- 게시글 목록: `posts` (`lib/communityPosts.ts`)
- 최신 게시글 API: `posts` (`app/api/community/latest/route.ts`)
- 게시글 좋아요 상태/개수: `post_likes` (`lib/postActions.ts`)
- 게시글 상세 페이지 초기 likes_count: `app/community/post/[id]/page.tsx`에서 **0으로 하드코딩**
- 특징:
  - `posts.likes_count`가 존재한다고 가정하는 코드와, 없다고 가정해 0을 넣는 코드가 공존한다.

---

## 문제 지점

### 1. 위스키 좋아요 수의 단일 진실(source of truth)은 지금 무엇인가?

**원본 이벤트 기준으로는 `likes` 테이블이다.**

근거:
- `lib/likes.ts`의 좋아요 insert/delete가 `likes`에 대해 수행됨
- `lib/server/getLikedWhiskyIdsServer.ts`도 `likes`를 읽음
- `sql/create_materialized_view.sql`도 `likes`를 집계 원본으로 사용

하지만 **화면 표시 기준의 단일 진실은 아니다.**
- 홈은 `whiskies_with_stats_mat.likes_count`
- fallback 로직은 `whiskies.likes`를 직접 갱신
- 일부 코드는 `likes_count`, 일부는 `likes` 컬럼 체계를 전제

즉 정리하면:
- **원본 사실(source event)**: `likes`
- **현재 운영 표시에 많이 쓰이는 값**: `whiskies_with_stats_mat.likes_count`
- **충돌 유발 캐시 컬럼**: `whiskies.likes`

### 2. 평균 평점의 단일 진실(source of truth)은 지금 무엇인가?

**원본 이벤트 기준으로는 `reviews.rating` 집계값이다.**

근거:
- 상세 페이지는 `reviews`를 직접 읽고 클라이언트에서 평균 계산
- materialized view는 `AVG(r.rating)`으로 `avg_rating` 생성
- `app/api/profile/summary/route.ts`도 `reviews`를 읽어 평균 계산

하지만 현재 코드베이스 전체 기준 단일 진실은 아니다.
- 홈: `whiskies_with_stats_mat.avg_rating`
- 상세: `reviews` 배열 직접 평균
- 문서상 `whiskies.avg_rating`은 동기화 안 된 상태

즉 정리하면:
- **원본 사실(source event)**: `reviews`
- **홈/목록 통계 소스**: `whiskies_with_stats_mat.avg_rating`
- **신뢰하기 어려운 캐시 컬럼**: `whiskies.avg_rating`

### 3. materialized view가 실제 운영에서 핵심 데이터 소스인지 아닌지

**홈/목록 기준으로는 핵심 데이터 소스다.**

근거:
- `app/api/whiskies/route.ts`가 직접 `whiskies_with_stats_mat`를 읽음
- `app/page.tsx`는 이 API를 통해 홈 초기 데이터를 받음
- `components/HomePageClient.tsx`는 이 응답의 `avg_rating`, `likes_count`, `reviews_count`를 사용함

단, 전체 앱 기준 단일 핵심 데이터 소스는 아니다.
- 상세 페이지는 원본 테이블(`whiskies`, `reviews`)을 사용
- 프로필 API도 원본 테이블을 사용
- 따라서 앱 전체는 **view 중심 아키텍처로 완전히 통일되지 않았다**

### 4. stale data가 생길 수 있는 경로

#### 경로 1. `likes`/`reviews`는 바뀌었는데 `whiskies_with_stats_mat` refresh가 늦는 경우
- 홈은 stale한 `likes_count`, `avg_rating`을 볼 수 있음
- 상세는 더 최신 `reviews`를 볼 수 있음
- 결과: 홈과 상세 숫자가 어긋날 수 있음

#### 경로 2. `lib/likes.ts`가 `whiskies.likes`를 직접 갱신하지만 홈은 materialized view를 읽는 경우
- `whiskies.likes`는 바뀌어도 홈 `likes_count`는 refresh 전까지 안 바뀔 수 있음
- 결과: 직접 컬럼 업데이트가 실제 사용자 화면에 즉시 반영되지 않을 수 있음

#### 경로 3. 게시글 상세가 `likes_count: 0`으로 초기화되는 경우
- `app/community/post/[id]/page.tsx`는 `posts.likes_count`를 읽지 않고 0으로 주입
- 클라이언트에서 `getPostLikesCount()`로 다시 맞춰지기 전까지 초기값 불일치 가능

#### 경로 4. `posts.likes_count`를 어떤 곳은 신뢰하고 어떤 곳은 버리는 경우
- `lib/communityPosts.ts`는 `posts.likes_count`를 표시값으로 사용
- `app/api/community/latest/route.ts`는 `likes: 0`을 반환
- 결과: 목록/상세/미리보기 간 숫자 일관성 붕괴 가능

### 5. 직접 컬럼 업데이트와 view 기반 집계가 충돌하는 지점

#### 충돌 1. `lib/likes.ts` vs `app/api/whiskies/route.ts`
- `lib/likes.ts`는 `whiskies.likes`를 직접 업데이트하려 함
- `app/api/whiskies/route.ts`는 `whiskies_with_stats_mat.likes_count`를 읽음
- 즉 업데이트 대상과 읽기 대상이 다르다

#### 충돌 2. `whiskies.avg_rating` vs `reviews` 기반 집계
- 문서상 `whiskies.avg_rating`은 동기화되지 않음
- 홈은 materialized view, 상세는 `reviews` 직접 평균
- 캐시 컬럼을 유지해도 실제 표시 경로가 다르면 의미가 약함

#### 충돌 3. `posts.likes_count` 직접 업데이트 vs `post_likes` 실시간 count 조회
- `lib/postActions.ts`는 `post_likes` count를 따로 읽을 수 있음
- `lib/communityPosts.ts`는 `posts.likes_count`를 사용
- `app/community/post/[id]/page.tsx`는 아예 0으로 초기화
- 읽기 경로가 3개로 갈라져 있다

### 6. 홈 데이터 로딩 구조 자체의 위험점

#### 파일: `app/page.tsx`
- 서버 컴포넌트가 내부 API `/api/whiskies`를 다시 호출함
- production에서는 `https://maltlog.kr/api/whiskies`, development에서는 `http://localhost:3000/api/whiskies`
- 서버 컴포넌트에서 직접 DB를 읽지 않고 HTTP를 한번 더 타므로 장애 지점이 추가된다

#### 파일: `app/api/whiskies/route.ts`
- `whiskies_with_stats_mat`를 읽은 뒤 JS에서 다시 정렬/페이지네이션
- `fetchLimit = Math.max(limit * 3, 200)`로 과하게 가져와 메모리에서 처리
- 데이터가 stale하면 홈 전체가 stale해짐
- view refresh 보장이 없으면 사용자가 구조적으로 오래된 숫자를 볼 수 있다

---

## 권장 단일 구조

### 1. 위스키 도메인

#### 권장 단일 진실
- **원본 이벤트**
  - 좋아요: `likes` (`post_id is null`)
  - 평점/리뷰: `reviews`
- **목록/홈 표시 통계 단일 소스**
  - `whiskies_with_stats_mat`
- **상세 메타 단일 소스**
  - `whiskies`

#### 핵심 원칙
- 클라이언트/프론트 로직은 `whiskies.likes`, `whiskies.avg_rating`를 직접 갱신하지 않는다
- `whiskies.likes`, `whiskies.avg_rating`는
  - 완전히 폐기하거나
  - 운영상 더 이상 읽지 않는 legacy 컬럼으로 격리한다
- 홈/목록 숫자는 `whiskies_with_stats_mat`만 사용
- 상세에서도 가능하면 장기적으로 같은 통계 source를 공유하거나, 최소한 왜 다를 수 있는지 설계를 문서화한다

### 2. 커뮤니티 도메인

#### 권장 단일 진실
- 게시글 좋아요 원본: `post_likes`
- 게시글 목록/상세의 좋아요 표시값:
  - 선택 1: `post_likes` 집계 view / RPC / query
  - 선택 2: `posts.likes_count`를 유지하되, **모든 읽기 경로가 이 컬럼만 쓰고 모든 갱신 경로가 하나로 통일**

#### 현재 상황에 맞는 실용적 권장안
- 당장은 `post_likes`를 원본으로 보고
- `posts.likes_count`를 유지하려면 DB 트리거 기반으로만 갱신
- 애플리케이션 코드에서 수동 update를 여러 군데 두지 않는다

### 3. 운영 refresh 원칙
- `whiskies_with_stats_mat`가 홈 핵심 소스라면 refresh 전략을 운영 문서에 명시해야 한다
- 최소 문서화 필요 항목:
  - refresh 주기
  - 수동 refresh 명령
  - stale 허용 범위
  - 홈과 상세의 숫자 일시 불일치 가능성 여부

---

## 1차 수정 대상 파일

아래는 **지금 당장 고쳐야 하는 파일 Top 10**이며, 위험도 높은 순서대로 정리했다.

### 1. `lib/likes.ts`
- 위험도: 매우 높음
- 이유:
  - 위스키 좋아요 원본(`likes`)과 캐시 컬럼(`whiskies.likes`)을 한 파일에서 동시에 다룸
  - fallback 직접 업데이트가 현재 홈의 실제 읽기 소스(`whiskies_with_stats_mat.likes_count`)와 어긋남
  - 정합성 붕괴의 핵심 파일

### 2. `app/api/whiskies/route.ts`
- 위험도: 매우 높음
- 이유:
  - 홈/목록의 사실상 핵심 데이터 소스
  - `whiskies_with_stats_mat` 의존이 강함
  - stale view 문제, JS 메모리 정렬/페이지네이션, 데이터 소스 문서화 부족이 모두 집중됨

### 3. `app/page.tsx`
- 위험도: 높음
- 이유:
  - 서버 컴포넌트가 내부 API를 다시 호출하는 구조
  - 홈 장애/지연/환경 의존성을 키움
  - 데이터 신뢰성과 운영 단순성을 해침

### 4. `components/HomePageClient.tsx`
- 위험도: 높음
- 이유:
  - `likes_count`, `avg_rating`, 호환 별칭(`avgRating`, `totalReviews`)을 혼용
  - 위스키 카드의 사용자 체감 통계값이 여기서 최종 소비됨
  - 소스 정리가 안 되면 표시값 일관성 문제 발생

### 5. `components/WhiskyDetailClient.tsx`
- 위험도: 높음
- 이유:
  - 상세 페이지가 `reviews` 직접 계산과 `likes` 직접 토글을 섞음
  - 홈과 다른 통계 계산 체계 사용
  - 사용자에게 가장 눈에 띄는 숫자 불일치가 생길 수 있는 지점

### 6. `lib/whiskyReviews.ts`
- 위험도: 높음
- 이유:
  - 리뷰 저장/삭제의 핵심 mutation 레이어
  - 평균 평점/리뷰 수 정합성은 이 파일의 변경 이벤트와 직접 연결됨
  - 집계 refresh 설계와 함께 묶어서 봐야 함

### 7. `app/whisky/[id]/page.tsx`
- 위험도: 중상
- 이유:
  - 상세 페이지가 `whiskies` + `reviews`를 직접 읽음
  - 홈과 다른 읽기 구조를 갖는 대표 경로
  - “왜 홈 숫자와 상세 숫자가 다르지?” 문제의 핵심 원인 후보

### 8. `lib/postActions.ts`
- 위험도: 중상
- 이유:
  - `post_likes` 원본과 `posts.likes_count` 직접 업데이트 로직이 함께 존재
  - 커뮤니티 좋아요 정합성의 핵심 충돌 지점

### 9. `lib/communityPosts.ts`
- 위험도: 중상
- 이유:
  - 커뮤니티 목록/검색/상세 변환의 핵심 read layer
  - `posts.likes_count`, `comments_count`를 신뢰하는 구조
  - 원본과 캐시의 경계가 불분명함

### 10. `app/community/post/[id]/page.tsx`
- 위험도: 중상
- 이유:
  - `likes_count: 0`을 하드코딩 주입
  - comments도 존재 불확실성을 전제로 우회 처리
  - 상세 초기 데이터 정합성을 의도적으로 희생하고 있음

---

## 수정 순서

### 단계 1. source of truth 결정 문서 확정
1. 위스키 좋아요 원본 = `likes`
2. 위스키 평점 원본 = `reviews`
3. 홈/목록 통계 소스 = `whiskies_with_stats_mat`
4. `whiskies.likes`, `whiskies.avg_rating`는 legacy 취급 여부 결정
5. 커뮤니티 좋아요 원본 = `post_likes`
6. `posts.likes_count` 유지 여부 결정

### 단계 2. 읽기 경로 단일화
1. 홈/목록은 `whiskies_with_stats_mat` 기준으로 문서화
2. 상세가 원본 테이블을 계속 읽을지, 통계만 별도 공유할지 결정
3. 커뮤니티 미리보기/목록/상세의 likes_count 정책 통일

### 단계 3. 쓰기 경로 단일화
1. `lib/likes.ts`에서 `whiskies.likes` 직접 갱신 제거 설계
2. 리뷰 저장/삭제 후 통계 반영 전략 수립
3. `post_likes` → `posts.likes_count` 갱신 경로를 DB 또는 단일 함수로 수렴

### 단계 4. 운영 설계 명문화
1. materialized view refresh 전략 정의
2. stale 허용 범위 정의
3. 장애 시 수동 복구 절차 문서화

### 단계 5. 구현 전 검증 체크리스트 작성
1. 홈과 상세 좋아요/평점 일치 여부
2. 리뷰 추가 직후 반영 시차 허용 기준
3. 게시글 좋아요 목록/상세/미리보기 일치 여부
4. 프로필 통계와 상세 데이터 일치 여부

---

## 핵심 결론

### 결론 1
**위스키 좋아요와 평균 평점의 원본 단일 진실은 각각 `likes`, `reviews`다.**
다만 현재 앱이 실제로 사용자에게 보여주는 값은 materialized view, 직접 계산, 캐시 컬럼이 섞여 있어 단일 구조가 아니다.

### 결론 2
**`whiskies_with_stats_mat`는 홈/목록 기준 핵심 데이터 소스다.**
하지만 상세/프로필/기타 경로가 이를 따르지 않으므로 앱 전체 기준으로는 아직 반쪽짜리 중심축이다.

### 결론 3
**정합성 충돌의 최중심은 `lib/likes.ts` 와 `app/api/whiskies/route.ts` 사이의 불일치다.**
하나는 원본 이벤트 + 캐시 컬럼 직접 갱신을 시도하고, 다른 하나는 materialized view를 읽는다.

### 결론 4
커뮤니티 영역도 동일한 문제가 축소판으로 존재한다.
- 원본: `post_likes`
- 캐시: `posts.likes_count`
- 일부 화면: 0 하드코딩

### 결론 5
지금 이 프로젝트는 새 기능 개발보다 **읽기 경로 단일화 → 쓰기 경로 단일화 → refresh/운영 정책 문서화**가 먼저다.

---

## Supabase 접근 가능 범위에 대한 명확한 답

### 내가 할 수 없는 것
- 민기씨 브라우저에 열린 Supabase Dashboard를 직접 조작할 수는 없다.
- 대시보드 UI 버튼 클릭, SQL Editor 직접 입력, 테이블 편집기 조작은 현재 불가하다.

### 내가 할 수 있는 것
- 프로젝트 코드가 가진 Supabase 연결 코드 분석
- 로컬 환경변수/스크립트/SQL 파일 기준으로 접근 구조 점검
- 필요하면 로컬에서 **코드나 CLI를 통해 접근 가능한 범위인지** 확인
- 민기씨가 허용하면, 프로젝트 환경변수를 사용해 실제 질의/검증을 시도할 수도 있다

즉, **대시보드 조작 권한은 없지만, 로컬 프로젝트가 이미 가지고 있는 자격정보와 실행 환경이 있다면 기술적으로 접근 가능한 범위는 따로 확인할 수 있다.**
