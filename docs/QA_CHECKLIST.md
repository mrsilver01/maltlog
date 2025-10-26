# QA 체크리스트 - AgeGate & Announcement

## 🔍 UI QA

### AgeGate 테스트

#### 📋 체크리스트
- [ ] **시크릿 창 첫 방문** → 연령 확인 모달 노출
- [ ] **"19세 이상" 클릭** → age_confirmed=true 쿠키 생성 (Max-Age=1년)
- [ ] **새 탭/새로고침** → 모달 미노출 (쿠키 확인됨)
- [ ] **로그인 화면** → 하단 청소년보호법 고지 문구 확인

#### 🛠️ 테스트 방법
1. **시크릿 창 열기**: Chrome/Safari에서 시크릿 모드로 `http://localhost:3000` 접속
2. **모달 확인**: 연령 게이트 모달이 화면 중앙에 표시되는지 확인
3. **쿠키 생성**: "19세 이상" 클릭 후 개발자 도구 > Application > Cookies에서 `age_confirmed=true` 확인
4. **지속성 확인**: 새 탭으로 다시 접속 시 모달이 나타나지 않는지 확인
5. **로그인 페이지**: `/login` 페이지 하단 법령 고지 확인

#### 📸 캡처 대상
- 연령 게이트 모달 화면
- 개발자 도구의 쿠키 설정 화면
- 로그인 페이지 하단 법령 고지 부분

### Announcement 배너 테스트

#### 📋 체크리스트
- [ ] **공지 생성** → Supabase에서 배너 공지 생성 시 홈 상단 노출
- [ ] **level별 색상**: info(파란색), warning(노란색), critical(빨간색)
- [ ] **기간 설정**: start_at/end_at에 따른 노출/비노출 전환
- [ ] **해제 기능**: dismissible=true일 때 "닫기" 버튼 동작
- [ ] **콘솔 에러 없음**: 브라우저 콘솔에 JavaScript 에러 없음

#### 🛠️ 테스트 방법
1. **Supabase Dashboard** → announcements 테이블에서 공지 생성:
   ```sql
   INSERT INTO announcements (title, body, level, display, audience, dismissible, created_by)
   VALUES ('테스트 공지', '이것은 테스트 공지입니다', 'info', 'banner', 'all', true, 'USER_ID');
   ```
2. **홈페이지 확인**: 공지가 헤더 아래 표시되는지 확인
3. **레벨 변경**: level을 warning, critical로 변경하여 색상 확인
4. **기간 테스트**: end_at을 과거 날짜로 설정하여 비노출 확인

#### 📸 캡처 대상
- 각 level별 배너 색상 (info, warning, critical)
- 배너 해제 전/후 화면
- 브라우저 개발자 도구 콘솔 (에러 없음 확인)

## 🗄️ DB 검증 (Supabase Dashboard 필요)

### whiskies RLS 상태 확인

```sql
-- RLS 활성화 확인
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'whiskies';

-- 정책 목록 확인
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'whiskies';
```

**기대값**:
- `relrowsecurity = true`
- 정책 2개: `whiskies_select_all`, `whiskies_admin_cud`

### is_admin() 함수 확인

```sql
SELECT n.nspname as schema, p.proname as func
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'is_admin' AND n.nspname='public';
```

**기대값**: 1행 반환 (함수 존재)

### posts.likes_count 무결성 점검

```sql
-- 컬럼 존재/기본값 확인
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name='posts' AND column_name='likes_count';

-- 트리거 존재 확인
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table='post_likes';

-- 실데이터 불일치 탐지
WITH agg AS (
  SELECT post_id, count(*)::int as cnt
  FROM public.post_likes
  GROUP BY post_id
)
SELECT p.id, p.likes_count, coalesce(a.cnt,0) as expected
FROM public.posts p
LEFT JOIN agg a ON a.post_id = p.id
WHERE p.likes_count <> coalesce(a.cnt,0);
```

**기대값**: 불일치 0건

## 📋 PR 체크박스

PR 생성 시 다음 항목들을 체크하여 첨부:

- [ ] whiskies RLS ON & 정책 2건 캡처 (쿼리 결과)
- [ ] is_admin() 존재 캡처
- [ ] AgeGate/배너 동작 캡처 (시크릿 창)
- [ ] posts.likes_count 무결성 쿼리 결과 첨부 (0건 or 수정 제안 포함)

## ⚠️ 주의사항

- 모든 테스트는 시크릿/프라이빗 창에서 수행
- 브라우저 개발자 도구 콘솔에서 JavaScript 에러 확인
- Supabase 환경변수 누락 시 에러 발생 가능성 체크
- 테스트 후 생성한 공지사항은 정리할 것