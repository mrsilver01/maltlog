export function isAdmin(user: any): boolean {
  if (!user) return false

  const role = user.raw_app_meta_data?.role || user.role
  return role === 'admin'
}