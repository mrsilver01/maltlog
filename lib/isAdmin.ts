export function isAdmin(user: any): boolean {
  if (!user) return false

  // 특정 이메일만 관리자로 제한
  const adminEmail = 'mingi1001114@gmail.com'
  if (user.email !== adminEmail) return false

  const role = user.raw_app_meta_data?.role || user.role
  return role === 'admin'
}