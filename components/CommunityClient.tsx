'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import LoadingAnimation from '@/components/LoadingAnimation'
import { getAllCommunityPosts, getCommunityPosts, CommunityPostWithProfile } from '@/lib/communityPosts'
import { likePost, unlikePost, checkMultiplePostsLiked, getPostLikesCount } from '@/lib/postActions'

interface CommunityClientProps {
  initialPosts: CommunityPostWithProfile[]
}

export default function CommunityClient({ initialPosts }: CommunityClientProps) {
  const router = useRouter()
  const { user, profile, signOut, loading: authLoading } = useAuth()

  const [posts, setPosts] = useState<CommunityPostWithProfile[]>(initialPosts)
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)
  const [postLikes, setPostLikes] = useState<{[key: string]: {isLiked: boolean, count: number}}>({})
  const [likesLoading, setLikesLoading] = useState<{[key: string]: boolean}>({})

  const POSTS_PER_PAGE = 10

  // 초기 게시글 로드
  const loadSupabasePosts = useCallback(async () => {
    setIsLoadingPosts(true)
    try {
      const supabasePosts = await getCommunityPosts(0, POSTS_PER_PAGE)
      setPosts(supabasePosts)
      setCurrentPage(0)
      setHasMore(supabasePosts.length === POSTS_PER_PAGE)
    } catch (error) {
      console.error('Supabase 게시글 로드 실패:', error)
      setPosts([])
    } finally {
      setIsLoadingPosts(false)
    }
  }, [])

  // 추가 게시글 로드 (무한 스크롤용)
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const nextPage = currentPage + 1
      const newPosts = await getCommunityPosts(nextPage, POSTS_PER_PAGE)

      if (newPosts.length < POSTS_PER_PAGE) {
        setHasMore(false)
      }

      if (newPosts.length > 0) {
        setPosts(prev => [...prev, ...newPosts])
        setCurrentPage(nextPage)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('추가 게시글 로드 실패:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [currentPage, hasMore, isLoadingMore])

  // IntersectionObserver를 사용한 무한 스크롤 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && hasMore && !isLoadingMore) {
          loadMorePosts()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    )

    const currentObserverRef = observerRef.current
    if (currentObserverRef) {
      observer.observe(currentObserverRef)
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef)
      }
    }
  }, [hasMore, isLoadingMore, loadMorePosts])

  // 초기 데이터 설정
  useEffect(() => {
    setPosts(initialPosts.slice(0, POSTS_PER_PAGE))
    setHasMore(initialPosts.length === POSTS_PER_PAGE)
    setCurrentPage(0)
  }, [initialPosts])

  // 게시글 좋아요 상태 로딩
  useEffect(() => {
    const loadPostLikes = async () => {
      if (posts.length === 0) return

      const postIds = posts.map(post => post.id!)
      const likesPromises = postIds.map(async (postId) => {
        const count = await getPostLikesCount(postId)
        let isLiked = false
        if (user) {
          const likedPosts = await checkMultiplePostsLiked([postId], user.id)
          isLiked = likedPosts[postId] || false
        }
        return { postId, count, isLiked }
      })

      const likesData = await Promise.all(likesPromises)
      const likesMap: {[key: string]: {isLiked: boolean, count: number}} = {}
      likesData.forEach(({ postId, count, isLiked }) => {
        likesMap[postId] = { isLiked, count }
      })
      setPostLikes(likesMap)
    }

    loadPostLikes()
  }, [posts, user])

  // 게시글 좋아요/취소 핸들러
  const handlePostLike = async (postId: string, event: React.MouseEvent) => {
    event.stopPropagation() // 게시글 클릭 이벤트 방지

    if (!user) {
      alert('좋아요를 누르려면 로그인해주세요.')
      return
    }

    if (likesLoading[postId]) return

    setLikesLoading(prev => ({ ...prev, [postId]: true }))

    const currentLike = postLikes[postId]
    const isCurrentlyLiked = currentLike?.isLiked || false
    const currentCount = currentLike?.count || 0

    // 옵티미스틱 업데이트
    setPostLikes(prev => ({
      ...prev,
      [postId]: {
        isLiked: !isCurrentlyLiked,
        count: isCurrentlyLiked ? currentCount - 1 : currentCount + 1
      }
    }))

    try {
      let success = false
      if (isCurrentlyLiked) {
        success = await unlikePost(postId, user.id)
      } else {
        success = await likePost(postId, user.id)
      }

      if (!success) {
        // 실패시 롤백
        setPostLikes(prev => ({
          ...prev,
          [postId]: {
            isLiked: isCurrentlyLiked,
            count: currentCount
          }
        }))
        alert('좋아요 처리에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error)
      // 실패시 롤백
      setPostLikes(prev => ({
        ...prev,
        [postId]: {
          isLiked: isCurrentlyLiked,
          count: currentCount
        }
      }))
      alert('좋아요 처리 중 오류가 발생했습니다.')
    } finally {
      setLikesLoading(prev => ({ ...prev, [postId]: false }))
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      alert('로그아웃되었습니다.')
      router.push('/')
    } catch (error: unknown) {
      alert('로그아웃 오류: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    return date.toLocaleDateString('ko-KR')
  }

  if (authLoading) {
    return <LoadingAnimation message="커뮤니티를 불러오는 중..." />
  }

  return (
    <div className="min-h-screen bg-rose-50 p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-16 flex items-center justify-center">
              <img src="/whiskies/LOGO.png" alt="Maltlog Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-4xl font-bold text-amber-800 font-[family-name:var(--font-jolly-lodger)]">Maltlog</h1>
            <span className="text-4xl font-bold text-blue-500 ml-2 font-[family-name:var(--font-jolly-lodger)]">Community</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/')}
            className="text-xl font-bold text-gray-600 hover:text-red-500 transition-all duration-200 hover:scale-110 transform font-[family-name:var(--font-jolly-lodger)]"
          >
            HOME
          </button>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{profile?.nickname || '사용자'}님</span>
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-5 py-2 rounded-full text-sm hover:bg-gray-500 transition-all duration-200 hover:scale-110 transform shadow-md hover:shadow-lg"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="bg-amber-900 text-white px-5 py-2 rounded-full text-sm hover:bg-amber-800 transition-all duration-200 hover:scale-110 transform shadow-md hover:shadow-lg"
            >
              로그인
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {user && (
          <div className="mb-8">
            <button
              onClick={() => router.push('/community/new')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              새 게시글 작성
            </button>
          </div>
        )}

        {isLoadingPosts ? (
          <LoadingAnimation message="게시글을 불러오는 중..." />
        ) : (
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/community/post/${post.id}`)}
                >
                  <div className="flex items-start gap-4">
                    {post.image_url && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={post.image_url} alt="게시글 이미지" className="w-full h-full object-cover"/>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-3">
                          {post.profiles?.avatar_url ? (
                            <img
                              src={post.profiles.avatar_url}
                              alt={post.profiles.nickname || ''}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                              {(post.profiles?.nickname || ' ').charAt(0)}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-700">
                              {post.profiles?.nickname || '알 수 없는 사용자'}
                            </span>
                            <span className="text-xs">{formatDate(post.created_at || '')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => handlePostLike(post.id!, e)}
                            disabled={likesLoading[post.id!]}
                            className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded-md transition-colors group disabled:opacity-50"
                          >
                            <span className={`transition-colors ${
                              postLikes[post.id!]?.isLiked
                                ? 'text-red-500'
                                : 'text-gray-400 group-hover:text-red-400'
                            }`}>
                              {postLikes[post.id!]?.isLiked ? '❤️' : '🤍'}
                            </span>
                            <span className="text-gray-600">
                              {postLikes[post.id!]?.count ?? (post.likes_count || 0)}
                            </span>
                          </button>
                          <span className="flex items-center gap-1">
                            <span className="text-gray-400">💬</span>
                            <span className="text-gray-600">{post.comments_count || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">
                  아직 게시글이 없습니다.
                </div>
                <div className="text-gray-400 text-sm">
                  첫 번째 게시글을 작성해보세요!
                </div>
              </div>
            )}

            {/* 무한 스크롤 위한 감지 요소 */}
            {posts.length > 0 && (
              <div ref={observerRef} className="h-4">
                {isLoadingMore && (
                  <div className="flex justify-center items-center py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600 font-medium">더 많은 게시글을 불러오는 중...</span>
                    </div>
                  </div>
                )}
                {!hasMore && posts.length > POSTS_PER_PAGE && (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-sm">
                      모든 게시글을 확인하셨습니다! 🎉
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}