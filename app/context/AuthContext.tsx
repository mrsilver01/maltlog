'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { getCurrentUserProfile, saveUserProfile, UserProfile } from '../../lib/userProfiles'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signInWithKakao: () => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, nickname: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Update profile info
  const updateProfile = async () => {
    if (user) {
      try {
        const userProfile = await getCurrentUserProfile()
        setProfile(userProfile)
      } catch (error) {
        console.error('Profile update failed:', error)
      }
    }
  }

  // Initialize auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          try {
            const userProfile = await getCurrentUserProfile()
            setProfile(userProfile)
          } catch (error) {
            console.error('Profile load failed:', error)
            setProfile(null)
          }
        } else {
          setProfile(null)
        }

        // 인증 상태가 처음 확정되면 로딩 종료
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Login error occurred.' }
    }
  }

  const signInWithKakao = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao'
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Kakao login error occurred.' }
    }
  }

  const signUp = async (email: string, password: string, nickname: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        await saveUserProfile(nickname)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Signup error occurred.' }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signInWithKakao,
    signUp,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}