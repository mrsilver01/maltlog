import { supabase } from './supabase'

/**
 * Supabase Storage를 사용한 위스키 이미지 관리
 */

const WHISKY_BUCKET = 'whisky-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// 버킷이 존재하지 않으면 생성
async function ensureWhiskyBucketExists(): Promise<boolean> {
  try {
    // 버킷 목록 확인
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('버킷 목록 확인 실패:', listError)
      return false
    }

    // whisky-images 버킷이 존재하는지 확인
    const whiskyBucket = buckets?.find(bucket => bucket.name === WHISKY_BUCKET)

    if (!whiskyBucket) {
      console.log('whisky-images 버킷이 없습니다. 생성 중...')

      // 버킷 생성
      const { error: createError } = await supabase.storage.createBucket(WHISKY_BUCKET, {
        public: true,
        allowedMimeTypes: ALLOWED_TYPES,
        fileSizeLimit: MAX_FILE_SIZE
      })

      if (createError) {
        console.error('버킷 생성 실패:', createError)
        return false
      }

      console.log('✅ whisky-images 버킷 생성 완료')
    }

    return true
  } catch (error) {
    console.error('버킷 확인/생성 중 오류:', error)
    return false
  }
}

// 위스키 이미지 업로드
export async function uploadWhiskyImage(file: File, whiskyId: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // 파일 검증
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: '파일 크기는 5MB 이하로 해주세요.' }
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: '지원하는 이미지 형식: JPEG, PNG, WebP' }
    }

    // 버킷 존재 확인 및 생성
    const bucketReady = await ensureWhiskyBucketExists()
    if (!bucketReady) {
      return { success: false, error: '이미지 저장소 준비에 실패했습니다.' }
    }

    // 파일명 생성 (위스키 ID + 확장자)
    const fileExt = file.name.split('.').pop()
    const fileName = `${whiskyId}.${fileExt}`

    console.log('위스키 이미지 업로드 시작:', fileName)

    // Supabase Storage에 파일 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(WHISKY_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // 같은 파일명이 있으면 덮어쓰기
      })

    if (uploadError) {
      console.error('파일 업로드 실패:', uploadError)
      return { success: false, error: `파일 업로드에 실패했습니다: ${uploadError.message}` }
    }

    // 업로드된 파일의 공개 URL 가져오기
    const { data: urlData } = supabase.storage
      .from(WHISKY_BUCKET)
      .getPublicUrl(fileName)

    if (!urlData.publicUrl) {
      console.error('공개 URL 생성 실패')
      return { success: false, error: '이미지 URL 생성에 실패했습니다.' }
    }

    console.log('✅ 위스키 이미지 업로드 성공:', urlData.publicUrl)
    return { success: true, url: urlData.publicUrl }

  } catch (error) {
    console.error('위스키 이미지 업로드 중 오류:', error)
    return { success: false, error: '업로드 중 오류가 발생했습니다.' }
  }
}

// 모든 로컬 위스키 이미지를 Supabase에 업로드
export async function migrateWhiskyImagesToSupabase(): Promise<void> {
  try {
    console.log('위스키 이미지 마이그레이션 시작...')

    // 버킷 준비
    const bucketReady = await ensureWhiskyBucketExists()
    if (!bucketReady) {
      console.error('버킷 준비 실패')
      return
    }

    // Supabase whiskies 테이블에서 모든 위스키 정보 가져오기
    const { data: whiskies, error } = await supabase
      .from('whiskies')
      .select('id, name, image')

    if (error) {
      console.error('위스키 데이터 로드 실패:', error)
      return
    }

    if (!whiskies) {
      console.log('위스키 데이터가 없습니다.')
      return
    }

    console.log(`총 ${whiskies.length}개 위스키 이미지 처리 예정`)

    for (const whisky of whiskies) {
      // 기본 이미지나 이미 Supabase URL인 경우 스킵
      if (whisky.image.includes('no-pic') || whisky.image.includes('supabase')) {
        continue
      }

      try {
        // 로컬 파일 경로에서 실제 파일 가져오기
        const imagePath = whisky.image.replace('/whiskies/', '')
        console.log(`처리 중: ${whisky.name} (${imagePath})`)

        // 실제 파일이 존재하는지 확인하고 업로드
        // 이 부분은 실제 파일 시스템에 접근해야 하므로 별도 스크립트로 처리하거나
        // 웹 인터페이스를 통해 수동으로 업로드해야 합니다.

      } catch (error) {
        console.error(`${whisky.name} 이미지 처리 실패:`, error)
      }
    }

  } catch (error) {
    console.error('이미지 마이그레이션 중 오류:', error)
  }
}

// 위스키 이미지 URL 가져오기 (fallback 포함)
export function getWhiskyImageUrl(whiskyId: string, currentImagePath?: string): string {
  // 이미 Supabase URL인 경우 그대로 반환
  if (currentImagePath?.includes('supabase')) {
    return currentImagePath
  }

  // Supabase URL 생성
  const { data } = supabase.storage
    .from(WHISKY_BUCKET)
    .getPublicUrl(`${whiskyId}.png`)

  // fallback으로 기존 경로 또는 기본 이미지 사용
  return data.publicUrl || currentImagePath || '/whiskies/no.pic whisky.png'
}

// 위스키 이미지 삭제
export async function deleteWhiskyImage(whiskyId: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(WHISKY_BUCKET)
      .remove([`${whiskyId}.png`, `${whiskyId}.jpg`, `${whiskyId}.jpeg`, `${whiskyId}.webp`])

    if (error) {
      console.error('위스키 이미지 삭제 실패:', error)
      return false
    }

    console.log('✅ 위스키 이미지 삭제 성공:', whiskyId)
    return true
  } catch (error) {
    console.error('위스키 이미지 삭제 중 오류:', error)
    return false
  }
}