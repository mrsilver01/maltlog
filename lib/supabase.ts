import { createClient } from '@supabase/supabase-js'

// 1. 환경변수 불러오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 2. Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 3. Supabase의 기본 함수를 사용하는 authHelpers
export const authHelpers = {
  // 회원가입
  signUp: (email: string, password: string, nickname: string) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname, // 닉네임은 options.data에 담아 보냅니다.
        },
      },
    })
  },

  // 이메일 로그인
  signIn: (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password })
  },

  // 로그아웃
  signOut: () => {
    return supabase.auth.signOut()
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // 카카오 로그인
  signInWithKakao: () => {
    return supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        // 로그인 완료 후 돌아올 페이지를 홈페이지('/')로 설정합니다.
        redirectTo: `${window.location.origin}/`,
      },
    })
  },
}