-- Supabase Storage 설정 스크립트
-- 커뮤니티 이미지 업로드를 위한 bucket 및 정책 생성

-- 1. community bucket 생성 (이미 있다면 오류 발생하지만 무시해도 됨)
INSERT INTO storage.buckets (id, name, public)
VALUES ('community', 'community', true)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS 정책 생성

-- 모든 사용자가 community bucket의 이미지를 볼 수 있음
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING (bucket_id = 'community');

-- 인증된 사용자가 자신의 폴더에 업로드할 수 있음
CREATE POLICY "Users can upload to own folder" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'community'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 사용자가 자신의 파일을 삭제할 수 있음
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE
USING (
  bucket_id = 'community'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 완료 메시지
SELECT 'Community storage setup completed!' as status;