# Maltlog

Maltlog는 **Next.js 15 + Supabase** 기반의 위스키 커뮤니티 서비스입니다.

핵심 기능:
- 위스키 목록 / 상세 조회
- 위스키 별점 및 노트 작성
- 위스키 좋아요(찜)
- 커뮤니티 게시글 작성 / 조회 / 좋아요
- 프로필 및 개인 리뷰 기록 확인

## Tech Stack

- Next.js 15 (App Router)
- React
- TypeScript
- Supabase (Auth, Postgres, Storage)
- Tailwind CSS

## 로컬 실행

### 1) 의존성 설치

```bash
npm install
```

### 2) `.env.local` 설정

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 채웁니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

설명:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 클라이언트용 anon key
- `SUPABASE_SERVICE_ROLE_KEY`: 서버/스크립트용 service role key

### 3) 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 을 열면 됩니다.

## 프로덕션 빌드 확인

```bash
npm run build
```

최근 정리 기준으로 `.next` 캐시를 비운 뒤 빌드가 정상 통과하는 상태입니다.

## DB 핵심 아키텍처 요약

이 프로젝트는 이벤트 원본 테이블을 Source of Truth로 두고, 캐시 컬럼/뷰를 보조 읽기 레이어로 취급합니다.

핵심 정리 문서:
- [docs/db-source-of-truth.md](docs/db-source-of-truth.md)

요약:
- 위스키 좋아요: `likes`
- 위스키 평점: `reviews`
- 커뮤니티 좋아요: `post_likes`

## 문서

운영/감사 관련 문서:
- [docs/DB_BOOTSTRAP.md](docs/DB_BOOTSTRAP.md)
- [docs/db-source-of-truth.md](docs/db-source-of-truth.md)
- [docs/community-likes-audit-and-build-cleanup-2026-03-19.md](docs/community-likes-audit-and-build-cleanup-2026-03-19.md)

## Known Issues

- 앱 전반에 걸쳐 TypeScript `any` 기반의 기존 lint 부채가 아직 남아 있습니다.
- 이번 단계에서는 전체 리팩터링을 하지 않고, 신뢰도 확보에 필요한 범위만 정리했습니다.
- 일부 읽기 최적화 레이어(materialized view / cache column)는 여전히 장기적으로 재정비가 필요합니다.

## 운영 메모

### 관리자 추가

새로운 관리자를 추가하려면:

1. `scripts/ops_admin_set_role.sql` 파일 사용
2. `<<ADMIN_EMAIL>>` 부분을 실제 이메일로 교체
3. Supabase Dashboard > SQL Editor에서 실행
4. 해당 사용자는 재로그인 필요

### 공지사항 관리

- 권한: 관리자만 생성/수정/삭제 가능
- 생성 위치: Supabase Dashboard > `announcements`
- 표시 유형: `banner`, `modal`
- 중요도: `info`, `warning`, `critical`
- 대상: `all`, `guest`, `auth`
