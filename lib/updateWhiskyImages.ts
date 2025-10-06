import { supabase } from './supabase'

/**
 * 위스키 이미지 URL을 Supabase Storage URL로 업데이트하는 함수들
 */

// Supabase Storage에서 위스키 이미지 URL 생성
export function getSupabaseWhiskyImageUrl(whiskyId: string, fileExtension: string = 'png'): string {
  const { data } = supabase.storage
    .from('whisky-images')
    .getPublicUrl(`${whiskyId}.${fileExtension}`)

  return data.publicUrl
}

// 특정 위스키의 이미지 URL 업데이트
export async function updateWhiskyImageUrl(whiskyId: string, newImageUrl: string): Promise<boolean> {
  try {
    // whiskyData.ts 파일을 동적으로 수정하는 것은 복잡하므로
    // 대신 Supabase에 위스키 이미지 정보를 저장하는 테이블을 만들어 사용

    console.log(`위스키 ${whiskyId}의 이미지 URL 업데이트:`, newImageUrl)

    // 실제로는 whiskyData.ts를 수정하거나 별도 테이블에 저장해야 함
    // 현재는 로그만 출력

    return true
  } catch (error) {
    console.error('위스키 이미지 URL 업데이트 실패:', error)
    return false
  }
}

// 업로드된 위스키 이미지들의 URL 매핑 생성
export function generateWhiskyImageUrlMapping(): Record<string, string> {
  const mapping: Record<string, string> = {}

  // 주요 위스키들의 Supabase URL 생성
  const mainWhiskies = [
    'glengrant-arboralis',
    'bowmore-18',
    'kavalan-solist-vinho',
    'wild-turkey-rare-breed',
    'russell-reserve-10',
    'russell-reserve-15-bourbon',
    'glenfiddich-12',
    'glenfiddich-15',
    'glenfiddich-18'
  ]

  mainWhiskies.forEach(whiskyId => {
    mapping[whiskyId] = getSupabaseWhiskyImageUrl(whiskyId)
  })

  return mapping
}

// 주요 위스키들의 임시 이미지 URL 매핑 (빠른 수정용)
const TEMP_IMAGE_MAPPING: Record<string, string> = {
  'glengrant-arboralis': 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=300&h=400&fit=crop',
  'bowmore-18': 'https://images.unsplash.com/photo-1587899897387-091f0c1b3dc5?w=300&h=400&fit=crop',
  'kavalan-solist-vinho': 'https://images.unsplash.com/photo-1582196016295-f8c8bd4b3a99?w=300&h=400&fit=crop',
  'wild-turkey-rare-breed': 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=300&h=400&fit=crop',
  'russell-reserve-10': 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=300&h=400&fit=crop',
  'russell-reserve-15-bourbon': 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=300&h=400&fit=crop',
  'glenfiddich-12': 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=300&h=400&fit=crop',
  'glenfiddich-15': 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=300&h=400&fit=crop',
  'glenfiddich-18': 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=300&h=400&fit=crop'
}

// fallback 이미지 URL 처리
export function getWhiskyImageWithFallback(whiskyId: string, originalImagePath?: string): string {
  // 임시 매핑에 있는 경우 사용 (프로덕션에서 바로 보이도록)
  if (TEMP_IMAGE_MAPPING[whiskyId] && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return TEMP_IMAGE_MAPPING[whiskyId]
  }

  // 1순위: Supabase Storage URL
  const supabaseUrl = getSupabaseWhiskyImageUrl(whiskyId)

  // 2순위: 원본 경로 (로컬에서만 동작)
  const fallbackUrl = originalImagePath || 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=300&h=400&fit=crop'

  // 프로덕션에서는 Supabase URL 우선 사용
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return supabaseUrl
  }

  // 로컬에서는 원본 경로 우선 사용 (개발 편의)
  return fallbackUrl
}

// 위스키 컴포넌트에서 사용할 이미지 URL 가져오기
export function useWhiskyImage(whiskyId: string, originalImagePath?: string): string {
  return getWhiskyImageWithFallback(whiskyId, originalImagePath)
}