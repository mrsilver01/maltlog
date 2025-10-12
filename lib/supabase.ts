// lib/supabase.ts

import { createClient } from '@supabase/supabase-js'

// .env.local 파일에서 환경 변수를 가져옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ============ DEBUG LOGGING: ADD THIS BLOCK ============
console.log('--- Supabase Client Initialization ---');
console.log('Attempting to create Supabase client.');
console.log('URL loaded:', !!supabaseUrl);
console.log('Anon Key loaded:', !!supabaseAnonKey);
// =======================================================

// 환경 변수가 없는 경우 에러를 발생시켜 설정 실수를 방지합니다.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are not defined in .env.local')
}

// 단일 Supabase 클라이언트를 생성하여 내보냅니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 참고: authHelpers는 별도 파일로 분리하거나 이대로 사용해도 무방합니다.
// 현재 구조에서는 큰 문제가 없으므로 그대로 두겠습니다.
export const authHelpers = {
    signUp: (email: string, password: string, nickname: string) => {
      return supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname,
          },
        },
      })
    },
  
    signIn: (email: string, password: string) => {
      return supabase.auth.signInWithPassword({ email, password })
    },
  
    signOut: () => {
      return supabase.auth.signOut()
    },
  
    getCurrentUser: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
  
    signInWithKakao: () => {
      return supabase.auth.signInWithOAuth({
        provider: 'kakao'
      })
    },
  }