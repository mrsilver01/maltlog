-- 게시글 좋아요 기능을 위한 데이터베이스 테이블 생성 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1. post_likes 테이블 생성 (게시글 좋아요 관계 테이블)
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 한 사용자가 같은 게시글에 중복 좋아요 방지
    UNIQUE(post_id, user_id)
);

-- 2. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성
-- 모든 사용자가 post_likes를 조회할 수 있음
CREATE POLICY "Everyone can view post likes" ON post_likes
    FOR SELECT USING (true);

-- 인증된 사용자만 좋아요를 추가할 수 있음
CREATE POLICY "Users can insert their own likes" ON post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 좋아요만 삭제할 수 있음
CREATE POLICY "Users can delete their own likes" ON post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 5. posts 테이블에 likes_count 컬럼 추가 (선택사항)
-- 주의: 이 컬럼이 이미 있다면 오류가 발생합니다
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'likes_count'
    ) THEN
        ALTER TABLE posts ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 6. 기존 게시글들의 likes_count 업데이트 함수 생성
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts
        SET likes_count = (
            SELECT COUNT(*)
            FROM post_likes
            WHERE post_id = NEW.post_id
        )
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts
        SET likes_count = (
            SELECT COUNT(*)
            FROM post_likes
            WHERE post_id = OLD.post_id
        )
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. 트리거 생성 (자동으로 likes_count 업데이트)
DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON post_likes;
CREATE TRIGGER trigger_update_post_likes_count
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_likes_count();

-- 8. 기존 게시글들의 likes_count 초기화
UPDATE posts SET likes_count = (
    SELECT COUNT(*)
    FROM post_likes
    WHERE post_likes.post_id = posts.id
);

-- 완료 메시지
SELECT 'Database setup completed! Post likes functionality is now ready.' as status;