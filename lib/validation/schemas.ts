/**
 * 공용 zod 스키마 모음
 * - 커뮤니티 post, comment, review 입력 검증
 * - 서버 액션 / API 라우트 양쪽에서 공유
 */

import { z } from 'zod'

// -------- 공통 --------
export const uuidSchema = z.string().uuid('올바른 ID 형식이 아닙니다')

// trim + 빈 문자열 방지 헬퍼
const trimmedString = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label}은(는) 최소 ${min}자 이상이어야 합니다`)
    .max(max, `${label}은(는) 최대 ${max}자까지 입력 가능합니다`)

// -------- 커뮤니티 게시글 --------
export const postCreateSchema = z.object({
  title: trimmedString(2, 100, '제목'),
  content: trimmedString(1, 10000, '본문'),
  image_url: z
    .string()
    .url('올바른 이미지 URL이 아닙니다')
    .max(1000)
    .nullish()
    .or(z.literal('').transform(() => null)),
})
export type PostCreateInput = z.infer<typeof postCreateSchema>

export const postUpdateSchema = postCreateSchema.partial().extend({
  id: uuidSchema,
})
export type PostUpdateInput = z.infer<typeof postUpdateSchema>

// -------- 커뮤니티 댓글 --------
export const commentCreateSchema = z.object({
  post_id: uuidSchema,
  content: trimmedString(1, 2000, '댓글'),
  parent_id: uuidSchema.nullish(),
})
export type CommentCreateInput = z.infer<typeof commentCreateSchema>

// -------- 위스키 리뷰 --------
export const reviewCreateSchema = z.object({
  whisky_id: uuidSchema,
  rating: z
    .number()
    .min(0.5, '별점은 최소 0.5점 이상이어야 합니다')
    .max(5, '별점은 최대 5점입니다'),
  note: z.string().trim().max(5000, '리뷰 내용은 최대 5000자까지입니다').nullish(),
})
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>

export const reviewUpdateSchema = reviewCreateSchema.partial().extend({
  id: uuidSchema,
})
export type ReviewUpdateInput = z.infer<typeof reviewUpdateSchema>

// -------- 프로필 --------
export const profileUpdateSchema = z.object({
  nickname: trimmedString(2, 20, '닉네임').regex(
    /^[가-힣a-zA-Z0-9_-]+$/,
    '닉네임은 한글/영문/숫자/_-만 가능합니다'
  ),
  bio: z.string().trim().max(300, '소개는 최대 300자입니다').nullish(),
})
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

// -------- 이미지 업로드 --------
export const IMAGE_ALLOWED_MIME = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024 // 5MB

/**
 * File 객체 검증 (브라우저 FormData 업로드 용)
 */
export function validateImageFile(file: unknown): { ok: true; file: File } | { ok: false; error: string } {
  if (!(file instanceof File)) {
    return { ok: false, error: '파일이 첨부되지 않았습니다' }
  }
  if (file.size === 0) {
    return { ok: false, error: '빈 파일은 업로드할 수 없습니다' }
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return {
      ok: false,
      error: `이미지는 ${Math.floor(IMAGE_MAX_BYTES / 1024 / 1024)}MB 이하만 업로드 가능합니다`,
    }
  }
  if (!IMAGE_ALLOWED_MIME.includes(file.type as (typeof IMAGE_ALLOWED_MIME)[number])) {
    return { ok: false, error: `지원하지 않는 이미지 형식입니다 (${file.type})` }
  }
  return { ok: true, file }
}

// -------- 공통 에러 포매터 --------
/**
 * zod 에러를 사용자 친화적 문자열 하나로 변환 (첫 번째 메시지)
 */
export function formatZodError(err: z.ZodError): string {
  const first = err.issues[0]
  if (!first) return '입력값이 올바르지 않습니다'
  return first.message
}
