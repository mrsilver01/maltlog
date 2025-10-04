import { createClient } from '@supabase/supabase-js'

// 1. 환경변수 불러오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 환경변수 확인
const hasValidConfig = supabaseUrl && supabaseAnonKey && supabaseUrl !== ''

// 2. Supabase 클라이언트 생성 (환경변수가 있을 때만)
export const supabase = hasValidConfig ? createClient(supabaseUrl, supabaseAnonKey) : null

// 간단한 해시 함수 (실제 프로덕션에서는 bcrypt 등을 사용해야 함)
const simpleHash = (text: string): string => {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 32bit 정수로 변환
  }
  return hash.toString()
}

// 3. Supabase의 기본 함수를 사용하는 authHelpers
export const authHelpers = {
  // 회원가입
  signUp: async (email: string, password: string, nickname: string) => {
    if (supabase && hasValidConfig) {
      return supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname, // 닉네임은 options.data에 담아 보냅니다.
          },
        },
      })
    } else {
      // Fallback: localStorage with hashed password
      console.warn('Supabase not configured, using fallback localStorage authentication')

      const existingUser = localStorage.getItem(`user_${email}`)
      if (existingUser) {
        return {
          data: null,
          error: { message: '이미 등록된 이메일입니다.' }
        }
      }

      const hashedPassword = simpleHash(password)
      const userData = {
        email,
        nickname,
        id: Date.now().toString(),
        user_metadata: { nickname }
      }

      localStorage.setItem(`user_${email}`, JSON.stringify({ ...userData, passwordHash: hashedPassword }))
      return { data: { user: userData }, error: null }
    }
  },

  // 이메일 로그인
  signIn: async (email: string, password: string) => {
    if (supabase && hasValidConfig) {
      return supabase.auth.signInWithPassword({ email, password })
    } else {
      // Fallback: localStorage with hashed password
      console.warn('Supabase not configured, using fallback localStorage authentication')

      const userData = localStorage.getItem(`user_${email}`)
      if (!userData) {
        return {
          data: null,
          error: { message: '등록되지 않은 이메일입니다.' }
        }
      }

      const user = JSON.parse(userData)
      const hashedPassword = simpleHash(password)

      if (user.passwordHash !== hashedPassword) {
        return {
          data: null,
          error: { message: '비밀번호가 일치하지 않습니다.' }
        }
      }

      // 로그인 상태 저장
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userEmail', email)
      localStorage.setItem('userNickname', user.nickname)

      return { data: { user }, error: null }
    }
  },

  // 로그아웃
  signOut: async () => {
    if (supabase && hasValidConfig) {
      return supabase.auth.signOut()
    } else {
      // Fallback: localStorage cleanup
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userNickname')
      localStorage.removeItem('userProfileImage')
      return { error: null }
    }
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser: async () => {
    if (supabase && hasValidConfig) {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } else {
      // Fallback: localStorage user
      const email = localStorage.getItem('userEmail')
      if (!email) return null

      const userData = localStorage.getItem(`user_${email}`)
      if (!userData) return null

      return JSON.parse(userData)
    }
  },

  // 카카오 로그인
  signInWithKakao: () => {
    if (supabase && hasValidConfig) {
      return supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          // 로그인 완료 후 돌아올 페이지를 홈페이지('/')로 설정합니다.
          redirectTo: `${window.location.origin}/`,
        },
      })
    } else {
      return {
        data: null,
        error: { message: 'Supabase가 설정되지 않아 카카오 로그인을 사용할 수 없습니다. 이메일 로그인을 사용해주세요.' }
      }
    }
  },
}