/**
 * 이미지 URL 처리 유틸리티 함수
 * 어디서든 동일한 로직으로 이미지 URL 변환
 */

/**
 * Supabase 스토리지 경로를 공개 URL로 변환
 * @param path 스토리지 경로 또는 이미 변환된 URL
 * @returns 공개 접근 가능한 이미지 URL 또는 placeholder
 */
export function toPublicImageUrl(path?: string | null): string {
  // 빈 값이면 placeholder 반환
  if (!path || path.trim() === '') {
    return '/images/placeholder-whisky.png'
  }

  // 이미 HTTP URL이면 그대로 반환
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // 환경 변수에서 Supabase URL 가져오기
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL이 설정되지 않음')
    return '/images/placeholder-whisky.png'
  }

  // 슬래시 정규화
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  // Supabase 스토리지 공개 URL 생성
  return `${supabaseUrl}/storage/v1/object/public/whiskies/${cleanPath}`
}

/**
 * 여러 이미지 경로를 일괄 변환
 * @param paths 변환할 경로 배열
 * @returns 변환된 URL 배열
 */
export function toPublicImageUrls(paths: (string | null)[]): string[] {
  return paths.map(path => toPublicImageUrl(path))
}

/**
 * 위스키 이미지를 위한 특수 처리
 * (추후 크기별 이미지, 최적화 등 확장 가능)
 */
export function useWhiskyImage(whiskyId: string, imagePath?: string | null): string {
  const imageUrl = toPublicImageUrl(imagePath)

  // placeholder인 경우 위스키 ID 기반 고유 색상 적용 가능
  if (imageUrl.includes('placeholder')) {
    return imageUrl
  }

  return imageUrl
}