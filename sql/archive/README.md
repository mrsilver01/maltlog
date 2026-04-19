# SQL Archive

이 폴더의 파일들은 **과거에 일회성으로 적용된 SQL 스크립트**이거나
**루트에 중복으로 남아 있던 파일들**의 아카이브입니다.

현재 DB 상태는 이미 이 스크립트들이 반영된 이후이므로, 일반적인 개발 흐름에서
직접 실행할 필요가 없습니다. 참고 / 과거 히스토리 추적 용도로만 보관합니다.

## 포함된 파일

| 파일 | 설명 |
|------|------|
| `database_fix.sql` | 1회성 데이터/스키마 보정 스크립트 (적용 완료) |
| `database_fix 2.sql` | `database_fix.sql`의 byte-identical 중복본 |
| `database_view_update.sql` | 이전 일반 view 업데이트 (현재는 materialized view 사용) |
| `setup_featured_whiskies.sql` | `is_featured` 컬럼 초기 설정 (적용 완료) |
| `storage_setup.sql` | Supabase Storage 버킷/정책 초기화 (적용 완료) |
| `storage_setup 2.sql` | `storage_setup.sql`의 byte-identical 중복본 |

## 현재 유효한 SQL

- **루트 `supabase-tables.sql`**: 테이블 정의 참고본 (현재 DB 상태와 100% 일치는 보장 X — 4단계에서 재정비 예정)
- **루트 `supabase-migration.sql`**: 마이그레이션 참고본
- **`sql/create_materialized_view.sql`**: 현재 운영 중인 materialized view 정의 (pg_cron으로 10분마다 자동 갱신)
- **`sql/create_whiskies_with_stats_view.sql`**: 과거 일반 view 정의 (materialized view의 전 단계)

## 주의

이 폴더의 파일을 **재실행하지 마세요**. 멱등성이 보장되지 않으며,
현재 DB 상태를 덮어쓰거나 중복 데이터를 만들 수 있습니다.
