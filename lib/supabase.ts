import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 디버깅을 위한 로그
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const authHelpers = {
  signUp: async (email: string, password: string, nickname: string) => {
    try {
      console.log('Attempting signup with:', { email, nickname })
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
      throw error
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      console.log('Attempting signin with:', { email })
      const result = await supabase.auth.signInWithPassword({
        email,
        password
      })
      console.log('Signin result:', result)
      return result
    } catch (error) {
      console.error('Signin error:', error)
      throw error
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
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}