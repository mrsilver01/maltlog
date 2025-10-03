'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingAnimation from '../components/LoadingAnimation'
import { WhiskyCardSkeleton, HeaderSkeleton } from '../components/Skeleton'
import { usePageTransition } from '../hooks/usePageTransition'
import DrawerSidebar from '../components/DrawerSidebar'
import { whiskeyDatabase, WhiskyData, addLike, removeLike, loadWhiskyDataFromStorage } from '../lib/whiskyData'
import { authHelpers } from '../lib/supabase'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [whiskies, setWhiskies] = useState<WhiskyData[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAllWhiskies, setShowAllWhiskies] = useState(false)
  const router = useRouter()
  const { isTransitioning, transitionMessage, navigateWithTransition } = usePageTransition()

  // 초기 로딩 및 위스키 데이터 로드
  useEffect(() => {
    const timer = setTimeout(() => {
      // localStorage에서 데이터 로드
      loadWhiskyDataFromStorage()
      const whiskyArray = Object.values(whiskeyDatabase)
      setWhiskies(whiskyArray)

      // 로그인 상태 확인
      const loginStatus = localStorage.getItem('isLoggedIn') === 'true'
      setIsLoggedIn(loginStatus)

      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      await authHelpers.signOut()
      setIsLoggedIn(false)
      alert('로그아웃되었습니다.')
      // 페이지 새로고침으로 모든 상태 초기화
      window.location.reload()
    } catch (error: any) {
      alert('로그아웃 오류: ' + error.message)
    }
  }


  // 초기 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-rose-50 p-6">
        <HeaderSkeleton />

        <div className="mb-6">
          <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <section className="mb-12">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <WhiskyCardSkeleton key={i} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <WhiskyCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50 p-6">
      {/* 페이지 전환 애니메이션 */}
      {isTransitioning && (
        <LoadingAnimation message={transitionMessage} />
      )}
      <div className="flex">
        {/* 메인 콘텐츠 */}
        <div className="flex-1">
          {/* 헤더 */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                {/* 로고 이미지 */}
                <div className="w-12 h-16 flex items-center justify-center">
                  <img
                    src="/whiskies/LOGO.png"
                    alt="Maltlog Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <h1 className="text-4xl font-bold text-amber-800 font-[family-name:var(--font-jolly-lodger)]">Maltlog</h1>
              </div>
              <span className="text-base text-gray-500 ml-4">몰트로그, 위스키의 모든 기록</span>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-xl font-bold text-red-500 font-[family-name:var(--font-jolly-lodger)]">HOME</span>
              <button
                onClick={() => navigateWithTransition('/profile', '프로필 페이지로 이동 중...')}
                className="text-center hover:text-gray-600 transition-all duration-200 hover:scale-110 transform"
              >
                <div className="text-lg font-bold text-gray-800 font-[family-name:var(--font-jolly-lodger)] hover:text-red-500 transition-colors">PROFILE/</div>
                <div className="text-xs text-gray-600">내 노트 보러가기</div>
              </button>
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {typeof window !== 'undefined' ? localStorage.getItem('userNickname') : ''}님
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-600 text-white px-5 py-2 rounded-full text-sm hover:bg-gray-500 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigateWithTransition('/login', '로그인 페이지로 이동 중...')}
                  className="bg-amber-900 text-white px-5 py-2 rounded-full text-sm hover:bg-amber-800 transition-colors"
                >
                  로그인
                </button>
              )}
              {/* 햄버거 메뉴 */}
              <div className="flex flex-col gap-1">
                <div className="w-5 h-0.5 bg-gray-600"></div>
                <div className="w-5 h-0.5 bg-gray-600"></div>
                <div className="w-5 h-0.5 bg-gray-600"></div>
              </div>
            </div>
          </header>

          {/* 유행 위스키 섹션 - 검색창 오른쪽으로 이동 */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                {!showAllWhiskies && (
                  <h2 className="text-lg font-bold text-gray-800">유행 위스키 (9월 기준)</h2>
                )}
                {showAllWhiskies && (
                  <h2 className="text-lg font-bold text-gray-800">모든 위스키</h2>
                )}
                <button
                  onClick={() => setShowAllWhiskies(!showAllWhiskies)}
                  className="text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
                >
                  {showAllWhiskies ? '돌아가기' : '모두 보기'}
                </button>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-rose-400 px-4 py-2 text-sm bg-rose-50 rounded-lg w-40 focus:outline-none focus:border-rose-600 placeholder-rose-600 text-rose-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-6">
              {(showAllWhiskies ? whiskies : whiskies.slice(0, 4)).map((whisky) => (
                <WhiskyCard key={whisky.id} whisky={whisky} router={router} navigateWithTransition={navigateWithTransition} />
              ))}
            </div>
          </section>

          {/* 추천 섹션 - 모두 보기 시 숨김 */}
          {!showAllWhiskies && (
            <section className="mb-12">
              <h2 className="text-lg font-bold text-gray-800 mb-6">추천</h2>
              <div className="grid grid-cols-4 gap-6">
                {whiskies.slice(4, 8).map((whisky) => (
                  <WhiskyCard key={whisky.id} whisky={whisky} router={router} navigateWithTransition={navigateWithTransition} />
                ))}
              </div>
            </section>
          )}

          {/* 커뮤니티 섹션 - 모두 보기 시 숨김 */}
          {!showAllWhiskies && (
            <section>
              <div className="flex items-center gap-8 mb-6">
                <h2
                  className="text-xl font-bold text-red-500 hover:scale-110 transition-all duration-200 transform cursor-pointer"
                  onClick={() => navigateWithTransition('/community', '커뮤니티로 이동 중...')}
                >
                  COMMUNITY
                </h2>
                <span
                  className="text-lg font-bold text-gray-800 hover:text-red-600 hover:scale-110 transition-all duration-200 transform cursor-pointer"
                  onClick={() => navigateWithTransition('/community', '커뮤니티로 이동 중...')}
                >
                  바로가기
                </span>
              </div>

              <CommunityPreview navigateWithTransition={navigateWithTransition} />
            </section>
          )}
        </div>

        {/* 서랍장 스타일 사이드바 */}
        <DrawerSidebar />
      </div>
    </div>
  )
}

function WhiskyCard({ whisky, router, navigateWithTransition }: { whisky: WhiskyData, router: any, navigateWithTransition: any }) {
  const [currentLikes, setCurrentLikes] = useState(whisky.likes)
  const [isLikeHovered, setIsLikeHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  // 컴포넌트 마운트 시와 로그인 상태 변경 시 찜 상태 설정
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      if (isLoggedIn) {
        const likedWhiskies = JSON.parse(localStorage.getItem('likedWhiskies') || '{}')
        setIsLiked(likedWhiskies[whisky.id] || false)
      } else {
        // 로그아웃 상태면 찜 상태를 false로 설정
        setIsLiked(false)
      }
    }
  }, [whisky.id])

  // 로그인 상태 변경을 감지하기 위한 효과
  useEffect(() => {
    const handleStorageChange = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      if (!isLoggedIn) {
        setIsLiked(false)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleClick = () => {
    navigateWithTransition(`/whisky/${whisky.id}`, `${whisky.name} 상세 정보를 불러오는 중...`)
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    // 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

    if (!isLoggedIn) {
      alert('찜 기능을 사용하려면 로그인해주세요.')
      return
    }

    if (isLiked) {
      // 찜 취소
      removeLike(whisky.id)
      setCurrentLikes(currentLikes - 1)
      setIsLiked(false)

      // 로컬스토리지에서 제거
      if (typeof window !== 'undefined') {
        const likedWhiskies = JSON.parse(localStorage.getItem('likedWhiskies') || '{}')
        delete likedWhiskies[whisky.id]
        localStorage.setItem('likedWhiskies', JSON.stringify(likedWhiskies))
      }
    } else {
      // 찜 추가
      addLike(whisky.id)
      setCurrentLikes(currentLikes + 1)
      setIsLiked(true)

      // 로컬스토리지에 저장
      if (typeof window !== 'undefined') {
        const likedWhiskies = JSON.parse(localStorage.getItem('likedWhiskies') || '{}')
        likedWhiskies[whisky.id] = true
        localStorage.setItem('likedWhiskies', JSON.stringify(likedWhiskies))
      }
    }
  }

  return (
    <div className="bg-white rounded border border-gray-200 p-3 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* 위스키 이미지/글래스 영역 */}
      <div className="h-40 mb-3 bg-gray-100 rounded flex items-center justify-center relative">
        <img
          src={whisky.image}
          alt={whisky.name}
          className="max-w-full max-h-full object-contain"
        />

        {/* 추천해요 버튼 */}
        <button
          className={`absolute bottom-0 left-0 right-0 py-1 px-2 flex items-center justify-between text-xs transition-all duration-200 ${
            isLiked
              ? 'bg-red-500 text-white'
              : isLikeHovered
              ? 'bg-black text-white'
              : 'bg-gray-300 text-white hover:bg-gray-400'
          }`}
          onMouseEnter={() => setIsLikeHovered(true)}
          onMouseLeave={() => setIsLikeHovered(false)}
          onClick={handleLikeClick}
        >
          <div className="flex items-center gap-1">
            <span className="text-xs">🥃</span>
            <span className="font-bold">찜</span>
          </div>
          <span className="font-bold">{currentLikes}</span>
        </button>
      </div>

      {/* 위스키 이름 - 모든 위스키에 표시 */}
      <button
        className="text-sm font-bold mb-2 hover:scale-110 transition-all duration-200 cursor-pointer block w-full text-gray-600 hover:text-red-600"
        onClick={handleClick}
      >
        {whisky.name}
      </button>

      {/* 평점 */}
      <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
        <span>평균</span>
        <span className="text-yellow-400">⭐</span>
        <span>{whisky.avgRating > 0 ? whisky.avgRating : '-'}</span>
      </div>
    </div>
  )
}

// 커뮤니티 미리보기 컴포넌트
function CommunityPreview({ navigateWithTransition }: { navigateWithTransition: any }) {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    // localStorage에서 커뮤니티 게시글 로드
    const savedPosts = localStorage.getItem('communityPosts')
    if (savedPosts) {
      const parsedPosts = JSON.parse(savedPosts)
      setPosts(parsedPosts.slice(0, 3)) // 최대 3개만 표시
    } else {
      // 초기 더미 데이터
      const initialPosts = [
        {
          id: '1',
          title: '오늘 마신 맥켈란 18년 후기',
          author: 'WhiskyLover',
          createdAt: new Date().toISOString(),
          likes: 5,
          comments: 3
        },
        {
          id: '2',
          title: '위스키 입문자를 위한 추천',
          author: 'MaltExpert',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          likes: 12,
          comments: 8
        }
      ]
      setPosts(initialPosts)
      localStorage.setItem('communityPosts', JSON.stringify(initialPosts))
    }
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return '방금 전'
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`
    } else {
      return date.toLocaleDateString('ko-KR')
    }
  }

  return (
    <div className="bg-red-100 border border-gray-400 p-6 rounded-lg">
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-4 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200"
              onClick={() => navigateWithTransition(`/community/post/${post.id}`, '게시글로 이동 중...')}
            >
              <h4 className="font-medium text-gray-800 mb-2 line-clamp-1">{post.title}</h4>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <span>{post.author}</span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="text-center pt-2">
            <button
              onClick={() => navigateWithTransition('/community', '커뮤니티로 이동 중...')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              더 많은 게시글 보기 →
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <span className="text-sm text-gray-600">아직 게시글이 없습니다.</span>
          <div className="mt-2">
            <button
              onClick={() => navigateWithTransition('/community', '커뮤니티로 이동 중...')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              커뮤니티 둘러보기 →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}