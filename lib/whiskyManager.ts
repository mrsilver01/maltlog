'use client'

import { supabase } from './supabase'

// 위스키 데이터 타입 확장
export interface WhiskyData {
  id: string
  name: string
  name_en?: string // 영문명 (optional)
  image: string
  abv: string
  region: string
  price: string
  cask: string
  avgRating: number
  totalReviews: number
  description?: string
  distillery?: string
  age?: string
  created_at?: string
  updated_at?: string
}

// 사용자 별점 데이터
export interface UserRating {
  id: string
  user_id: string
  whisky_id: string
  rating: number
  created_at: string
  updated_at: string
}

// 리뷰 데이터 (기존 확장)
export interface Review {
  id: string
  user_id: string
  whisky_id: string
  user: string
  rating: number
  comment: string
  likes: number
  comments: number
  created_at: string
  updated_at: string
}

// 이미지 업로드 타입
export interface ImageUploadData {
  file: File
  whisky_id: string
}

// 위스키 생성 요청 타입
export interface CreateWhiskyRequest {
  name: string
  name_en?: string
  abv: string
  region: string
  price: string
  cask: string
  description?: string
  distillery?: string
  age?: string
  image?: File
}

class WhiskyManager {
  // 새 위스키 추가
  async createWhisky(data: CreateWhiskyRequest): Promise<{ whisky: WhiskyData | null, error: string | null }> {
    try {
      // 1. ID 생성 (한글명을 영문으로 변환)
      const id = this.generateId(data.name, data.name_en)

      // 2. 이미지 업로드
      let imagePath = `/whiskies/placeholder.jpg`
      if (data.image) {
        const imageResult = await this.uploadImage(data.image, id)
        if (imageResult.error) {
          return { whisky: null, error: imageResult.error }
        }
        imagePath = imageResult.path!
      }

      // 3. 위스키 데이터 생성
      const whiskyData: WhiskyData = {
        id,
        name: data.name,
        name_en: data.name_en,
        image: imagePath,
        abv: data.abv,
        region: data.region,
        price: data.price,
        cask: data.cask,
        description: data.description,
        distillery: data.distillery,
        age: data.age,
        avgRating: 0,
        totalReviews: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // 4. 데이터베이스에 저장 (Supabase 사용 시)
      const { data: savedWhisky, error } = await supabase
        .from('whiskies')
        .insert([whiskyData])
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        // 로컬 저장소에 fallback
        this.saveToLocalStorage(whiskyData)
      }

      return { whisky: savedWhisky || whiskyData, error: null }
    } catch (error) {
      return { whisky: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // ID 생성 (한글명 → 영문 변환)
  private generateId(koreanName: string, englishName?: string): string {
    if (englishName) {
      return englishName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }

    // 한글명을 기반으로 ID 생성
    const nameMap: { [key: string]: string } = {
      '글렌': 'glen',
      '맥캘란': 'macallan',
      '아드벡': 'ardbeg',
      '라가불린': 'lagavulin',
      '발베니': 'balvenie',
      '하이랜드': 'highland',
      '파크': 'park',
      '그란트': 'grant',
      '피딕': 'fiddich',
      '모레인지': 'morangie',
      '탈리스커': 'talisker',
      '오반': 'oban',
      '부나하벤': 'bunnahabhain'
    }

    let id = koreanName.toLowerCase()

    // 한글 단어 변환
    Object.entries(nameMap).forEach(([korean, english]) => {
      id = id.replace(korean, english)
    })

    // 숫자와 년 처리
    id = id.replace(/(\d+)년?/g, '-$1')
    id = id.replace(/\s+/g, '-')
    id = id.replace(/[^a-z0-9-]/g, '')
    id = id.replace(/-+/g, '-')
    id = id.replace(/^-|-$/g, '')

    return id || 'whisky-' + Date.now()
  }

  // 이미지 업로드
  async uploadImage(file: File, whiskyId: string): Promise<{ path: string | null, error: string | null }> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${whiskyId}.${fileExt}`
      const filePath = `whiskies/${fileName}`

      // Supabase Storage 업로드
      const { error } = await supabase.storage
        .from('whisky-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('Storage error:', error)
        // 로컬 파일로 fallback
        return this.saveImageLocally(file, fileName)
      }

      return { path: `/whiskies/${fileName}`, error: null }
    } catch {
      return { path: null, error: 'Image upload failed' }
    }
  }

  // 로컬 이미지 저장 (fallback)
  private async saveImageLocally(file: File, fileName: string): Promise<{ path: string | null, error: string | null }> {
    try {
      // 브라우저에서는 실제 파일 시스템에 저장할 수 없으므로
      // Base64로 변환하여 localStorage에 저장
      const base64 = await this.fileToBase64(file)
      localStorage.setItem(`whisky-image-${fileName}`, base64)

      return { path: `/whiskies/${fileName}`, error: null }
    } catch {
      return { path: null, error: 'Local image save failed' }
    }
  }

  // File to Base64 변환
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // 로컬 저장소에 위스키 데이터 저장
  private saveToLocalStorage(whisky: WhiskyData) {
    const existingData = localStorage.getItem('whiskies')
    const whiskies = existingData ? JSON.parse(existingData) : {}
    whiskies[whisky.id] = whisky
    localStorage.setItem('whiskies', JSON.stringify(whiskies))
  }

  // 모든 위스키 가져오기
  async getAllWhiskies(): Promise<WhiskyData[]> {
    try {
      const { data, error } = await supabase
        .from('whiskies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error:', error)
        return this.getLocalWhiskies()
      }

      return data || []
    } catch {
      return this.getLocalWhiskies()
    }
  }

  // 로컬 위스키 데이터 가져오기
  private getLocalWhiskies(): WhiskyData[] {
    const data = localStorage.getItem('whiskies')
    if (data) {
      const whiskies = JSON.parse(data)
      return Object.values(whiskies) as WhiskyData[]
    }
    return []
  }

  // 사용자 별점 저장/업데이트
  async saveUserRating(userId: string, whiskyId: string, rating: number): Promise<{ success: boolean, error?: string }> {
    try {
      const ratingData = {
        user_id: userId,
        whisky_id: whiskyId,
        rating,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_ratings')
        .upsert([ratingData], { onConflict: 'user_id,whisky_id' })

      if (error) {
        console.error('Rating save error:', error)
        // 로컬 저장소에 fallback
        this.saveRatingLocally(userId, whiskyId, rating)
      }

      // 평균 별점 업데이트
      await this.updateAverageRating(whiskyId)

      return { success: true }
    } catch {
      return { success: false, error: 'Rating save failed' }
    }
  }

  // 로컬 별점 저장
  private saveRatingLocally(userId: string, whiskyId: string, rating: number) {
    const key = `rating-${userId}-${whiskyId}`
    localStorage.setItem(key, JSON.stringify({
      user_id: userId,
      whisky_id: whiskyId,
      rating,
      created_at: new Date().toISOString()
    }))
  }

  // 사용자 별점 가져오기
  async getUserRating(userId: string, whiskyId: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('user_ratings')
        .select('rating')
        .eq('user_id', userId)
        .eq('whisky_id', whiskyId)
        .single()

      if (error || !data) {
        // 로컬에서 찾기
        const localRating = localStorage.getItem(`rating-${userId}-${whiskyId}`)
        if (localRating) {
          const parsed = JSON.parse(localRating)
          return parsed.rating
        }
        return null
      }

      return data.rating
    } catch {
      return null
    }
  }

  // 평균 별점 업데이트
  private async updateAverageRating(whiskyId: string) {
    try {
      const { data, error } = await supabase
        .from('user_ratings')
        .select('rating')
        .eq('whisky_id', whiskyId)

      if (!error && data) {
        const ratings = data.map(r => r.rating)
        const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length

        await supabase
          .from('whiskies')
          .update({
            avgRating: Number(avgRating.toFixed(1)),
            totalReviews: ratings.length
          })
          .eq('id', whiskyId)
      }
    } catch {
      console.error('Average rating update error:')
    }
  }
}

export const whiskyManager = new WhiskyManager()