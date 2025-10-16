import { supabase } from './supabase'

/**
 * 사용자 프로필 기능을 위한 Supabase 헬퍼 함수들
 */

export interface UserProfile {
  id: string
  nickname: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

// 현재 로그인한 사용자의 프로필 정보 가져오기
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('로그인되지 않음 - 프로필 없음')
      return null
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116은 "no rows returned" 에러
      console.error('프로필 가져오기 실패:', error)
      return null
    }

    if (!profile) {
      console.log('프로필이 없음 - 새로 생성 필요')
      return null
    }

    console.log('✅ 사용자 프로필 로드 성공:', profile.nickname)
    return profile
  } catch (error) {
    console.error('프로필 가져오기 중 오류:', error)
    return null
  }
}

// 사용자 프로필 생성 또는 업데이트 (upsert 사용)
export async function saveUserProfile(
  nickname: string,
  avatarUrl?: string
): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('로그인이 필요합니다')
      return false
    }

    if (!nickname.trim()) {
      console.error('닉네임을 입력해주세요')
      return false
    }

    const profileData: Partial<UserProfile> = {
      id: user.id,
      nickname: nickname.trim(),
      avatar_url: avatarUrl || undefined
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('프로필 저장 실패:', error)
      return false
    }

    console.log('✅ 프로필 저장 성공:', nickname)
    return true
  } catch (error) {
    console.error('프로필 저장 중 오류:', error)
    return false
  }
}

// 닉네임만 업데이트
export async function updateNickname(nickname: string): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('로그인이 필요합니다')
      return false
    }

    if (!nickname.trim()) {
      console.error('닉네임을 입력해주세요')
      return false
    }

    const { error } = await supabase
      .from('profiles')
      .update({ nickname: nickname.trim() })
      .eq('id', user.id)

    if (error) {
      console.error('닉네임 업데이트 실패:', error)
      return false
    }

    console.log('✅ 닉네임 업데이트 성공:', nickname)
    return true
  } catch (error) {
    console.error('닉네임 업데이트 중 오류:', error)
    return false
  }
}

// 프로필 이미지 URL만 업데이트
export async function updateAvatarUrl(avatarUrl: string): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('로그인이 필요합니다')
      return false
    }

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id)

    if (error) {
      console.error('프로필 이미지 URL 업데이트 실패:', error)
      return false
    }

    console.log('✅ 프로필 이미지 URL 업데이트 성공')
    return true
  } catch (error) {
    console.error('프로필 이미지 URL 업데이트 중 오류:', error)
    return false
  }
}

// 특정 사용자의 프로필 정보 가져오기 (공개용)
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('사용자 프로필 가져오기 실패:', error)
      return null
    }

    return profile
  } catch (error) {
    console.error('사용자 프로필 가져오기 중 오류:', error)
    return null
  }
}

// 닉네임 중복 확인
export async function checkNicknameAvailable(nickname: string, excludeUserId?: string): Promise<boolean> {
  try {
    if (!nickname.trim()) {
      return false
    }

    let query = supabase
      .from('profiles')
      .select('id')
      .eq('nickname', nickname.trim())

    // 현재 사용자는 제외 (닉네임 수정 시)
    if (excludeUserId) {
      query = query.neq('id', excludeUserId)
    }

    const { data, error } = await query

    if (error) {
      console.error('닉네임 중복 확인 실패:', error)
      return false
    }

    // 결과가 없으면 사용 가능
    return data.length === 0
  } catch (error) {
    console.error('닉네임 중복 확인 중 오류:', error)
    return false
  }
}

// 프로필 삭제
export async function deleteUserProfile(): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('로그인이 필요합니다')
      return false
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (error) {
      console.error('프로필 삭제 실패:', error)
      return false
    }

    console.log('✅ 프로필 삭제 성공')
    return true
  } catch (error) {
    console.error('프로필 삭제 중 오류:', error)
    return false
  }
}