'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'
import { getCurrentUserProfile, UserProfile, saveUserProfile } from '@/lib/userProfiles'

export interface AuthCredentials {
  email?: string
  password?: string
  nickname?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (credentials: AuthCredentials) => Promise<void>
  signUp: (credentials: AuthCredentials) => Promise<void>
  signOut: () => Promise<void>
  signInWithKakao: () => Promise<void>
  updateProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        if (session?.user) {
          const userProfile = await getCurrentUserProfile()
          setProfile(userProfile)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error('인증 초기화 중 에러 발생:', error)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        try {
          const userProfile = await getCurrentUserProfile()
          setProfile(userProfile)
        } catch (error) {
          console.error('인증 상태 변경 중 프로필 로드 에러:', error)
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (credentials: AuthCredentials) => {
    if (!credentials.email || !credentials.password) throw new Error('이메일과 비밀번호를 입력해주세요.')
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (credentials: AuthCredentials) => {
    if (!credentials.email || !credentials.password || !credentials.nickname) throw new Error('이메일, 비밀번호, 닉네임을 모두 입력해주세요.')
    const { error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: { data: { nickname: credentials.nickname } },
    })
    if (error) throw error
    // DB 트리거(handle_new_user)가 자동으로 프로필 생성
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const signInWithKakao = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  }, [])

  const updateProfile = useCallback(async () => {
    if (user) {
      const userProfile = await getCurrentUserProfile()
      setProfile(userProfile)
    }
  }, [user])

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithKakao,
    updateProfile,
  }), [user, profile, loading, signIn, signUp, signOut, signInWithKakao, updateProfile])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}