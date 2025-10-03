'use client'

import React, { useState, useEffect } from 'react'
import { whiskyManager } from '../lib/whiskyManager'
import { authHelpers } from '../lib/supabase'

interface RatingSystemProps {
  whiskyId: string
  currentRating?: number
  onRatingChange?: (rating: number) => void
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  readOnly?: boolean
}

export default function RatingSystem({
  whiskyId,
  currentRating = 0,
  onRatingChange,
  showLabels = true,
  size = 'md',
  interactive = true,
  readOnly = false
}: RatingSystemProps) {
  const [rating, setRating] = useState(currentRating)

  // readOnly일 때 currentRating 변경 감지
  useEffect(() => {
    if (readOnly) {
      setRating(currentRating)
    }
  }, [currentRating, readOnly])
  const [hoverRating, setHoverRating] = useState(0)
  const [user, setUser] = useState<{ id: string; user_metadata?: { nickname?: string } } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSaveButton, setShowSaveButton] = useState(false)

  // 사이즈별 스타일
  const sizeStyles = {
    sm: { star: 'text-lg', container: 'gap-1' },
    md: { star: 'text-2xl', container: 'gap-2' },
    lg: { star: 'text-3xl', container: 'gap-3' }
  }

  const styles = sizeStyles[size]

  // 사용자 인증 확인
  useEffect(() => {
    const getUser = async () => {
      const currentUser = await authHelpers.getCurrentUser()
      setUser(currentUser)

      // 기존 사용자 별점 불러오기
      if (currentUser && whiskyId) {
        const userRating = await whiskyManager.getUserRating(currentUser.id, whiskyId)
        if (userRating !== null) {
          setRating(userRating)
        }
      }
    }

    getUser()
  }, [whiskyId])

  // 별점 클릭 (바로 저장)
  const handleRatingClick = async (newRating: number) => {
    if (!interactive || readOnly) return

    // 로그인 확인
    const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true'
    if (!isLoggedIn) {
      alert('별점을 주려면 로그인해주세요.')
      return
    }

    setRating(newRating)

    // 바로 저장 처리
    if (onRatingChange) {
      onRatingChange(newRating)
    }
  }

  // 별점 저장
  const handleSaveRating = async () => {
    // 로그인 확인
    const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true'
    if (!isLoggedIn) {
      alert('별점을 저장하려면 로그인해주세요.')
      return
    }

    setLoading(true)
    try {
      if (user) {
        // 로그인한 사용자는 데이터베이스에 저장
        const result = await whiskyManager.saveUserRating(user.id, whiskyId, rating)
        if (result.success) {
          onRatingChange?.(rating)
          setShowSaveButton(false)
        } else {
          alert('별점 저장에 실패했습니다.')
        }
      } else {
        // 로그인하지 않은 사용자는 로그인 요청
        alert('별점을 저장하려면 로그인해주세요.')
      }
    } catch {
      alert('별점 저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 마우스 위치에 따른 별점 계산 (0.5 단위)
  const getStarRating = (starIndex: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const starWidth = rect.width
    const halfStar = x < starWidth / 2
    return halfStar ? starIndex - 0.5 : starIndex
  }

  // 별점 라벨
  const getRatingLabel = (rating: number): string => {
    const labels = {
      1: '별로예요',
      2: '그저그래요',
      3: '괜찮아요',
      4: '좋아요',
      5: '최고예요'
    }
    return labels[rating as keyof typeof labels] || ''
  }

  const displayRating = hoverRating || rating

  // 별 렌더링 함수 (반별 지원)
  const renderStar = (starIndex: number, currentRating: number) => {
    const filled = currentRating >= starIndex
    const halfFilled = currentRating >= starIndex - 0.5 && currentRating < starIndex

    if (filled) {
      return (
        <span className="relative">
          <span className="text-amber-500">★</span>
        </span>
      )
    } else if (halfFilled) {
      return (
        <span className="relative">
          <span className="text-gray-300">☆</span>
          <span
            className="absolute inset-0 text-amber-500 overflow-hidden"
            style={{ width: '50%' }}
          >
            ★
          </span>
        </span>
      )
    } else {
      return <span className="text-gray-300">☆</span>
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* 별점 표시 */}
      <div className={`flex ${styles.container} mb-2 relative`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={(e) => handleRatingClick(getStarRating(star, e))}
            onMouseMove={(e) => {
              if (interactive && !readOnly) {
                const newRating = getStarRating(star, e)
                setHoverRating(newRating)
              }
            }}
            onMouseLeave={() => interactive && !readOnly && setHoverRating(0)}
            disabled={loading || !interactive || readOnly}
            className={`
              ${styles.star}
              transition-all duration-200 relative
              ${interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}
              ${loading ? 'opacity-50' : ''}
            `}
          >
            {renderStar(star, displayRating)}
          </button>
        ))}

        {/* 호버 시 숫자 표시 */}
        {interactive && hoverRating > 0 && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm">
            {hoverRating}
          </div>
        )}
      </div>

      {/* 별점 라벨 */}
      {showLabels && (
        <div className="text-center">
          {displayRating > 0 && (
            <div className="text-sm text-amber-700 font-medium">
              {getRatingLabel(Math.floor(displayRating))} ({displayRating}점)
            </div>
          )}
          {!user && interactive && displayRating === 0 && (
            <div className="text-xs text-gray-500 mt-1">
              별점을 매겨보세요
            </div>
          )}
          {loading && (
            <div className="text-xs text-amber-600 mt-1">
              저장 중...
            </div>
          )}
        </div>
      )}

      {/* 저장 버튼 */}
      {showSaveButton && (
        <button
          onClick={handleSaveRating}
          disabled={loading}
          className="mt-3 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {loading ? '저장 중...' : '별점 저장'}
        </button>
      )}
    </div>
  )
}

// 간단한 별점 표시 컴포넌트 (읽기 전용)
export function RatingDisplay({
  rating,
  size = 'sm'
}: {
  rating: number
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <RatingSystem
      whiskyId=""
      currentRating={rating}
      interactive={false}
      showLabels={false}
      size={size}
    />
  )
}