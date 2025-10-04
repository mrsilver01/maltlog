import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// 디버깅을 위한 로그
console.log('Supabase URL:', supabaseUrl !== 'https://placeholder.supabase.co' ? 'Set' : 'Missing')
console.log('Supabase Key:', supabaseAnonKey !== 'placeholder-key' ? 'Set' : 'Missing')

const hasValidConfig = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key'

if (!hasValidConfig) {
  console.error('Supabase configuration missing! Using localStorage fallback.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const authHelpers = {
  signUp: async (email: string, password: string, nickname: string) => {
    console.log('Using localStorage-only authentication for signup')

    // 기존 사용자 확인
    const existingUser = localStorage.getItem(`user_${email}`)
    if (existingUser) {
      return {
        data: null,
        error: { message: '이미 등록된 이메일입니다.' }
      }
    }

    // 새 사용자 생성
    const userData = {
      email,
      password,
      nickname,
      id: Date.now().toString(),
      user_metadata: { nickname }
    }

    localStorage.setItem(`user_${email}`, JSON.stringify(userData))
    console.log('User created successfully in localStorage')

    return { data: { user: userData }, error: null }
  },

  signIn: async (email: string, password: string) => {
    console.log('Using localStorage-only authentication for signin')

    const userData = localStorage.getItem(`user_${email}`)
    if (!userData) {
      return {
        data: null,
        error: { message: '등록되지 않은 이메일입니다.' }
      }
    }

    const user = JSON.parse(userData)
    if (user.password !== password) {
      return {
        data: null,
        error: { message: '비밀번호가 일치하지 않습니다.' }
      }
    }

    console.log('User signed in successfully')
    return { data: { user }, error: null }
  },

  signOut: async () => {
    console.log('Using localStorage-only authentication for signout')

    // localStorage 초기화
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userNickname')
      localStorage.removeItem('userRatings')
    }

    return { error: null }
  },

  getCurrentUser: async () => {
    console.log('Using localStorage-only authentication for getCurrentUser')

    const email = localStorage.getItem('userEmail')
    if (!email) {
      return null
    }

    const userData = localStorage.getItem(`user_${email}`)
    if (!userData) {
      return null
    }

    return JSON.parse(userData)
  }
}