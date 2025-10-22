-- ===================================================================
-- 보안: Row Level Security (RLS) 정책 - Phase 1 최소 필수 항목
-- ===================================================================
-- 목적: posts 및 comments 테이블의 데이터 보안 강화
-- 실행 위치: Supabase Dashboard > SQL Editor
-- ===================================================================

-- ===================================================================
-- 1. POSTS 테이블 RLS 정책
-- ===================================================================

-- posts 테이블 RLS 활성화
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 (있다면)
DROP POLICY IF EXISTS "posts_select_policy" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_policy" ON public.posts;
DROP POLICY IF EXISTS "posts_update_policy" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_policy" ON public.posts;

-- 1-1. 전체 읽기 정책 (모든 사용자가 모든 게시물 조회 가능)
CREATE POLICY "posts_select_policy"
    ON public.posts
    FOR SELECT
    USING (true);

-- 1-2. 본인만 쓰기 정책 (인증된 사용자만 게시물 작성 가능)
CREATE POLICY "posts_insert_policy"
    ON public.posts
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 1-3. 본인만 수정 정책 (작성자만 자신의 게시물 수정 가능)
CREATE POLICY "posts_update_policy"
    ON public.posts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 1-4. 본인만 삭제 정책 (작성자만 자신의 게시물 삭제 가능)
CREATE POLICY "posts_delete_policy"
    ON public.posts
    FOR DELETE
    USING (auth.uid() = user_id);

-- ===================================================================
-- 2. COMMENTS 테이블 RLS 정책
-- ===================================================================

-- comments 테이블 RLS 활성화
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 (있다면)
DROP POLICY IF EXISTS "comments_select_policy" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_policy" ON public.comments;
DROP POLICY IF EXISTS "comments_update_policy" ON public.comments;
DROP POLICY IF EXISTS "comments_delete_policy" ON public.comments;

-- 2-1. 전체 읽기 정책 (모든 사용자가 모든 댓글 조회 가능)
CREATE POLICY "comments_select_policy"
    ON public.comments
    FOR SELECT
    USING (true);

-- 2-2. 본인만 쓰기 정책 (인증된 사용자만 댓글 작성 가능)
CREATE POLICY "comments_insert_policy"
    ON public.comments
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 2-3. 본인만 수정 정책 (작성자만 자신의 댓글 수정 가능)
CREATE POLICY "comments_update_policy"
    ON public.comments
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2-4. 본인만 삭제 정책 (작성자만 자신의 댓글 삭제 가능)
CREATE POLICY "comments_delete_policy"
    ON public.comments
    FOR DELETE
    USING (auth.uid() = user_id);