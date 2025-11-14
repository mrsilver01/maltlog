'use client'

import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import { likeWhisky, unlikeWhisky, getUserWhiskyLikes } from '@/lib/likes'
import toast from 'react-hot-toast'

interface LikesContextType {
  liked: Set<string>
  isLiked: (whiskyId: string) => boolean
  toggle: (whiskyId: string) => Promise<void>
  isLoading: boolean
}

const LikesContext = createContext<LikesContextType | null>(null)

interface LikesProviderProps {
  userId?: string
  initialLikedIds: string[]
  children: React.ReactNode
}

/**
 * 전역 찜 상태 관리 Provider
 * - 초기 찜 ID 세트를 하이드레이션
 * - N+1 쿼리 방지를 위한 전역 상태 관리
 * - 옵티미스틱 업데이트 및 롤백 지원
 */
export function LikesProvider({ userId, initialLikedIds, children }: LikesProviderProps) {
  const [liked, setLiked] = useState(() => new Set(initialLikedIds))
  const [isLoading, setIsLoading] = useState(false)

  console.log('🎯 LikesProvider 초기화:', {
    userId,
    initialLikedCount: initialLikedIds.length,
    initialLikedIds: initialLikedIds.slice(0, 5) // 처음 5개만 로그
  })

  // userId 변경 시 찜 목록 재로딩
  useEffect(() => {
    if (!userId) {
      // 로그아웃 시 찜 목록 초기화
      setLiked(new Set())
      console.log('🔒 로그아웃으로 찜 목록 초기화')
      return
    }

    // 로그인된 사용자의 찜 목록을 새로 불러오기
    const loadUserLikes = async () => {
      try {
        console.log('🔄 사용자 변경으로 찜 목록 재로딩:', userId)
        const userLikedIds = await getUserWhiskyLikes(userId)
        setLiked(new Set(userLikedIds))
        console.log('✅ 찜 목록 재로딩 완료:', userLikedIds.length, '개')
      } catch (error) {
        console.error('❌ 찜 목록 재로딩 실패:', error)
        // 실패 시 초기 데이터로 폴백
        setLiked(new Set(initialLikedIds))
      }
    }

    // 초기 데이터와 비교해서 다르면 재로딩
    loadUserLikes()
  }, [userId, initialLikedIds])

  const isLiked = useCallback((whiskyId: string) => {
    return liked.has(whiskyId)
  }, [liked])

  const toggle = useCallback(async (whiskyId: string) => {
    if (!userId) {
      toast('로그인이 필요합니다.')
      return
    }

    const wasLiked = liked.has(whiskyId)

    console.log('🔄 찜 토글 시작:', { whiskyId, wasLiked, userId })

    // 옵티미스틱 업데이트
    setLiked(prev => {
      const next = new Set(prev)
      if (wasLiked) {
        next.delete(whiskyId)
      } else {
        next.add(whiskyId)
      }
      return next
    })

    setIsLoading(true)

    try {
      if (wasLiked) {
        await unlikeWhisky(userId, whiskyId)
        console.log('✅ 찜 취소 성공:', whiskyId)
      } else {
        await likeWhisky(userId, whiskyId)
        console.log('✅ 찜 추가 성공:', whiskyId)
      }
    } catch (error) {
      console.error('❌ 찜 토글 실패:', error)

      // 롤백
      setLiked(prev => {
        const next = new Set(prev)
        if (wasLiked) {
          next.add(whiskyId) // 원래 찜 상태로 복원
        } else {
          next.delete(whiskyId) // 원래 미찜 상태로 복원
        }
        return next
      })

      toast.error('찜 처리에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }, [userId, liked])

  const value = useMemo(() => ({
    liked,
    isLiked,
    toggle,
    isLoading
  }), [liked, isLiked, toggle, isLoading])

  return (
    <LikesContext.Provider value={value}>
      {children}
    </LikesContext.Provider>
  )
}

/**
 * 찜 상태 관리 훅
 * 카드 컴포넌트에서 개별 쿼리 없이 찜 상태를 확인할 수 있습니다.
 */
export function useLikes(): LikesContextType {
  const context = useContext(LikesContext)
  if (!context) {
    throw new Error('useLikes must be used within LikesProvider')
  }
  return context
}