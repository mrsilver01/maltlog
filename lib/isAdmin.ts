import { supabase } from './supabase'

export function isAdmin(user: any): boolean {
  if (!user) return false

  // 특정 이메일만 관리자로 제한
  const adminEmail = 'mingi1001114@gmail.com'
  if (user.email !== adminEmail) return false

  const role = user.raw_app_meta_data?.role || user.role
  return role === 'admin'
}

// 서버에서 DB 기반으로 관리자 권한 확인
export async function isAdminServer(): Promise<boolean> {
  try {
    const { data: ok, error } = await supabase.rpc('is_admin')
    if (error) {
      console.error('관리자 권한 확인 실패:', error)
      return false
    }
    return Boolean(ok)
  } catch (error) {
    console.error('관리자 권한 확인 중 오류:', error)
    return false
  }
}