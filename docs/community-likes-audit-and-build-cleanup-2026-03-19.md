# Build 캐시 청소 + Community Likes 정합성 감사/수정 보고서

작성일: 2026-03-19
브랜치: `fix/community-likes-consistency`
범위: **빌드 캐시 청소 + 커뮤니티 게시글 좋아요 경로만**
제외: whiskies 재수정, DB migration, 대규모 UI 수정

---

## 1. 빌드 테스트 결과

### 수행 내용
- `.next` 폴더 완전 삭제
- 그 뒤 `npm run build` 재실행

### 결과
- **빌드 성공 (exit code 0)**
- 따라서 앞선 Turbopack build hang은 현재 코드 무한루프보다는 **캐시 꼬임**으로 보는 게 맞다

### 빌드 중 관찰된 로그
- `DYNAMIC_SERVER_USAGE` 관련 로그가 출력되긴 했음
- 하지만 최종적으로 Next build는 성공했고 산출물도 정상 생성됨
- 즉 이번 턴 기준 결론은:
  - **배포 차단 수준의 build failure는 재현되지 않음**
  - **캐시 청소로 정상화됨**

---

## 2. 커뮤니티 좋아요 정합성 감사

실DB 기준으로 아래를 직접 비교했다.

- `posts.likes_count`
- `post_likes` 실제 count

### 실제 결과
- 총 posts: 2건
- 총 post_likes: 4건
- **불일치 건수: 0건**

즉, 현재 시점 데이터 자체는 맞다.

### 하지만 코드상 남아 있던 위험요소

DB 값은 맞았지만, 앱 코드에는 아래 위험이 남아 있었다.

1. `lib/postActions.ts`
- `post_likes` insert/delete 외에
- `posts.likes_count`를 다시 계산해 직접 update하는 함수가 남아 있었음

2. `lib/communityPosts.ts`
- `posts.likes_count`를 직접 update하는 헬퍼가 남아 있었음

3. 일부 읽기 경로
- `app/community/post/[id]/page.tsx`에서 `likes_count: 0` 하드코딩
- `app/api/community/latest/route.ts`에서 `likes: 0` 하드코딩

즉 구조상 문제는 이거였다.
- **원본은 `post_likes`인데, 코드에는 `posts.likes_count` 수동 갱신 흔적과 0 하드코딩이 동시에 남아 있었음**
- 지금은 우연히 데이터가 맞아도, 이후 다시 꼬일 수 있는 상태였음

---

## 3. Source of Truth 결론

### 커뮤니티 게시글 좋아요의 단일 진실
- **`post_likes` 테이블**

### 이번 턴 결론
- mutation 경로는 `post_likes` insert/delete만 남겨야 함
- `posts.likes_count` 직접 update 함수는 제거 대상
- 읽기 경로에서 0 하드코딩은 제거해야 함

`posts.likes_count`는 이번 점검 시점에서 실제 count와 일치했지만,
**원본 단일 진실로 보기는 어렵고 캐시/보조 집계 컬럼 성격**으로 보는 편이 안전하다.

---

## 4. 최소 범위 수정 내용

### 수정 파일 목록
1. `lib/postActions.ts`
2. `lib/communityPosts.ts`
3. `app/api/community/latest/route.ts`
4. `app/community/post/[id]/page.tsx`

### 각 파일 변경 이유

#### `lib/postActions.ts`
- `posts.likes_count` 직접 업데이트 함수 제거
- 게시글 좋아요 mutation이 `post_likes`만 건드리도록 경로 단순화

#### `lib/communityPosts.ts`
- `posts.likes_count` 직접 update 헬퍼 제거
- 커뮤니티 도메인에서 수동 카운트 갱신 경로 제거

#### `app/api/community/latest/route.ts`
- 기존 `likes: 0`, `comments: 0` 하드코딩 제거
- preview API가 실제 컬럼값을 반환하도록 수정

#### `app/community/post/[id]/page.tsx`
- 상세 페이지 서버 로드 시 `likes_count`를 select에 포함
- 기존 `likes_count: 0` 하드코딩 제거

---

## 5. Diff 관점 요약

### 수정 전
- 좋아요 클릭 → `post_likes` 조작
- 별도로 `posts.likes_count` 직접 갱신 함수가 코드베이스에 남아 있음
- 일부 화면/API는 좋아요 수를 0으로 하드코딩

### 수정 후
- 좋아요 mutation 경로는 `post_likes` insert/delete만 유지
- `posts.likes_count` 직접 갱신 함수 제거
- 최신 게시글 preview / 게시글 상세 서버 데이터에서 0 하드코딩 제거

---

## 6. 검증 결과

### A. 빌드
- `.next` 삭제 후 `npm run build` → **성공**

### B. lint
- 대상 파일 lint 실행 결과, 이번 수정분 외에도 기존 코드베이스의 `any` 관련 오류가 남아 있음
- 대표적으로:
  - `app/community/post/[id]/page.tsx`
  - `lib/postActions.ts`
- 이번 턴에서는 **좋아요 정합성 범위만 수정**하고, 대규모 타입 정리는 하지 않았음

### C. 화면 영향

#### 커뮤니티 목록
- 좋아요 버튼 동작 경로는 기존처럼 `post_likes` 사용
- 수동 `posts.likes_count` 갱신 의존성 제거

#### 게시글 상세
- 서버 초기값에서 더 이상 `likes_count: 0` 하드코딩하지 않음
- 클라이언트 hydration 전 초기 숫자 왜곡이 줄어듦

#### 홈의 커뮤니티 preview
- 이제 0 하드코딩 대신 실제 likes/comments 값을 사용

---

## 7. 해결된 것 / 남은 것

### 이번 수정으로 해결된 것
- 커뮤니티 좋아요 mutation 경로를 `post_likes` 기준으로 더 명확히 정리
- `posts.likes_count` 직접 update 함수 제거
- 최신 게시글 preview / 게시글 상세의 0 하드코딩 제거
- 캐시 청소 후 빌드 정상화 확인

### 남은 것
- `posts.likes_count`를 장기적으로 완전 폐기할지 여부는 후속 결정 필요
- 커뮤니티 관련 일부 파일의 `any` / lint 부채는 남아 있음
- comments_count 경로는 이번 턴 범위 밖이라 구조 개선하지 않음

---

## 8. 제미나이 리뷰용 질문

1. `post_likes`를 source of truth로 두고, `posts.likes_count` 직접 update 함수를 제거한 판단이 최소 수정으로 적절한가?
2. 현재는 `posts.likes_count`와 실제 count가 일치하지만, 이를 원본이 아니라 캐시/보조 컬럼으로 보는 결론이 타당한가?
3. 0 하드코딩 제거까지 이번 턴에 포함한 것이 범위 초과가 아닌가?
4. 다음 단계에서 comments_count까지 같은 방식으로 정리할 필요가 있는가?
