/**
 * Admin 권한 가드 (서버 전용)
 *
 * Supabase의 `is_admin()` RPC는 auth.jwt()와 profiles.is_admin을 조합한
 * DB side source-of-truth. 이 가드 함수만을 사용해서 관리자 검증을 수행합니다.
 *
 * 기존 코드에서 (user as any).raw_app_meta_data?.role 형태의 보조 체크가
 * 산재해 있었으나, 타입 안전성이 없고 is_admin() RPC가 이미 같은 조건을
 * 포괄하므로 제거합니다.
 */

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import type { SupabaseClient, User } from '@supabase/supabase-js'

export async function getServerSupabase(): Promise<SupabaseClient> {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

/**
 * 관리자 권한 확인. 권한이 없으면 redirectTo로 이동합니다.
 * - is_admin() RPC 가 DB 최종 판정자
 * - user 객체를 함께 반환하여 호출부에서 활용 가능
 */
export async function requireAdmin(redirectTo: string = '/'): Promise<{
  user: User
  supabase: SupabaseClient
}> {
  const supabase = await getServerSupabase()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect(redirectTo)
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin')
  if (adminError || !isAdmin) {
    redirect(redirectTo)
  }

  return { user, supabase }
}

/**
 * 관리자 권한을 boolean으로만 확인 (redirect 하지 않음).
 * UI 렌더링 조건부 처리 용.
 */
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await getServerSupabase()
  const { data: isAdmin, error } = await supabase.rpc('is_admin')
  if (error) return false
  return Boolean(isAdmin)
}

/**
 * Server Action 용 admin 가드.
 * 권한이 없으면 FORBIDDEN Error를 throw합니다. (redirect X, 호출부가 결정)
 */
export async function assertAdmin(): Promise<{
  user: User
  supabase: SupabaseClient
}> {
  const supabase = await getServerSupabase()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('FORBIDDEN')
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin')
  if (adminError || !isAdmin) {
    throw new Error('FORBIDDEN')
  }

  return { user, supabase }
}
