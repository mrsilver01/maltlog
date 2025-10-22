-- ===================================================================
-- 데이터 무결성: 프로필 자동 생성 트리거 - Phase 1 최소 필수 항목
-- ===================================================================
-- 목적: 신규 사용자 가입 시 profiles 테이블에 자동으로 프로필 생성
-- 실행 위치: Supabase Dashboard > SQL Editor
-- ===================================================================

-- 신규 사용자 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_nickname TEXT;
    user_id_suffix TEXT;
BEGIN
    user_id_suffix := RIGHT(NEW.id::TEXT, 8);
    default_nickname := COALESCE(
        NEW.raw_user_meta_data->>'nickname',
        '익명_' || user_id_suffix
    );

    INSERT INTO public.profiles (
        id,
        nickname,
        avatar_url,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        default_nickname,
        NEW.raw_user_meta_data->>'avatar_url',
        NOW(),
        NOW()
    );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성 (기존 트리거가 있다면 교체)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();