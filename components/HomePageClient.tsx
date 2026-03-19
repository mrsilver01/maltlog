'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingAnimation from './LoadingAnimation'
import { usePageTransition } from '../hooks/usePageTransition'
import DrawerSidebar from './DrawerSidebar'
import { useAuth } from '../app/context/AuthContext'
import { LikesProvider, useLikes } from './LikesProvider'
import toast from 'react-hot-toast'
import { MainPageSkeleton, WhiskyCardSkeleton, CommunityPreviewSkeleton } from './SkeletonUI'
import { formatLikeCount } from '../lib/formatLikes'
import type { WhiskyWithStats, WhiskyListResponse } from '@/types/whisky'

// 호환성을 위한 기존 WhiskyData 타입 별칭
export type WhiskyData = WhiskyWithStats

type NavigateWithTransition = (path: string, message: string) => void

type CommunityPreviewPost = {
  id: string
  title: string
  author: string
  authorImage: string | null
  createdAt: string
  likes: number
  comments: number
}

interface HomePageClientProps {
  initial: WhiskyListResponse
  initialLikedIds: string[]
}

export default function HomePageClient({ initial, initialLikedIds }: HomePageClientProps) {
  const { user, profile, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  // 새로운 커서 기반 페이지네이션 상태
  const [items, setItems] = useState<WhiskyData[]>(initial.items)
  const [cursor, setCursor] = useState<number | null>(initial.nextCursor)
  const [loading, setLoading] = useState(false)

  // 기존 UI 상태 유지
  const [showAllWhiskies, setShowAllWhiskies] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const itemsPerPage = 12
  const router = useRouter()
  const { isTransitioning, transitionMessage, navigateWithTransition } = usePageTransition()

  // 검색된 위스키 목록 (새로운 items 기반)
  const filteredWhiskies = items.filter(whisky => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase().trim()
    return (
      whisky.name.toLowerCase().includes(query) ||
      (whisky.name_ko?.toLowerCase().includes(query) ?? false) ||
      (whisky.region?.toLowerCase().includes(query) ?? false) ||
      (whisky.cask?.toLowerCase().includes(query) ?? false) ||
      String(whisky.abv ?? '').toLowerCase().includes(query) ||
      String(whisky.price ?? '').toLowerCase().includes(query)
    )
  })

  // 초기 로딩 상태 관리
  useEffect(() => {
    // 초기 위스키 데이터가 없으면 로딩 상태 표시
    if (initial.items.length === 0) {
      setIsInitialLoading(true)
      // 실제 데이터가 로드되면 로딩 상태 해제
      const timer = setTimeout(() => {
        setIsInitialLoading(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [initial.items.length])

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

  // 새로운 커서 기반 더보기 함수
  const loadMore = async () => {
    if (!cursor || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/whiskies?cursor=${cursor}&limit=50`);

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const { items: moreItems, nextCursor }: WhiskyListResponse = await response.json();

      // id 기준 중복 방지 병합
      const itemMap = new Map(items.map(w => [w.id, w]));
      for (const item of moreItems) {
        itemMap.set(item.id, item);
      }

      const mergedItems = Array.from(itemMap.values());

      setItems(mergedItems);
      setCursor(nextCursor);

      console.log('✅ 더보기 성공:', {
        기존개수: items.length,
        추가개수: moreItems.length,
        총개수: mergedItems.length,
        nextCursor
      });

    } catch (error) {
      console.error('❌ 더보기 실패:', error);
      toast.error('추가 위스키를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 기존 UI 호환성을 위한 토글 함수
  const handleToggleShowAll = () => {
    if (showAllWhiskies) {
      // 접기: 초기 상태로 되돌리기
      setShowAllWhiskies(false);
      setItems(initial.items);
      setCursor(initial.nextCursor);
      setCurrentPage(1);
    } else {
      // 더보기: 모든 데이터 로드
      setShowAllWhiskies(true);
      loadMore();
    }
  };

  // 페이지 전환 중이거나 초기 로딩 중일 때 스켈레톤 UI 표시
  if (isTransitioning || isInitialLoading) {
    return <MainPageSkeleton />
  }

  return (
    <LikesProvider userId={user?.id} initialLikedIds={initialLikedIds}>
      <div className="min-h-screen bg-rose-50 p-3 sm:p-6">
      {/* 페이지 전환 애니메이션 (백업) */}
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
                    src="/LOGO.png"
                    alt="Maltlog Logo"
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                  />
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold text-amber-800 font-[family-name:var(--font-jolly-lodger)]">Maltlog</h1>
              </div>
              <span className="text-sm sm:text-base text-gray-500 text-center sm:text-left sm:ml-4">몰트로그, 위스키의 모든 기록</span>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              <span className="text-lg sm:text-xl font-bold text-red-500 font-[family-name:var(--font-jolly-lodger)] max-[480px]:border max-[480px]:border-gray-300 max-[480px]:px-2 max-[480px]:py-1 max-[480px]:rounded">HOME</span>
              <button
                onClick={() => navigateWithTransition('/profile', '프로필 페이지로 이동 중...')}
                className="text-center hover:text-gray-600 transition-all duration-200 hover:scale-110 transform max-[480px]:border max-[480px]:border-gray-300 max-[480px]:px-2 max-[480px]:py-1 max-[480px]:rounded"
              >
                <div className="text-sm sm:text-lg font-bold text-gray-800 font-[family-name:var(--font-jolly-lodger)] hover:text-red-500 transition-colors">PROFILE</div>
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

          {/* 추천 섹션 - 검색이나 모든 위스키 모드에서 숨김 */}
          {!searchQuery.trim() && !showAllWhiskies && (
            <section className="mb-8 sm:mb-12">
              <h2 className="text-lg font-bold text-gray-800 mb-6">추천</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {(() => {
                  // 특정 추천 위스키 ID들
                  const recommendedIds = ['mortlach-16', 'bowmore-18', 'wild-turkey-rare-breed', 'springbank-10'];

                  // 추천 위스키들을 찾아서 표시
                  const recommendedWhiskies = recommendedIds
                    .map(id => items.find((whisky: WhiskyData) => whisky.id === id))
                    .filter((whisky: WhiskyData | undefined): whisky is WhiskyData => whisky !== undefined);

                  // 만약 추천 위스키가 4개 미만이면 이미지가 있는 위스키로 채움
                  if (recommendedWhiskies.length < 4) {
                    const whiskiesWithImages = items.filter(whisky =>
                      whisky.image &&
                      !whisky.image.includes('no.pic') &&
                      whisky.image.trim() !== '' &&
                      !recommendedWhiskies.includes(whisky)
                    );

                    while (recommendedWhiskies.length < 4 && whiskiesWithImages.length > 0) {
                      const whisky = whiskiesWithImages.shift();
                      if (whisky) {
                        recommendedWhiskies.push(whisky);
                      }
                    }
                  }

                  return recommendedWhiskies.slice(0, 4).map((whisky) => (
                    <WhiskyCard key={whisky.id} whisky={whisky} router={router} navigateWithTransition={navigateWithTransition} />
                  ));
                })()}
              </div>
            </section>
          )}

          {/* 메인 위스키 섹션 */}
          <section className="mb-8 sm:mb-12">
            {/* 모바일: 세로 레이아웃 */}
            <div className="flex flex-col gap-4 sm:hidden">
              {/* 제목 */}
              <div className="flex items-center justify-center gap-2">
{!searchQuery.trim() && !showAllWhiskies && (
                  <h2 className="text-base font-bold text-gray-800 text-center">위스키 컬렉션</h2>
                )}
                {!searchQuery.trim() && showAllWhiskies && (
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    // 검색어가 입력되면 자동으로 더보기 모드 활성화
                    if (e.target.value.trim() && !showAllWhiskies) {
                      handleToggleShowAll()
                    }
                  }}
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
              <div className="flex justify-center gap-2 -mt-2">
{!searchQuery.trim() && (
                  <button
                    onClick={handleToggleShowAll}
                    disabled={loading || (!showAllWhiskies && !cursor)}
                    className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors bg-amber-900 hover:bg-amber-800 px-3 py-1.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '로딩 중...' : showAllWhiskies ? '접기' : '더보기'}
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
{!searchQuery.trim() && !showAllWhiskies && (
                  <h2 className="text-lg font-bold text-gray-800">위스키 컬렉션</h2>
                )}
                {!searchQuery.trim() && showAllWhiskies && (
                  <h2 className="text-lg font-bold text-gray-800">모든 위스키</h2>
                )}
                {searchQuery.trim() && (
                  <h2 className="text-lg font-bold text-gray-800">
                    &quot;{searchQuery}&quot; 검색 결과 ({filteredWhiskies.length}개)
                  </h2>
                )}
{!searchQuery.trim() && (
                  <button
                    onClick={handleToggleShowAll}
                    disabled={loading || (!showAllWhiskies && !cursor)}
                    className="text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '로딩 중...' : showAllWhiskies ? '접기' : '더보기'}
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    // 검색어가 입력되면 자동으로 더보기 모드 활성화
                    if (e.target.value.trim() && !showAllWhiskies) {
                      handleToggleShowAll()
                    }
                  }}
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
                      // 검색 모드: 모든 검색 결과 표시
                      whiskiesToShow = filteredWhiskies
                    } else if (showAllWhiskies) {
                      // 모든 위스키 모드: 페이지네이션 적용
                      const startIndex = (currentPage - 1) * itemsPerPage
                      const endIndex = startIndex + itemsPerPage
                      whiskiesToShow = filteredWhiskies.slice(startIndex, endIndex)
                    } else {
                      // 초기 모드: 처음 위스키들만 표시 (8개로 변경)
                      whiskiesToShow = filteredWhiskies.slice(0, 8)
                    }

                    return whiskiesToShow.map((whisky) => (
                      <WhiskyCard key={whisky.id} whisky={whisky} router={router} navigateWithTransition={navigateWithTransition} />
                    ))
                  })()}

                  {/* 더보기 로딩 중일 때 스켈레톤 추가 */}
                  {loading && (
                    <>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <WhiskyCardSkeleton key={`loading-${i}`} />
                      ))}
                    </>
                  )}
                </div>

                {/* 페이지네이션 - 모든 위스키 모드일 때만 표시 */}
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


          {/* 커뮤니티 섹션 - 검색이나 모든 위스키 모드에서 숨김 */}
          {!searchQuery.trim() && !showAllWhiskies && (
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
    </LikesProvider>
  )
}

function WhiskyCard({ whisky, navigateWithTransition }: { whisky: WhiskyData, router: unknown, navigateWithTransition: (path: string, message: string) => void }) {
  const { user } = useAuth()
  const { isLiked, toggle, isLoading } = useLikes()
  const [currentLikes, setCurrentLikes] = useState<number>(() => whisky.likes_count ?? 0)
  const [isLikeHovered, setIsLikeHovered] = useState(false)

  // 현재 찜 수 업데이트
  useEffect(() => {
    setCurrentLikes(whisky.likes_count ?? 0)
  }, [whisky.likes_count])

  const isWhiskyLiked = isLiked(whisky.id)

  const handleClick = () => {
    navigateWithTransition(`/whisky/${whisky.id}`, `${whisky.name} 상세 정보를 불러오는 중...`)
  }

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!user) {
      toast('로그인이 필요합니다')
      return
    }

    if (isLoading) {
      return // 이미 처리 중이면 무시
    }

    const wasLiked = isWhiskyLiked

    // Optimistic UI - 즉시 상태 변경
    setCurrentLikes(prev => wasLiked ? Math.max(0, (prev || 0) - 1) : (prev || 0) + 1)

    try {
      await toggle(whisky.id)
      console.log(`${whisky.name}을(를) 찜 ${wasLiked ? '제거' : '추가'}했습니다.`)
    } catch (error) {
      console.error('찜 처리 오류:', error)
      // 실패 시 롤백
      setCurrentLikes(prev => wasLiked ? (prev || 0) + 1 : Math.max(0, (prev || 0) - 1))
    }
  }

  return (
    <div
      className="bg-white rounded border border-gray-200 p-2 sm:p-3 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      onClick={handleClick}
    >
      {/* 위스키 이미지/글래스 영역 */}
      <div className="h-32 sm:h-40 mb-2 sm:mb-3 bg-gray-100 rounded flex items-center justify-center relative">
        <img
          src={whisky.image || '/images/placeholder-whisky.png'}
          alt={whisky.name}
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            const t = e.currentTarget as HTMLImageElement
            t.src = '/images/placeholder-whisky.png'
          }}
        />

        {/* 추천해요 버튼 */}
        <button
          disabled={!user}
          aria-disabled={!user}
          title={!user ? '로그인 후 사용 가능' : isWhiskyLiked ? '찜 취소' : '찜하기'}
          className={`absolute bottom-0 left-0 right-0 py-1 px-2 flex items-center justify-between text-xs transition-all duration-200 ${
            !user
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isWhiskyLiked
              ? 'bg-red-500 text-white'
              : isLikeHovered
              ? 'bg-black text-white'
              : 'bg-gray-300 text-white hover:bg-gray-400'
          }`}
          onMouseEnter={() => user && setIsLikeHovered(true)}
          onMouseLeave={() => setIsLikeHovered(false)}
          onClick={!user ? undefined : handleLikeClick}
        >
          <div className="flex items-center gap-1">
            <span className="text-xs">🥃</span>
            <span className="font-bold">찜</span>
          </div>
          <span className="font-bold">{formatLikeCount(currentLikes || 0)}</span>
        </button>
      </div>

      {/* 위스키 이름 - 모든 위스키에 표시 */}
      <div className="text-xs sm:text-sm font-bold mb-1 sm:mb-2 hover:scale-110 transition-all duration-200 text-gray-600 hover:text-red-600 leading-tight">
        {whisky.name}
      </div>

      {/* 평점 */}
      <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
        {(() => {
          const totalReviews = whisky.totalReviews ?? whisky.reviews_count ?? 0
          return totalReviews > 0 ? (
          // 리뷰가 있는 경우: 실제 점수에 맞는 별 표시
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((starIndex) => {
              const rating = Number(whisky.avgRating ?? whisky.avg_rating ?? 0);
              const fullStars = Math.floor(rating);
              const hasHalfStar = rating % 1 >= 0.5;

              if (starIndex <= fullStars) {
                // 채워진 노란 별
                return (
                  <span key={starIndex} className="text-yellow-500 text-sm">
                    ★
                  </span>
                );
              } else if (starIndex === fullStars + 1 && hasHalfStar) {
                // 반별: 약간 어두운 노란색
                return (
                  <span key={starIndex} className="text-yellow-400 text-sm">
                    ★
                  </span>
                );
              } else {
                // 빈 별 (투명)
                return (
                  <span key={starIndex} className="text-gray-300 text-sm">
                    ☆
                  </span>
                );
              }
            })}
            <span className="ml-1 text-gray-600 text-xs">{Number(whisky.avgRating ?? whisky.avg_rating ?? 0).toFixed(1)}</span>
          </div>
          ) : (
            // 리뷰가 0개인 경우: 투명한 별 5개와 "-"
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((starIndex) => (
                <span key={starIndex} className="text-gray-300 text-sm">
                  ☆
                </span>
              ))}
              <span className="ml-1 text-gray-500 text-xs">-</span>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

// 커뮤니티 미리보기 컴포넌트
function CommunityPreview({ navigateWithTransition }: { navigateWithTransition: NavigateWithTransition }) {
  const [posts, setPosts] = useState<CommunityPreviewPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = React.useCallback(async (signal?: AbortSignal) => {
    console.log('🔄 [CommunityPreview] Starting to load community posts')
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/community/latest', { cache: 'no-store', signal })
      console.log('🌐 [CommunityPreview] Response status:', res.status, res.statusText)

      if (!res.ok) throw new Error('bad status: ' + res.status)

      const data: unknown = await res.json()
      console.log('📦 [CommunityPreview] Received data:', {
        isArray: Array.isArray(data),
        length: data?.length ?? 0,
        data: data
      })

      setPosts(Array.isArray(data) ? (data as CommunityPreviewPost[]) : [])
      console.log('✅ [CommunityPreview] Posts set successfully:', Array.isArray(data) ? data.length : 0, 'items')
    } catch (error) {
      console.error('❌ [CommunityPreview] Load failed:', error)
      setError(error instanceof Error ? error.message : 'load failed'); setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    load(ctrl.signal)
    return () => ctrl.abort()
  }, [load])

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

  if (loading) {
    return <CommunityPreviewSkeleton />
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-gray-400 p-6 rounded-lg text-center">
        <div className="text-sm text-gray-600 mb-2">불러오기에 실패했습니다.</div>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          onClick={() => load()}>
          다시 시도 →
        </button>
      </div>
    )
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
                    {formatLikeCount(post.likes)}
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
        // ✅ 이제서야 '게시글 없음' 노출
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
