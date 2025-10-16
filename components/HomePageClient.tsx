'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingAnimation from './LoadingAnimation'
import { usePageTransition } from '../hooks/usePageTransition'
import DrawerSidebar from './DrawerSidebar'
import { getUserWhiskyLikes, addWhiskyLike, removeWhiskyLike, isWhiskyLiked } from '../lib/whiskyLikes'
import { useAuth } from '../app/context/AuthContext'
import toast from 'react-hot-toast'

export interface WhiskyData {
  id: string
  name: string
  image: string
  abv: string
  region: string
  price: string
  cask: string
  avgRating: number
  totalReviews: number
  likes: number
  distillery?: string
  created_at?: string
  updated_at?: string
}

interface HomePageClientProps {
  initialWhiskies: WhiskyData[]
}

export default function HomePageClient({ initialWhiskies }: HomePageClientProps) {
  const { user, profile, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [whiskies, setWhiskies] = useState<WhiskyData[]>(initialWhiskies)
  const [hasLoadedMore, setHasLoadedMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showAllWhiskies, setShowAllWhiskies] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const router = useRouter()
  const { isTransitioning, transitionMessage, navigateWithTransition } = usePageTransition()

  // 검색된 위스키 목록
  const filteredWhiskies = whiskies.filter(whisky => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase().trim()
    return (
      whisky.name.toLowerCase().includes(query) ||
      whisky.region.toLowerCase().includes(query) ||
      whisky.cask.toLowerCase().includes(query) ||
      whisky.abv.toLowerCase().includes(query) ||
      whisky.price.toLowerCase().includes(query)
    )
  })

  // 모바일 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as HTMLElement
        if (!target.closest('[data-mobile-menu]') && !target.closest('[data-hamburger-button]')) {
          setIsMobileMenuOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen])

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('로그아웃되었습니다.')
    } catch (error: unknown) {
      toast.error('로그아웃 오류: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  // 더보기 기능
  const handleShowMore = async () => {
    setIsLoadingMore(true);
    try {
      const response = await fetch('/api/whiskies');
      if (!response.ok) {
        throw new Error('Failed to fetch more whiskies');
      }
      const additionalWhiskies = await response.json();
      setWhiskies(currentWhiskies => [...currentWhiskies, ...additionalWhiskies]);
      setHasLoadedMore(true);
    } catch (error) {
      console.error(error);
      toast.error('추가 위스키를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 p-3 sm:p-6">
      {/* 페이지 전환 애니메이션 */}
      {isTransitioning && (
        <LoadingAnimation message={transitionMessage} />
      )}
      <div className="flex">
        {/* 메인 콘텐츠 */}
        <div className="flex-1">
          {/* 헤더 */}
          <header className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
              <div className="flex items-center gap-2 sm:gap-4">
                {/* 글렌케언 글래스 로고 */}
                <div className="w-10 h-12 sm:w-12 sm:h-16 flex items-center justify-center">
                  <img
                    src="/whiskies/LOGO.png"
                    alt="Maltlog Logo"
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                  />
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold text-amber-800 font-[family-name:var(--font-jolly-lodger)]">Maltlog</h1>
              </div>
              <span className="text-sm sm:text-base text-gray-500 text-center sm:text-left sm:ml-4">몰트로그, 위스키의 모든 기록</span>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              <span className="text-lg sm:text-xl font-bold text-red-500 font-[family-name:var(--font-jolly-lodger)]">HOME</span>
              <button
                onClick={() => navigateWithTransition('/profile', '프로필 페이지로 이동 중...')}
                className="text-center hover:text-gray-600 transition-all duration-200 hover:scale-110 transform"
              >
                <div className="text-sm sm:text-lg font-bold text-gray-800 font-[family-name:var(--font-jolly-lodger)] hover:text-red-500 transition-colors">PROFILE/</div>
                <div className="text-xs text-gray-600 hidden sm:block">내 노트 보러가기</div>
              </button>
              {user ? (
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                    {profile?.nickname || user.email}님
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-600 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-gray-500 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigateWithTransition('/login', '로그인 페이지로 이동 중...')}
                  className="bg-amber-900 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-amber-800 transition-all duration-200 hover:scale-110 transform shadow-md hover:shadow-lg"
                >
                  로그인
                </button>
              )}

              {/* 햄버거 메뉴 버튼 */}
              <div className="relative">
                <button
                  data-hamburger-button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="flex flex-col gap-1 p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <div className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                  <div className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                  <div className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                </button>

                {/* 드롭다운 메뉴 - 버튼 바로 아래 */}
                {isMobileMenuOpen && (
                  <div data-mobile-menu className="absolute top-full right-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden z-50 w-40">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          navigateWithTransition('/community', '커뮤니티로 이동 중...')
                        }}
                        className="w-full text-left px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors hover:text-red-500"
                      >
                        COMMUNITY
                      </button>

                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          navigateWithTransition('/profile', '프로필 페이지로 이동 중...')
                        }}
                        className="w-full text-left px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors hover:text-red-500"
                      >
                        PROFILE
                      </button>

                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          navigateWithTransition('/profile', '내 노트로 이동 중...')
                        }}
                        className="w-full text-left px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors hover:text-red-500"
                      >
                        NOTES
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* 유행 위스키 섹션 - 검색창 오른쪽으로 이동 */}
          <section className="mb-8 sm:mb-12">
            {/* 모바일: 세로 레이아웃 */}
            <div className="flex flex-col gap-4 sm:hidden">
              {/* 제목 */}
              <div className="flex items-center justify-center gap-2">
                {!showAllWhiskies && !searchQuery.trim() && (
                  <h2 className="text-base font-bold text-gray-800 text-center">유행 위스키 (9월 기준)</h2>
                )}
                {showAllWhiskies && !searchQuery.trim() && (
                  <h2 className="text-base font-bold text-gray-800 text-center">모든 위스키</h2>
                )}
                {searchQuery.trim() && (
                  <h2 className="text-base font-bold text-gray-800 text-center">
                    &quot;{searchQuery}&quot; ({filteredWhiskies.length}개)
                  </h2>
                )}
              </div>

              {/* 검색창 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="위스키 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-rose-400 px-4 py-3 pr-10 text-sm bg-rose-50 rounded-lg w-full focus:outline-none focus:border-rose-600 focus:bg-white placeholder-rose-500 text-rose-800 transition-all duration-200"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rose-500">
                  🔍
                </div>
                {searchQuery.trim() && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-rose-400 hover:text-rose-600 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* 버튼들 */}
              <div className="flex justify-center gap-2">
                {!searchQuery.trim() && !hasLoadedMore && (
                  <button
                    onClick={handleShowMore}
                    disabled={isLoadingMore}
                    className="text-xs font-medium text-amber-700 hover:text-amber-800 transition-colors bg-amber-50 px-3 py-1.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? '로딩 중...' : '더보기'}
                  </button>
                )}
                {searchQuery.trim() && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-medium text-rose-700 hover:text-rose-800 transition-colors bg-rose-50 px-3 py-1.5 rounded-full"
                  >
                    검색 지우기
                  </button>
                )}
              </div>
            </div>

            {/* 데스크톱: 가로 레이아웃 */}
            <div className="hidden sm:flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                {!showAllWhiskies && !searchQuery.trim() && (
                  <h2 className="text-lg font-bold text-gray-800">유행 위스키 (9월 기준)</h2>
                )}
                {showAllWhiskies && !searchQuery.trim() && (
                  <h2 className="text-lg font-bold text-gray-800">모든 위스키</h2>
                )}
                {searchQuery.trim() && (
                  <h2 className="text-lg font-bold text-gray-800">
                    &quot;{searchQuery}&quot; 검색 결과 ({filteredWhiskies.length}개)
                  </h2>
                )}
                {!searchQuery.trim() && !hasLoadedMore && (
                  <button
                    onClick={handleShowMore}
                    disabled={isLoadingMore}
                    className="text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? '로딩 중...' : '더보기'}
                  </button>
                )}
                {searchQuery.trim() && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-sm font-medium text-rose-700 hover:text-rose-800 transition-colors"
                  >
                    검색 지우기
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="위스키 이름, 지역, 캐스크 등..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-rose-400 px-4 py-2 pr-10 text-sm bg-rose-50 rounded-lg w-64 focus:outline-none focus:border-rose-600 focus:bg-white placeholder-rose-500 text-rose-800 transition-all duration-200"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rose-500">
                  🔍
                </div>
                {searchQuery.trim() && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-rose-400 hover:text-rose-600 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            {/* 검색 결과가 없을 때 메시지 */}
            {searchQuery.trim() && filteredWhiskies.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">
                  &quot;{searchQuery}&quot;에 대한 검색 결과가 없습니다.
                </div>
                <div className="text-gray-400 text-sm">
                  다른 검색어를 시도해보세요.
                </div>
              </div>
            )}

            {/* 위스키 카드 그리드 */}
            {!(searchQuery.trim() && filteredWhiskies.length === 0) && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  {(() => {
                    let whiskiesToShow: WhiskyData[]
                    if (searchQuery.trim()) {
                      whiskiesToShow = filteredWhiskies
                    } else if (showAllWhiskies) {
                      // 페이지네이션 적용
                      const startIndex = (currentPage - 1) * itemsPerPage
                      const endIndex = startIndex + itemsPerPage
                      whiskiesToShow = filteredWhiskies.slice(startIndex, endIndex)
                    } else {
                      // 9월 추천 위스키 명단 - 더 유연한 키워드 매칭
                      const septemberRecommendationKeywords = [
                        ['글렌그란트', '아보랄리스'],
                        ['보모어', '18', '딥앤컴플렉스'],
                        ['카발란', '솔리스트', '비노바리끄'],
                        ['러셀', '리저브', '싱글배럴'],
                        ['글렌피딕', '12'], // 추가 후보
                        ['맥캘란', '12'], // 추가 후보
                        ['아드벡', '10'], // 추가 후보
                        ['라가불린', '16'] // 추가 후보
                      ];

                      whiskiesToShow = [];

                      // 각 키워드 조합으로 위스키 찾기
                      for (const keywords of septemberRecommendationKeywords) {
                        if (whiskiesToShow.length >= 8) break; // 최대 8개까지

                        const foundWhisky = filteredWhiskies.find(whisky =>
                          keywords.every(keyword =>
                            whisky.name.toLowerCase().includes(keyword.toLowerCase())
                          )
                        );

                        if (foundWhisky && !whiskiesToShow.some(w => w.id === foundWhisky.id)) {
                          whiskiesToShow.push(foundWhisky);
                        }
                      }

                      // 여전히 부족하면 평점이나 인기도 순으로 추가
                      if (whiskiesToShow.length < 8) {
                        const remainingWhiskies = filteredWhiskies
                          .filter(w => !whiskiesToShow.some(shown => shown.id === w.id))
                          .slice(0, 8 - whiskiesToShow.length);
                        whiskiesToShow.push(...remainingWhiskies);
                      }
                    }

                    return whiskiesToShow.map((whisky) => (
                      <WhiskyCard key={whisky.id} whisky={whisky} router={router} navigateWithTransition={navigateWithTransition} />
                    ))
                  })()}
                </div>

                {/* 페이지네이션 - 모두 보기일 때만 표시 */}
                {showAllWhiskies && !searchQuery.trim() && filteredWhiskies.length > itemsPerPage && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => {
                        setCurrentPage(Math.max(1, currentPage - 1))
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      이전
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: Math.ceil(filteredWhiskies.length / itemsPerPage) }, (_, i) => i + 1)
                        .slice(Math.max(0, currentPage - 3), Math.min(Math.ceil(filteredWhiskies.length / itemsPerPage), currentPage + 2))
                        .map((page) => (
                          <button
                            key={page}
                            onClick={() => {
                              setCurrentPage(page)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              page === currentPage
                                ? 'bg-rose-500 text-white'
                                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                    </div>

                    <button
                      onClick={() => {
                        setCurrentPage(Math.min(Math.ceil(filteredWhiskies.length / itemsPerPage), currentPage + 1))
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      disabled={currentPage === Math.ceil(filteredWhiskies.length / itemsPerPage)}
                      className="px-3 py-2 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      다음
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* 추천 섹션 - 모두 보기나 검색 시 숨김 */}
          {!showAllWhiskies && !searchQuery.trim() && (
            <section className="mb-12">
              <h2 className="text-lg font-bold text-gray-800 mb-6">추천</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {(() => {
                  // 이미지가 있는 위스키들을 우선적으로 표시
                  const whiskiesWithImages = whiskies.filter(whisky =>
                    whisky.image &&
                    !whisky.image.includes('no.pic') &&
                    whisky.image.trim() !== ''
                  );

                  // 이미지가 있는 위스키가 4개 미만이면 나머지로 채움
                  const recommendedWhiskies = whiskiesWithImages.length >= 4
                    ? whiskiesWithImages.slice(0, 4)
                    : [...whiskiesWithImages, ...whiskies.filter(w => !whiskiesWithImages.includes(w))].slice(0, 4);

                  return recommendedWhiskies.map((whisky) => (
                    <WhiskyCard key={whisky.id} whisky={whisky} router={router} navigateWithTransition={navigateWithTransition} />
                  ));
                })()}
              </div>
            </section>
          )}

          {/* 커뮤니티 섹션 - 모두 보기나 검색 시 숨김 */}
          {!showAllWhiskies && !searchQuery.trim() && (
            <section>
              <div className="flex flex-col sm:flex-row items-center sm:gap-8 gap-2 mb-4 sm:mb-6">
                <h2
                  className="text-lg sm:text-xl font-bold text-red-500 hover:scale-110 transition-all duration-200 transform cursor-pointer"
                  onClick={() => navigateWithTransition('/community', '커뮤니티로 이동 중...')}
                >
                  COMMUNITY
                </h2>
                <span
                  className="text-sm sm:text-lg font-bold text-gray-800 hover:text-red-600 hover:scale-110 transition-all duration-200 transform cursor-pointer"
                  onClick={() => navigateWithTransition('/community', '커뮤니티로 이동 중...')}
                >
                  바로가기
                </span>
              </div>

              <CommunityPreview navigateWithTransition={navigateWithTransition} />
            </section>
          )}
        </div>

        {/* 서랍장 스타일 사이드바 - 데스크톱에서만 표시 */}
        <div className="hidden lg:block">
          <DrawerSidebar />
        </div>
      </div>
    </div>
  )
}

function WhiskyCard({ whisky, navigateWithTransition }: { whisky: WhiskyData, router: unknown, navigateWithTransition: (path: string, message: string) => void }) {
  const { user } = useAuth()
  const [currentLikes, setCurrentLikes] = useState(whisky.likes)
  const [isLikeHovered, setIsLikeHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isCheckingLikeStatus, setIsCheckingLikeStatus] = useState(false)

  // 찜 상태 초기화 및 업데이트 (Supabase 사용)
  useEffect(() => {
    const updateLikeStatus = async () => {
      if (user) {
        // 로그인된 사용자: Supabase에서 찜 상태 확인
        setIsCheckingLikeStatus(true)
        try {
          const liked = await isWhiskyLiked(whisky.id)
          setIsLiked(liked)
        } catch (error) {
          console.error('찜 상태 확인 실패:', error)
          setIsLiked(false)
        } finally {
          setIsCheckingLikeStatus(false)
        }
      } else {
        // 로그아웃 상태: 찜 상태 false
        setIsLiked(false)
      }

      // 현재 찜 수 업데이트
      setCurrentLikes(whisky.likes)
    }

    updateLikeStatus()
  }, [whisky.id, whisky.likes, user])

  const handleClick = () => {
    navigateWithTransition(`/whisky/${whisky.id}`, `${whisky.name} 상세 정보를 불러오는 중...`)
  }

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation()

    // 로그인 상태 확인
    if (!user) {
      toast('찜 기능을 사용하려면 로그인해주세요.')
      return
    }

    if (isCheckingLikeStatus) {
      return // 이미 처리 중이면 무시
    }

    setIsCheckingLikeStatus(true)

    try {
      let success = false
      if (isLiked) {
        // 찜 취소
        success = await removeWhiskyLike(whisky.id)
        if (success) {
          setIsLiked(false)
          setCurrentLikes(prev => Math.max(0, prev - 1))
          console.log(`${whisky.name}을(를) 찜 목록에서 제거했습니다.`)
        }
      } else {
        // 찜 추가
        success = await addWhiskyLike(whisky.id)
        if (success) {
          setIsLiked(true)
          setCurrentLikes(prev => prev + 1)
          console.log(`${whisky.name}을(를) 찜 목록에 추가했습니다.`)
        }
      }

      if (!success) {
        toast.error('찜 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('찜 처리 오류:', error)
      toast.error('찜 처리 중 오류가 발생했습니다.')
    } finally {
      setIsCheckingLikeStatus(false)
    }
  }

  return (
    <div className="bg-white rounded border border-gray-200 p-2 sm:p-3 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* 위스키 이미지/글래스 영역 */}
      <div className="h-32 sm:h-40 mb-2 sm:mb-3 bg-gray-100 rounded flex items-center justify-center relative">
        <img
          src={whisky.image}
          alt={whisky.name}
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            console.log('Image loading failed for:', target.src, 'whisky:', whisky.name);
            if (target.src !== window.location.origin + '/whiskies/no.pic whisky.png') {
              target.src = '/whiskies/no.pic whisky.png';
            }
          }}
          onLoad={(e) => {
            const target = e.target as HTMLImageElement;
            console.log('Image loaded successfully for:', target.src, 'whisky:', whisky.name);
          }}
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
        className="text-xs sm:text-sm font-bold mb-1 sm:mb-2 hover:scale-110 transition-all duration-200 cursor-pointer block w-full text-gray-600 hover:text-red-600 leading-tight"
        onClick={handleClick}
      >
        {whisky.name}
      </button>

      {/* 평점 */}
      <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
        <span className="hidden sm:inline">평균</span>
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
    // Supabase에서 커뮤니티 게시글 로드
    const loadCommunityPosts = async () => {
      try {
        const { getAllCommunityPosts } = await import('../lib/communityPosts')
        const communityPosts = await getAllCommunityPosts()
        // 최대 3개만 표시
        setPosts(communityPosts.slice(0, 3))
      } catch (error) {
        console.error('커뮤니티 게시글 로드 실패:', error)
        setPosts([])
      }
    }

    loadCommunityPosts()
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
                  {/* 프로필 이미지 */}
                  {post.authorImage ? (
                    <img
                      src={post.authorImage}
                      alt={post.author}
                      className="w-6 h-6 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {post.author.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium text-gray-700">{post.author}</span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 fill-current text-gray-400" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {post.likes}
                  </span>
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