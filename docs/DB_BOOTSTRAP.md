# 데이터베이스 부트스트랩 가이드

몰트로그 데이터베이스 초기 설정 및 보안 설정을 위한 단계별 가이드입니다.

## 실행 순서

### 1단계: 관리자 시스템 기본 설정

```sql
-- scripts/setup_admin_system.sql 실행
-- is_admin() 함수 및 공지사항 테이블 생성
```

- **목적**: `is_admin()` 함수와 공지사항 시스템 테이블 생성
- **위치**: Supabase Dashboard > SQL Editor
- **재실행**: 안전함 (IF NOT EXISTS, DROP IF EXISTS 사용)

### 2단계: whiskies 테이블 RLS 보안 설정

```sql
-- scripts/setup_whiskies_rls.sql 실행
-- whiskies 테이블 보안 정책 적용
```

- **목적**: whiskies 테이블에 Row Level Security 적용
- **정책**:
  - 읽기: 모든 사용자 허용
  - 생성/수정/삭제: 관리자만 허용
- **전제조건**: `public.is_admin()` 함수 존재 필요
- **재실행**: 안전함 (DROP IF EXISTS 포함)

### 3단계: 관리자 계정 설정 (필요시)

```sql
-- scripts/ops_admin_set_role.sql 사용
-- 특정 사용자에게 관리자 권한 부여
```

- **주의**: `<<ADMIN_EMAIL>>` 부분을 실제 이메일로 교체
- **컬럼**: `raw_app_meta_data` 사용 (app_metadata 아님)
- **적용**: 해당 사용자 재로그인 필요

## QA 체크리스트

### 연령 게이트 (AgeGate)
- [ ] 시크릿 창 첫 방문 시 모달 노출
- [ ] "19세 이상" 클릭 시 1년 쿠키 생성
- [ ] 새 탭/새로고침 시 모달 미노출
- [ ] 로그인 화면 하단 법령 고지 문구 확인

### 공지사항 배너 (Announcement)
- [ ] Supabase에서 공지 생성 시 홈 상단 노출
- [ ] level별 색상 변화 (info/warning/critical)
- [ ] start_at/end_at 기간 설정 동작
- [ ] 콘솔 에러 없음

### 데이터베이스 보안
- [ ] whiskies 테이블 RLS 활성화 확인
- [ ] is_admin() 함수 존재 확인
- [ ] 관리자 JWT 토큰 role 필드 확인

## 주의사항

⚠️ **deprecated 파일**: `setup_admin_user.sql`은 오류 버전입니다. `ops_admin_set_role.sql`을 사용하세요.

⚠️ **재로그인 필수**: 관리자 권한 설정 후 반드시 재로그인해야 JWT에 반영됩니다.

⚠️ **Service Role Key**: 절대 클라이언트 코드나 레포지토리에 노출하지 마세요.