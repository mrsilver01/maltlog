'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionMessage, setTransitionMessage] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  const navigateWithTransition = (path: string, message: string = "페이지를 불러오는 중...") => {
    setTransitionMessage(message)
    setIsTransitioning(true)

    // 즉시 네비게이션 실행
    router.push(path)
  }

  // URL이 변경되면 애니메이션 종료
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [pathname, isTransitioning])

  return {
    isTransitioning,
    transitionMessage,
    navigateWithTransition
  }
}