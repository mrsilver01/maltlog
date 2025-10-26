This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 운영 관리

### 관리자 추가

새로운 관리자를 추가하려면:

1. `scripts/ops_admin_set_role.sql` 파일 사용
2. `<<ADMIN_EMAIL>>` 부분을 실제 이메일로 교체
3. Supabase Dashboard > SQL Editor에서 실행
4. **중요**: 해당 사용자는 재로그인 필요 (JWT 토큰 갱신)

### 공지사항 관리

- **권한**: 관리자만 생성/수정/삭제 가능
- **생성**: Supabase Dashboard > announcements 테이블
- **표시 유형**:
  - `banner`: 상단 배너 (dismissible 가능)
  - `modal`: 팝업 (미구현)
- **중요도**: `info`, `warning`, `critical`
- **대상**: `all`, `guest`, `auth`

### whiskies 테이블 보안

- **읽기**: 모든 사용자 허용
- **생성/수정/삭제**: 관리자만 허용 (`is_admin()` 함수 기반)
- Row Level Security (RLS) 적용됨

### 데이터베이스 설정

초기 설정은 `docs/DB_BOOTSTRAP.md` 참조

⚠️ **주의**: `setup_admin_user.sql`은 deprecated 버전입니다. `ops_admin_set_role.sql`을 사용하세요.
