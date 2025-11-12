// lib/supabase/publicUrl.ts
export function toPublicImageUrl(path?: string | null): string {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '') || ''
  // path는 "bucket/key..." 형태라고 가정
  return `${base}/storage/v1/object/public/${path.replace(/^\/+/, '')}`
}