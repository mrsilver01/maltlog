'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { updateNickname } from '../lib/userProfiles'
import { uploadAndSetAvatar } from '../lib/avatarStorage'
import { getUserWhiskyReviews, getWhiskiesByIds } from '../lib/whiskyReviews'
import { getUserWhiskyLikes } from '../lib/likes'
import { getUserCommunityPosts } from '../lib/communityPosts'
import { toPublicImageUrl } from '../lib/images'
import { useAuth } from '../app/context/AuthContext'
import LoadingAnimation from './LoadingAnimation'
import toast from 'react-hot-toast'

interface WhiskyData {
  id: string
  name: string
  image: string
  distillery?: string
  region: string
  abv: string
  cask: string
  price: string
  avgRating: number
  totalReviews: number
  likes: number
}

interface ReviewWithWhisky {
  id: string
  user: string
  whisky: string
  rating: number
  content: string
  likes: number
  comments: any[]
  date: string
  whiskyImage: string
  whiskyId: string
  reviewId: string
}

import type { ProfileSummary, ProfileReviewsResponse, FirstReviewedResponse } from '@/types/whisky'

interface ProfilePageClientProps {
  profileSummary: ProfileSummary
  initialReviews: ProfileReviewsResponse
  firstReviewedWhiskies: FirstReviewedResponse
}

interface Comment {
  id: number
  user: string
  content: string
  date: string
}

export default function ProfilePageClient({
  profileSummary,
  initialReviews,
  firstReviewedWhiskies
}: ProfilePageClientProps) {
  const router = useRouter()
  const { user, profile, signOut, loading: authLoading, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [nickname, setNickname] = useState(profile?.nickname || 'MrSilverr')
  const [profileImage, setProfileImage] = useState<string | null>(profile?.avatar_url || null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [reviewedWhiskies, setReviewedWhiskies] = useState<WhiskyData[]>(firstReviewedWhiskies.items.map(item => ({
    id: item.whisky_id,
    name: item.name,
    image: item.image || '',
    region: '',
    abv: '',
    cask: '',
    price: '',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  })))
  const [showAllNotes, setShowAllNotes] = useState(false)
  const [expandedComments, setExpandedComments] = useState<{[key: string]: boolean}>({})
  const [replyText, setReplyText] = useState<{[key: string]: string}>({})
  const [notesData, setNotesData] = useState<ReviewWithWhisky[]>(initialReviews.items.map(review => ({
    id: review.review_id,
    user: profileSummary.display_name || profileSummary.handle,
    whisky: review.whisky.name,
    rating: review.rating,
    content: review.note || '',
    likes: 0,
    comments: [],
    date: review.created_at,
    whiskyImage: review.whisky.image || '',
    whiskyId: review.whisky.id,
    reviewId: review.review_id
  })))
  const [userStats, setUserStats] = useState({
    reviewCount: profileSummary.notes_count,
    noteCount: profileSummary.notes_count,
    wishlistCount: 0,
    postsCount: profileSummary.posts_count
  })
  const [likedWhiskies, setLikedWhiskies] = useState<WhiskyData[]>([])
  const [likedWhiskyIds, setLikedWhiskyIds] = useState<string[]>([])
  const [communityPosts, setCommunityPosts] = useState<any[]>([])
  const [communityPostsCount, setCommunityPostsCount] = useState(profileSummary.posts_count)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ⭐ 성능 최적화: 평점 높은 순으로 정렬된 위스키 3개 캐싱
  const topRatedWhiskies = useMemo(() => {
    return [...notesData]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3)
  }, [notesData])

  // 프로필 정보 업데이트
  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname)
      if (profile.avatar_url) {
        setProfileImage(profile.avatar_url)
      }
    }
  }, [profile])

  // 사용자 통계 계산 (Supabase 기반)
  const getUserStats = async () => {
    try {
      if (!user) return { wishlistCount: 0, reviewCount: 0, noteCount: 0, postsCount: 0 }

      // 찜한 위스키 개수
      const likedWhiskies = await getUserWhiskyLikes(user.id)
      const wishlistCount = likedWhiskies.length

      // 사용자 리뷰 개수
      const userReviews = await getUserWhiskyReviews()
      const reviewCount = userReviews.length

      // 실제 노트가 있는 리뷰 개수 (단순 별점이 아닌 경우)
      const noteCount = userReviews.filter(review => {
        if (!review.note || review.note.trim() === '') return false
        const trimmedNote = review.note.trim()

        // 자동 생성 메시지 패턴들
        const autoMessagePatterns = [
          `별점 ${review.rating}점을 남겼습니다.`,
          `별점 ${review.rating}점`,
          `${review.rating}점`,
          '별점만 남겼습니다.',
          '평점만 등록했습니다.'
        ]

        // 정확히 일치하는 자동 메시지가 아닌 경우만 유효한 노트로 간주
        return !autoMessagePatterns.some(pattern => trimmedNote === pattern)
      }).length

      // 커뮤니티 게시글 개수
      const userPosts = await getUserCommunityPosts(user.id)
      const postsCount = userPosts.length

      return { reviewCount, noteCount, wishlistCount, postsCount }
    } catch (error) {
      console.error('통계 계산 중 오류:', error)
      return { reviewCount: 0, noteCount: 0, wishlistCount: 0, postsCount: 0 }
    }
  }

  // 사용자 데이터 로드
  useEffect(() => {
    const loadUserData = async () => {
      if (user && !isLoading) {
        setIsLoading(true)
        try {
          // 통계 데이터 로드
          const stats = await getUserStats()
          setUserStats(stats)

          // 사용자 리뷰 로드
          const userReviews = await getUserWhiskyReviews()

          // 찜한 위스키 로드
          const likedWhiskyIds = await getUserWhiskyLikes(user.id)
          setLikedWhiskyIds(likedWhiskyIds)

          // 찜한 위스키 정보 가져오기
          const likedWhiskiesMap = await getWhiskiesByIds(likedWhiskyIds)
          const likedWhiskiesArray = likedWhiskyIds.map(id => {
            const whiskyData = likedWhiskiesMap[id] || {}
            return {
              id: id,
              name: whiskyData.name_ko || whiskyData.name || '위스키',
              image: whiskyData.image || '',
              distillery: '',
              region: '',
              abv: '',
              cask: '',
              price: '',
              avgRating: 0,
              totalReviews: 0,
              likes: 0
            }
          })
          setLikedWhiskies(likedWhiskiesArray)

          // ⭐ 위스키 ID 추출 후 위스키 정보 일괄 조회
          const whiskyIds = userReviews.map(r => r.whisky_id)
          const whiskiesMap = await getWhiskiesByIds(whiskyIds)

          const reviewsWithFormat = userReviews.map(review => {
            // ⭐ whiskiesMap에서 위스키 정보 조회
            const whiskyData = whiskiesMap[review.whisky_id] || {}
            const whiskyName = whiskyData.name_ko || whiskyData.name || review.whisky_id || '위스키'
            const whiskyImage = whiskyData.image || ''

            return {
              id: review.id || '',
              user: profile?.nickname || '익명',
              whisky: whiskyName,  // ⭐ 위스키 실제 이름
              rating: review.rating,
              content: review.note || '',
              likes: 0,
              comments: [],
              date: review.created_at ? new Date(review.created_at).toLocaleDateString() : '',
              whiskyImage: whiskyImage,  // ⭐ 위스키 이미지
              whiskyId: review.whisky_id,
              reviewId: review.id || ''
            }
          })
          setNotesData(reviewsWithFormat)

          // 커뮤니티 게시글 개수 업데이트
          const userPosts = await getUserCommunityPosts(user.id)
          setCommunityPosts(userPosts.slice(0, 5))
          setCommunityPostsCount(userPosts.length)
        } catch (error) {
          console.error('사용자 데이터 로드 중 오류:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadUserData()
  }, [user, profile])

  const myNotes = showAllNotes ? (notesData || []) : (notesData || []).slice(0, 3)

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('로그아웃되었습니다.')
      router.push('/')
    } catch (error) {
      console.error('로그아웃 중 오류:', error)
      toast.error('로그아웃 중 오류가 발생했습니다.')
    }
  }

  const handleEditProfile = async () => {
    if (isEditing) {
      try {
        // Supabase에 닉네임 저장
        const success = await updateNickname(nickname)
        if (success) {
          console.log('✅ 닉네임 저장 성공:', nickname)
          toast.success('닉네임이 저장되었습니다.')
        } else {
          toast.error('닉네임 저장에 실패했습니다.')
          return
        }
      } catch (error) {
        console.error('닉네임 저장 중 오류:', error)
        toast.error('닉네임 저장 중 오류가 발생했습니다.')
        return
      }
    }
    setIsEditing(!isEditing)
  }

  const handleImageClick = () => {
    if (!isUploadingImage) {
      fileInputRef.current?.click()
    }
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploadingImage(true)
      try {
        console.log('이미지 업로드 시작...')
        toast.loading('이미지를 업로드하고 있습니다...', { id: 'image-upload' })

        const result = await uploadAndSetAvatar(file)

        if (result.success && result.url) {
          setProfileImage(result.url)
          console.log('✅ 프로필 이미지 업로드 성공:', result.url)
          toast.success('프로필 이미지가 업데이트되었습니다.', { id: 'image-upload' })
          // AuthContext의 프로필 정보 새로고침
          await updateProfile()
        } else {
          console.error('이미지 업로드 실패:', result.error)
          toast.error(result.error || '이미지 업로드에 실패했습니다.', { id: 'image-upload' })
        }
      } catch (error) {
        console.error('이미지 업로드 중 오류:', error)
        toast.error('이미지 업로드 중 오류가 발생했습니다.', { id: 'image-upload' })
      } finally {
        setIsUploadingImage(false)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!isUploadingImage) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (isUploadingImage) return

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setIsUploadingImage(true)
      try {
        console.log('드래그 앤 드롭 이미지 업로드 시작...')
        toast.loading('이미지를 업로드하고 있습니다...', { id: 'image-upload' })

        const result = await uploadAndSetAvatar(file)

        if (result.success && result.url) {
          setProfileImage(result.url)
          console.log('✅ 프로필 이미지 업로드 성공 (드래그 앤 드롭):', result.url)
          toast.success('프로필 이미지가 업데이트되었습니다.', { id: 'image-upload' })
          // AuthContext의 프로필 정보 새로고침
          await updateProfile()
        } else {
          console.error('이미지 업로드 실패:', result.error)
          toast.error(result.error || '이미지 업로드에 실패했습니다.', { id: 'image-upload' })
        }
      } catch (error) {
        console.error('이미지 업로드 중 오류:', error)
        toast.error('이미지 업로드 중 오류가 발생했습니다.', { id: 'image-upload' })
      } finally {
        setIsUploadingImage(false)
      }
    }
  }

  const toggleComments = (noteId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }))
  }

  // 댓글 기능은 현재 비활성화 (위스키 리뷰에는 댓글이 없음)
  const handleAddReply = (noteId: string) => {
    console.log('댓글 기능은 현재 비활성화되어 있습니다.')
  }

  // 댓글 삭제 기능은 현재 비활성화 (위스키 리뷰에는 댓글이 없음)
  const handleDeleteReply = (noteId: string, commentId: number) => {
    console.log('댓글 삭제 기능은 현재 비활성화되어 있습니다.')
  }

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // 리뷰 삭제 함수 (Supabase 기반)
  const handleDeleteReview = async (noteId: string) => {
    if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?')) return

    try {
      // Review ID로 직접 삭제하는 안전한 함수 사용
      const { deleteWhiskyReviewById } = await import('../lib/whiskyReviews')

      const success = await deleteWhiskyReviewById(noteId)
      if (success) {
        // 상태에서 삭제
        setNotesData(prevNotes => prevNotes.filter(note => note.id !== noteId))
        toast.success('리뷰가 삭제되었습니다.')

        // 통계 다시 로드
        const stats = await getUserStats()
        setUserStats(stats)
      } else {
        toast.error('리뷰 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('리뷰 삭제 중 오류:', error)
      toast.error('리뷰 삭제 중 오류가 발생했습니다.')
    }
  }

  // 로딩 중일 때 로딩 애니메이션 표시
  if (authLoading || isLoading) {
    return <LoadingAnimation message="프로필을 불러오는 중..." />
  }

  // 로그인되지 않은 경우
  if (!user) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-gray-600 mb-4">로그인이 필요합니다</div>
          <div className="text-gray-500">잠시 후 로그인 페이지로 이동합니다...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50 px-3 sm:px-4 md:px-6 py-4 sm:py-6">
      {/* 헤더 */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 max-w-7xl mx-auto gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* 로고 이미지 */}
            <div className="w-8 sm:w-12 h-12 sm:h-16 flex items-center justify-center">
              <img
                src="/LOGO.png"
                alt="Maltlog Logo"
                className="w-8 sm:w-12 h-8 sm:h-12 object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-800 font-[family-name:var(--font-jolly-lodger)]">Maltlog</h1>
          </div>
          <span className="text-sm sm:text-base text-gray-500">몰트로그, 위스키의 모든 기록</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-lg sm:text-xl font-bold text-red-500 font-[family-name:var(--font-jolly-lodger)]">PROFILE</span>
            <span className="text-base sm:text-lg font-bold text-amber-800 font-[family-name:var(--font-jolly-lodger)]">내 노트</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.push('/')}
              className="text-center hover:text-gray-600 transition-all duration-200 hover:scale-110 transform"
            >
              <div className="text-sm sm:text-lg font-bold text-gray-800 font-[family-name:var(--font-jolly-lodger)]">HOME</div>
              <div className="text-xs text-gray-600">홈으로 돌아가기</div>
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-600 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-gray-500 transition-all duration-200 hover:scale-110 transform shadow-md hover:shadow-lg">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 뒤로가기 버튼 */}
      <div className="mb-6 sm:mb-8 ml-2 sm:ml-8 max-w-7xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="bg-rose-100 border border-rose-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-rose-150 transition-all duration-200 shadow-sm text-gray-700 hover:text-gray-800 text-xs sm:text-sm font-medium hover:scale-105 transform hover:shadow-md hover:border-rose-300"
        >
          ← 메인으로
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* 왼쪽: 프로필 정보 */}
          <div className="md:col-span-1 lg:col-span-2">
            {/* 프로필 사진 */}
            <div className="mb-4 sm:mb-6">
              <div
                className={`w-24 sm:w-32 h-24 sm:h-32 border-3 rounded-full mx-auto mb-3 sm:mb-4 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                  isDragging
                    ? 'border-amber-600 scale-105 shadow-xl'
                    : profileImage
                      ? 'border-amber-700 hover:border-amber-600 hover:scale-105 hover:shadow-xl'
                      : 'border-amber-700 bg-amber-800 hover:border-amber-600 hover:scale-105 hover:shadow-xl'
                }`}
                onClick={handleImageClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="프로필 이미지"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-full bg-amber-800">
                    <div className="text-center">
                      <div className="text-4xl text-amber-200 mb-1">📷</div>
                      <div className="text-xs text-amber-300 font-medium">클릭하여 추가</div>
                    </div>
                  </div>
                )}

                {/* 호버 오버레이 / 업로드 중 오버레이 */}
                <div className={`absolute inset-0 transition-all duration-300 flex items-center justify-center rounded-full ${
                  isUploadingImage
                    ? 'bg-amber-900 bg-opacity-60'
                    : 'bg-amber-900 bg-opacity-0 group-hover:bg-opacity-30'
                }`}>
                  <div className={`text-white transition-opacity duration-300 text-sm font-bold shadow-lg ${
                    isUploadingImage
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                        <div>업로드 중...</div>
                      </div>
                    ) : (
                      profileImage ? '📸 변경' : '📷 추가'
                    )}
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              <h2 className="text-lg sm:text-xl font-bold text-amber-700 text-center mb-2 hover:text-amber-800 transition-colors cursor-pointer" onClick={handleImageClick}>
                프로필 변경하기
              </h2>
            </div>

            {/* 닉네임 */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <span className="text-base sm:text-lg font-medium text-gray-800">닉네임 :</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="border border-gray-300 px-2 py-1 rounded text-base sm:text-lg text-gray-800 focus:text-amber-800 w-full sm:w-auto"
                  />
                ) : (
                  <span className="text-base sm:text-lg font-bold text-amber-800">{nickname}</span>
                )}
                <button
                  onClick={handleEditProfile}
                  className="bg-gray-200 text-gray-700 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-gray-300 hover:scale-110 transition-all duration-200 transform shadow-sm hover:shadow-md"
                >
                  {isEditing ? '저장' : '변경'}
                </button>
              </div>
            </div>

            {/* 통계 */}
            <div className="border border-rose-300 rounded mb-6 sm:mb-8 bg-rose-50">
              <div className="grid grid-cols-1 sm:grid-cols-3 text-center">
                <div className="border-b sm:border-b-0 sm:border-r border-rose-300 py-3 sm:py-4">
                  <div className="text-xl sm:text-2xl font-bold text-rose-800">{notesData.length}</div>
                  <div className="text-xs sm:text-sm text-rose-700">노트</div>
                </div>
                <div className="border-b sm:border-b-0 sm:border-r border-rose-300 py-3 sm:py-4">
                  <div className="text-xl sm:text-2xl font-bold text-rose-800">{userStats.wishlistCount}</div>
                  <div className="text-xs sm:text-sm text-rose-700">찜</div>
                </div>
                <div
                  className="py-3 sm:py-4 cursor-pointer hover:bg-rose-100 transition-colors rounded"
                  onClick={() => router.push('/community')}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      router.push('/community')
                    }
                  }}
                >
                  <div className="text-xl sm:text-2xl font-bold text-rose-800">{communityPostsCount}</div>
                  <div className="text-xs sm:text-sm text-rose-700">게시글</div>
                </div>
              </div>
            </div>

            {/* 찜한 술 섹션 */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">찜한 술</h3>
              <div className="space-y-3">
                {likedWhiskies.slice(0, 5).map((whisky) => {
                  const handleGoToWhisky = () => {
                    router.push(`/whisky/${whisky.id}`)
                  }

                  return (
                    <div
                      key={whisky.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                      onClick={handleGoToWhisky}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleGoToWhisky()
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800 truncate">
                          {whisky.name || '위스키'}
                        </span>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-red-400">♥</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {likedWhiskies.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    아직 찜한 술이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽: 위스키 컬렉션 및 노트 */}
          <div className="md:col-span-2 lg:col-span-3">
            {/* 위스키 컬렉션 박스 */}
            <div className="mb-6 sm:mb-8">
              <div className="bg-amber-900 p-3 sm:p-4 md:p-6 rounded-lg">
                <div className="bg-amber-800 p-2 sm:p-3 md:p-4 rounded mb-3 sm:mb-4">
                  <h3 className="text-white text-center text-base sm:text-lg font-bold">위스키 컬렉션</h3>
                </div>
                <div className="bg-amber-800 p-4 sm:p-6 md:p-8 rounded flex items-center justify-center">
                  <div className="flex gap-2 sm:gap-4 md:gap-8">
                    {/* ⭐ 평점 높은 위스키 3개 표시 */}
                    {topRatedWhiskies.length > 0 ? (
                      topRatedWhiskies.slice(0, 3).map((review, index) => {
                        const handleScrollToCollection = () => {
                          router.push(`/whisky/${review.whiskyId}`)
                        }

                        return (
                          <div
                            key={review.whiskyId}
                            role="button"
                            tabIndex={0}
                            aria-label={`${review.whisky} 위스키 상세보기 (평점: ${review.rating}점)`}
                            className="w-6 sm:w-8 md:w-10 h-12 sm:h-16 md:h-20 bg-white bg-opacity-20 rounded overflow-hidden flex items-center justify-center cursor-pointer hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={handleScrollToCollection}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleScrollToCollection()
                              }
                            }}
                          >
                            {review.whiskyImage ? (
                              <img
                                src={toPublicImageUrl(review.whiskyImage)}
                                alt={review.whisky}
                                className="w-full h-full object-cover"
                                style={{ filter: 'brightness(1.1)' }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/images/placeholder-whisky.png';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-white bg-opacity-30 flex items-center justify-center">
                                <img
                                  src="/images/placeholder-whisky.png"
                                  alt="기본 위스키 이미지"
                                  className="w-full h-full object-cover opacity-50"
                                />
                              </div>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <>
                        <div className="w-6 sm:w-8 md:w-10 h-12 sm:h-16 md:h-20 bg-white bg-opacity-30 rounded overflow-hidden">
                          <img
                            src="/images/placeholder-whisky.png"
                            alt="기본 위스키"
                            className="w-full h-full object-cover opacity-50"
                          />
                        </div>
                        <div className="w-6 sm:w-8 md:w-10 h-12 sm:h-16 md:h-20 bg-white bg-opacity-30 rounded overflow-hidden">
                          <img
                            src="/images/placeholder-whisky.png"
                            alt="기본 위스키"
                            className="w-full h-full object-cover opacity-50"
                          />
                        </div>
                        <div className="w-6 sm:w-8 md:w-10 h-12 sm:h-16 md:h-20 bg-white bg-opacity-30 rounded overflow-hidden">
                          <img
                            src="/images/placeholder-whisky.png"
                            alt="기본 위스키"
                            className="w-full h-full object-cover opacity-50"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-300 mb-6 sm:mb-8" />

            {/* 위스키 노트/리뷰 */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                <h3 className="text-lg sm:text-xl font-bold text-red-500">위스키 노트/리뷰</h3>
                <button className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 hover:scale-110 transition-all duration-200 transform">작성일 가기</button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {myNotes.map((note) => {
                  const handleGoToWhisky = () => {
                    router.push(`/whisky/${note.whiskyId}`)
                  }

                  return (
                    <div
                      key={note.id}
                      id={`review-${note.id}`}
                      className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-lg transition-all duration-300"
                    >
                      {/* 노트 헤더 */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
                        <div
                          className="flex items-center gap-2 cursor-pointer hover:text-amber-600 transition-colors"
                          onClick={handleGoToWhisky}
                          role="button"
                          tabIndex={0}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleGoToWhisky()
                            }
                          }}
                        >
                          {/* 프로필 사진 */}
                          <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full border border-gray-300 bg-gray-100 overflow-hidden flex-shrink-0">
                            {profileImage ? (
                              <img
                                src={profileImage}
                                alt="프로필"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                👤
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800 text-sm sm:text-base">{note.user}</span>
                            <span className="text-xs text-amber-600 font-medium">{note.whisky}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <span className="text-yellow-400">★</span>
                          <span className="font-medium text-gray-700">{note.rating}</span>
                          <span className="text-gray-500">{note.date}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleGoToWhisky()
                            }}
                            className="text-amber-600 px-2 py-1 hover:bg-amber-50 rounded transition-colors font-medium"
                          >
                            노트 보러 가기
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteReview(note.id)
                            }}
                            className="text-red-500 px-2 py-1 hover:bg-red-50 rounded transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>

                      {/* 노트 내용 - 단순 별점이 아닌 경우만 표시 */}
                      {note.content &&
                       note.content.trim() !== '' &&
                       !note.content.includes('별점') &&
                       note.content.trim() !== `별점 ${note.rating}점을 남겼습니다.` && (
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {note.content}
                        </p>
                      )}

                      {/* 좋아요, 댓글 수 */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>좋아요 {note.likes}</span>
                        <span>댓글 {note.comments.length}</span>
                      </div>

                      {/* 액션 버튼들 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button className="transition-all duration-200 hover:scale-110 transform text-gray-300 hover:text-red-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleComments(note.id.toString())}
                            className="text-gray-300 hover:text-blue-400 transition-all duration-200 hover:scale-110 transform"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                        </div>

                        {/* 답글 토글 버튼 - 항상 표시 */}
                        <button
                          onClick={() => toggleComments(note.id.toString())}
                          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors"
                        >
                          <span>{expandedComments[note.id.toString()] === true ? '답글 접기' : '답글 달기'}</span>
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${expandedComments[note.id.toString()] === true ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* 댓글 목록 - 접힌/펼쳐진 상태에 따라 표시 */}
                      {expandedComments[note.id.toString()] === true && note.comments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {note.comments.map((comment: Comment) => (
                            <div key={comment.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-100">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* 댓글 작성자 프로필 사진 */}
                                <div className="w-6 h-6 rounded-full border border-gray-300 bg-gray-100 overflow-hidden flex-shrink-0">
                                  {comment.user === nickname && profileImage ? (
                                    <img
                                      src={profileImage}
                                      alt="프로필"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                      👤
                                    </div>
                                  )}
                                </div>
                                <span className="text-sm font-medium text-gray-800 flex-shrink-0">{comment.user}</span>
                                <span className="text-sm text-gray-600 truncate" title={comment.content}>
                                  {truncateText(comment.content, 30)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs text-gray-500">{comment.date}</span>
                                {/* 댓글 작성자만 삭제 버튼 표시 */}
                                {comment.user === nickname && (
                                  <button
                                    onClick={() => handleDeleteReply(note.id, comment.id)}
                                    className="text-xs text-red-500 hover:text-red-700 px-1 py-0.5 hover:bg-red-50 rounded transition-colors"
                                  >
                                    삭제
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 댓글 작성란 - 댓글이 펼쳐진 상태일 때만 표시 */}
                      {expandedComments[note.id.toString()] === true && (
                        <div className="mt-3 border-t border-gray-100 pt-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="답글 달기..."
                              value={replyText[note.id.toString()] || ''}
                              onChange={(e) => setReplyText(prev => ({
                                ...prev,
                                [note.id.toString()]: e.target.value
                              }))}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleAddReply(note.id)
                                }
                              }}
                              className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => handleAddReply(note.id)}
                              disabled={!replyText[note.id.toString()]?.trim()}
                              className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              답글 달기
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* 더보기/접기 버튼 */}
              {notesData.length > 3 && (
                <div className="mt-4 sm:mt-6 text-center">
                  <button
                    onClick={() => setShowAllNotes(!showAllNotes)}
                    className="bg-red-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
                  >
                    {showAllNotes ? `접기` : `더보기 (${notesData.length - 3}개 더)`}
                  </button>
                </div>
              )}
            </div>

            {/* 내 게시글 섹션 */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-red-500">내 게시글</h3>
                <button
                  onClick={() => router.push('/community')}
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-800"
                >
                  전체보기 →
                </button>
              </div>

              <div className="space-y-3">
                {communityPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => router.push(`/community/post/${post.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        router.push(`/community/post/${post.id}`)
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base">{post.title}</h4>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>좋아요 {post.likes_count || 0}</span>
                      <span>댓글 {post.comments_count || 0}</span>
                    </div>
                  </div>
                ))}

                {communityPosts.length === 0 && (
                  <div className="text-center text-gray-500 py-8 text-sm">
                    작성한 게시글이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}