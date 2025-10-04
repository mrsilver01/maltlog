'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionMessage, setTransitionMessage] = useState("")
  const router = useRouter()

  const navigateWithTransition = (path: string, message: string = "페이지를 불러오는 중...") => {
    setTransitionMessage(message)
    setIsTransitioning(true)

    // 애니메이션 시간 후 실제 네비게이션 (4.2초 완전한 애니메이션)
    setTimeout(() => {
      router.push(path)
      // 페이지 로드 후 애니메이션 종료
      setTimeout(() => {
        setIsTransitioning(false)
      }, 100)
    }, 4200)
  }

  return {
    isTransitioning,
    transitionMessage,
    navigateWithTransition
  }
}