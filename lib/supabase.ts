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
    try {
      console.log('Attempting signup with:', { email, nickname })

      // Fallback to localStorage if Supabase fails
      if (!hasValidConfig) {
        console.log('Using localStorage fallback for signup')
        const userData = { email, password, nickname, id: Date.now().toString() }
        localStorage.setItem(`user_${email}`, JSON.stringify(userData))
        return { data: { user: userData }, error: null }
      }

      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nickname }
        }
      })
      console.log('Signup result:', result)
      return result
    } catch (error) {
      console.error('Signup error:', error)
      // Fallback to localStorage
      console.log('Using localStorage fallback for signup')
      const userData = { email, password, nickname, id: Date.now().toString() }
      localStorage.setItem(`user_${email}`, JSON.stringify(userData))
      return { data: { user: userData }, error: null }
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      console.log('Attempting signin with:', { email })

      // Fallback to localStorage if Supabase fails
      if (!hasValidConfig) {
        console.log('Using localStorage fallback for signin')
        const userData = localStorage.getItem(`user_${email}`)
        if (userData) {
          const user = JSON.parse(userData)
          if (user.password === password) {
            return { data: { user }, error: null }
          } else {
            return { data: null, error: { message: '비밀번호가 일치하지 않습니다.' } }
          }
        } else {
          return { data: null, error: { message: '등록되지 않은 이메일입니다.' } }
        }
      }

      const result = await supabase.auth.signInWithPassword({
        email,
        password
      })
      console.log('Signin result:', result)
      return result
    } catch (error) {
      console.error('Signin error:', error)
      // Fallback to localStorage
      console.log('Using localStorage fallback for signin')
      const userData = localStorage.getItem(`user_${email}`)
      if (userData) {
        const user = JSON.parse(userData)
        if (user.password === password) {
          return { data: { user }, error: null }
        } else {
          return { data: null, error: { message: '비밀번호가 일치하지 않습니다.' } }
        }
      } else {
        return { data: null, error: { message: '등록되지 않은 이메일입니다.' } }
      }
    }
  },

  signOut: async () => {
    const result = await supabase.auth.signOut()
    // localStorage 초기화
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userNickname')
      localStorage.removeItem('userRatings')
    }
    return result
  },

  getCurrentUser: async () => {
    try {
      if (!hasValidConfig) {
        // localStorage fallback
        const email = localStorage.getItem('userEmail')
        if (email) {
          const userData = localStorage.getItem(`user_${email}`)
          if (userData) {
            return JSON.parse(userData)
          }
        }
        return null
      }

      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      // localStorage fallback
      const email = localStorage.getItem('userEmail')
      if (email) {
        const userData = localStorage.getItem(`user_${email}`)
        if (userData) {
          return JSON.parse(userData)
        }
      }
      return null
    }
  }
}