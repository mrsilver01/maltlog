# 🚀 Maltlog 성능 최적화: Materialized View 배포

## 📋 개요

이 폴더는 Maltlog 웹사이트의 성능 최적화를 위한 데이터베이스 Materialized View를 생성합니다.

**성능 개선 목표:**
- 홈페이지 로딩 시간: **3.2초 → 0.5초 이하** (85% 개선)
- DB 쿼리 시간: **2.6초 → 0.01초** (99% 개선)

## 📁 파일 구조

```
sql/
├── README.md                    # 이 파일
└── create_materialized_view.sql # Materialized View 생성 SQL
```

## 🔧 배포 순서

### 1. 프로덕션 데이터베이스에서 SQL 실행

Supabase 대시보드 → SQL Editor에서 다음 파일을 실행:

```bash
sql/create_materialized_view.sql
```

**실행 결과 확인:**
- ✅ `whiskies_with_stats_mat` Materialized View 생성됨
- ✅ 인덱스 6개 생성됨
- ✅ `refresh_whiskies_stats_mat()` 함수 생성됨
- ✅ 초기 데이터 로드 완료

### 2. 애플리케이션 코드 배포

현재 커밋의 변경사항:
- ✅ ISR (Incremental Static Regeneration) 적용 (10분 캐시)
- ✅ 이미지 우선 정렬 로직 적용
- ✅ force-dynamic → revalidate 전환

### 3. 배포 후 확인사항

**성능 확인:**
```bash
# 홈페이지 로딩 시간 측정
curl -w "@curl-format.txt" -s -o /dev/null https://maltlog.kr/

# API 응답 시간 확인
curl -w "%{time_total}" -s -o /dev/null https://maltlog.kr/api/whiskies?limit=10
```

**예상 결과:**
- 첫 번째 요청: ~1-2초 (Materialized View + ISR)
- 두 번째 요청: ~100-300ms (캐시 히트)

## 🔄 주기적 갱신

### 자동 갱신 (권장)

pg_cron 확장을 활성화하여 10분마다 자동 갱신:

```sql
SELECT cron.schedule(
  'refresh-whiskies-stats',
  '*/10 * * * *',
  'SELECT refresh_whiskies_stats_mat();'
);
```

### 수동 갱신

필요시 수동으로 데이터 갱신:

```sql
SELECT refresh_whiskies_stats_mat();
```

## ⚠️ 주의사항

1. **배포 순서 준수**: 반드시 SQL → 코드 순으로 배포
2. **다운타임 없음**: `REFRESH MATERIALIZED VIEW CONCURRENTLY` 사용
3. **롤백 계획**: 문제 시 기존 뷰(`whiskies_with_stats`)로 되돌리기

## 🔙 롤백 방법

문제 발생 시 즉시 롤백:

```sql
-- 1. Materialized View 제거
DROP MATERIALIZED VIEW IF EXISTS whiskies_with_stats_mat CASCADE;

-- 2. 애플리케이션 코드를 이전 커밋으로 되돌리기
git revert [commit_hash]
git push
```

## 📊 모니터링

**성능 모니터링:**
- Supabase Dashboard → Performance
- Next.js Build 시 Bundle Analyzer
- 사용자 피드백 모니터링

**데이터 정합성 확인:**
```sql
-- Materialized View vs 실제 View 비교
SELECT
  mv.id,
  mv.avg_rating as mat_rating,
  v.avg_rating as view_rating
FROM whiskies_with_stats_mat mv
JOIN whiskies_with_stats v ON mv.id = v.id
WHERE ABS(mv.avg_rating - v.avg_rating) > 0.01
LIMIT 5;
```

## 🎯 성공 지표

- [ ] 홈페이지 로딩 시간 < 1초
- [ ] API 응답 시간 < 100ms
- [ ] 사용자 이탈률 감소
- [ ] Core Web Vitals 점수 90+

---

**문의:** 성능 이슈 발생 시 개발팀 연락