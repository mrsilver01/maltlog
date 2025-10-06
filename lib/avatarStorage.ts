import { supabase } from './supabase'

/**
 * Supabase Storage를 사용한 아바타 이미지 업로드 헬퍼 함수들
 */

const AVATAR_BUCKET = 'avatars'
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// 버킷이 존재하지 않으면 생성
async function ensureBucketExists(): Promise<boolean> {
  try {
    // 버킷 목록 확인
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('버킷 목록 확인 실패:', listError)
      return false
    }

    // avatars 버킷이 존재하는지 확인
    const avatarBucket = buckets?.find(bucket => bucket.name === AVATAR_BUCKET)

    if (!avatarBucket) {
      console.log('avatars 버킷이 없습니다. 생성 중...')

      // 버킷 생성
      const { error: createError } = await supabase.storage.createBucket(AVATAR_BUCKET, {
        public: true,
        allowedMimeTypes: ALLOWED_TYPES,
        fileSizeLimit: MAX_FILE_SIZE
      })

      if (createError) {
        console.error('버킷 생성 실패:', createError)
        return false
      }

      console.log('✅ avatars 버킷 생성 완료')
    }

    return true
  } catch (error) {
    console.error('버킷 확인/생성 중 오류:', error)
    return false
  }
}

// 이미지 파일 검증
function validateImageFile(file: File): { valid: boolean; error?: string } {
  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: '파일 크기는 2MB 이하로 해주세요.' }
  }

  // 파일 타입 검증
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: '지원하는 이미지 형식: JPEG, PNG, WebP' }
  }

  return { valid: true }
}

// 이미지 파일을 Supabase Storage에 업로드
export async function uploadAvatarImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 파일 검증
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // 파일명 생성 (사용자 ID + 타임스탬프 + 랜덤값)
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileName = `${user.id}_${timestamp}_${randomId}.${fileExt}`
    const filePath = fileName

    console.log('아바타 이미지 업로드 시작:', fileName)

    // 버킷 존재 확인 및 생성
    const bucketReady = await ensureBucketExists()
    if (!bucketReady) {
      return { success: false, error: '아바타 저장소 준비에 실패했습니다.' }
    }

    // Supabase Storage에 파일 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // 같은 파일명이 있으면 덮어쓰기
      })

    if (uploadError) {
      console.error('파일 업로드 실패:', uploadError)
      return { success: false, error: `파일 업로드에 실패했습니다: ${uploadError.message}` }
    }

    // 업로드된 파일의 공개 URL 가져오기
    const { data: urlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(filePath)

    if (!urlData.publicUrl) {
      console.error('공개 URL 생성 실패')
      return { success: false, error: '이미지 URL 생성에 실패했습니다.' }
    }

    console.log('✅ 아바타 이미지 업로드 성공:', urlData.publicUrl)
    return { success: true, url: urlData.publicUrl }

  } catch (error) {
    console.error('아바타 업로드 중 오류:', error)
    return { success: false, error: '업로드 중 오류가 발생했습니다.' }
  }
}

// 기존 아바타 이미지 삭제
export async function deleteAvatarImage(avatarUrl: string): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('로그인이 필요합니다')
      return false
    }

    // URL에서 파일 경로 추출
    const urlParts = avatarUrl.split('/')
    const fileName = urlParts[urlParts.length - 1]
    const filePath = fileName // avatars/ 접두사 제거

    // 파일이 현재 사용자의 것인지 확인 (파일명에 사용자 ID 포함)
    if (!fileName.startsWith(user.id)) {
      console.error('다른 사용자의 파일은 삭제할 수 없습니다')
      return false
    }

    const { error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('파일 삭제 실패:', error)
      return false
    }

    console.log('✅ 아바타 이미지 삭제 성공:', filePath)
    return true
  } catch (error) {
    console.error('아바타 삭제 중 오류:', error)
    return false
  }
}

// 사용자의 모든 아바타 이미지 목록 가져오기
export async function getUserAvatarImages(): Promise<string[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return []
    }

    const { data: files, error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .list('', {
        limit: 100,
        offset: 0
      })

    if (error) {
      console.error('파일 목록 가져오기 실패:', error)
      return []
    }

    // 현재 사용자의 파일만 필터링
    const userFiles = files?.filter(file =>
      file.name.startsWith(user.id)
    ) || []

    // 공개 URL 생성
    const urls = userFiles.map(file => {
      const { data } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(file.name)
      return data.publicUrl
    }).filter(Boolean)

    return urls
  } catch (error) {
    console.error('사용자 아바타 목록 가져오기 중 오류:', error)
    return []
  }
}

// 이미지 압축 (업로드 전 최적화)
export function compressImage(file: File, maxWidth: number = 400, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // 비율 유지하면서 리사이즈
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      const newWidth = Math.floor(img.width * ratio)
      const newHeight = Math.floor(img.height * ratio)

      canvas.width = newWidth
      canvas.height = newHeight

      // 이미지 품질 향상을 위한 설정
      if (ctx) {
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, newWidth, newHeight)
      }

      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('이미지 압축 실패'))
          }
        },
        file.type,
        quality
      )
    }

    img.onerror = () => reject(new Error('이미지 로드 실패'))
    img.src = URL.createObjectURL(file)
  })
}

// 아바타 이미지 업로드 및 프로필 업데이트 통합 함수
export async function uploadAndSetAvatar(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // 0. 기존 프로필 이미지 URL 가져오기
    const { getCurrentUserProfile } = await import('./userProfiles')
    const currentProfile = await getCurrentUserProfile()
    const oldAvatarUrl = currentProfile?.avatar_url

    // 1. 이미지 압축
    console.log('이미지 압축 중...')
    const compressedFile = await compressImage(file, 400, 0.8)

    // 2. Supabase Storage에 업로드
    console.log('Supabase Storage에 업로드 중...')
    const uploadResult = await uploadAvatarImage(compressedFile)

    if (!uploadResult.success) {
      return uploadResult
    }

    // 3. 프로필 테이블의 avatar_url 업데이트
    console.log('프로필 테이블 업데이트 중...')
    const { updateAvatarUrl } = await import('./userProfiles')
    const updateSuccess = await updateAvatarUrl(uploadResult.url!)

    if (!updateSuccess) {
      // 업로드는 성공했지만 프로필 업데이트 실패 시 새 파일 삭제
      await deleteAvatarImage(uploadResult.url!)
      return { success: false, error: '프로필 업데이트에 실패했습니다.' }
    }

    // 4. 기존 아바타 이미지 삭제 (업데이트 성공 후)
    if (oldAvatarUrl && oldAvatarUrl !== uploadResult.url) {
      console.log('기존 아바타 이미지 삭제 중...')
      await deleteAvatarImage(oldAvatarUrl)
    }

    console.log('✅ 아바타 설정 완료:', uploadResult.url)
    return { success: true, url: uploadResult.url }

  } catch (error) {
    console.error('아바타 설정 중 오류:', error)
    return { success: false, error: '아바타 설정 중 오류가 발생했습니다.' }
  }
}