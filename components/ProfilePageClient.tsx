'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateNickname } from '../lib/userProfiles'
import { uploadAndSetAvatar } from '../lib/avatarStorage'
import { getUserWhiskyReviews } from '../lib/whiskyReviews'
import { getUserWhiskyLikes } from '../lib/whiskyLikes'
import { useWhiskyImage } from '../lib/updateWhiskyImages'
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

interface ProfilePageClientProps {
  initialReviews: ReviewWithWhisky[]
  initialWhiskies: WhiskyData[]
  initialStats: {
    reviewCount: number
    noteCount: number
    wishlistCount: number
  }
}

interface Comment {
  id: number
  user: string
  content: string
  date: string
}

export default function ProfilePageClient({
  initialReviews,
  initialWhiskies,
  initialStats
}: ProfilePageClientProps) {
  const router = useRouter()
  const { user, profile, signOut, loading: authLoading, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [nickname, setNickname] = useState(profile?.nickname || 'MrSilverr')
  const [profileImage, setProfileImage] = useState<string | null>(profile?.avatar_url || null)
  const [isDragging, setIsDragging] = useState(false)
  const [reviewedWhiskies, setReviewedWhiskies] = useState<WhiskyData[]>(initialWhiskies)
  const [showAllNotes, setShowAllNotes] = useState(false)
  const [expandedComments, setExpandedComments] = useState<{[key: string]: boolean}>({})
  const [replyText, setReplyText] = useState<{[key: string]: string}>({})
  const [notesData, setNotesData] = useState<ReviewWithWhisky[]>(initialReviews)
  const [userStats, setUserStats] = useState(initialStats)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      // 찜한 위스키 개수
      const likedWhiskies = await getUserWhiskyLikes()
      const wishlistCount = likedWhiskies.length

      // 사용자 리뷰 개수
      const userReviews = await getUserWhiskyReviews()
      const reviewCount = userReviews.length

      // 실제 노트가 있는 리뷰 개수 (단순 별점이 아닌 경우)
      const noteCount = userReviews.filter(review =>
        review.note && review.note.trim() !== '' &&
        !review.note.includes('별점') &&
        review.note.trim() !== `별점 ${review.rating}점을 남겼습니다.`
      ).length

      return { reviewCount, noteCount, wishlistCount }
    } catch (error) {
      console.error('통계 계산 중 오류:', error)
      return { reviewCount: 0, noteCount: 0, wishlistCount: 0 }
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
          const reviewsWithFormat = userReviews.map(review => ({
            id: review.id,
            user: profile?.nickname || '익명',
            whisky: review.whisky_name || '위스키',
            rating: review.rating,
            content: review.note || '',
            likes: 0,
            comments: [],
            date: new Date(review.created_at).toLocaleDateString(),
            whiskyImage: review.whisky_image || '',
            whiskyId: review.whisky_id,
            reviewId: review.id
          }))
          setNotesData(reviewsWithFormat)
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
    fileInputRef.current?.click()
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        console.log('이미지 업로드 시작...')
        const result = await uploadAndSetAvatar(file)

        if (result.success && result.url) {
          setProfileImage(result.url)
          console.log('✅ 프로필 이미지 업로드 성공:', result.url)
          toast.success('프로필 이미지가 업데이트되었습니다.')
          // AuthContext의 프로필 정보 새로고침
          await updateProfile()
        } else {
          console.error('이미지 업로드 실패:', result.error)
          toast.error(result.error || '이미지 업로드에 실패했습니다.')
        }
      } catch (error) {
        console.error('이미지 업로드 중 오류:', error)
        toast.error('이미지 업로드 중 오류가 발생했습니다.')
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      try {
        console.log('드래그 앤 드롭 이미지 업로드 시작...')
        const result = await uploadAndSetAvatar(file)

        if (result.success && result.url) {
          setProfileImage(result.url)
          console.log('✅ 프로필 이미지 업로드 성공 (드래그 앤 드롭):', result.url)
          toast.success('프로필 이미지가 업데이트되었습니다.')
          // AuthContext의 프로필 정보 새로고침
          await updateProfile()
        } else {
          console.error('이미지 업로드 실패:', result.error)
          toast.error(result.error || '이미지 업로드에 실패했습니다.')
        }
      } catch (error) {
        console.error('이미지 업로드 중 오류:', error)
        toast.error('이미지 업로드 중 오류가 발생했습니다.')
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
      // Supabase에서 리뷰 삭제는 whiskyReviews.ts의 deleteWhiskyReview 함수 사용
      const { deleteWhiskyReview } = await import('../lib/whiskyReviews')

      // 해당 리뷰 찾기
      const review = notesData.find(n => n.id === noteId)
      if (!review) return

      const success = await deleteWhiskyReview(review.whiskyId)
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
    <div className="min-h-screen bg-rose-50 px-4 md:px-6 py-6">
      {/* 헤더 */}
      <header className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
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
          <span className="text-xl font-bold text-red-500 font-[family-name:var(--font-jolly-lodger)]">PROFILE</span>
          <span className="text-lg font-bold text-amber-800 font-[family-name:var(--font-jolly-lodger)]">내 노트</span>
          <button
            onClick={() => router.push('/')}
            className="text-center hover:text-gray-600 transition-all duration-200 hover:scale-110 transform"
          >
            <div className="text-lg font-bold text-gray-800 font-[family-name:var(--font-jolly-lodger)]">HOME</div>
            <div className="text-xs text-gray-600">홈으로 돌아가기</div>
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-600 text-white px-5 py-2 rounded-full text-sm hover:bg-gray-500 transition-all duration-200 hover:scale-110 transform shadow-md hover:shadow-lg">
            로그아웃
          </button>
        </div>
      </header>

      {/* 뒤로가기 버튼 */}
      <div className="mb-8 ml-8 max-w-7xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="bg-rose-100 border border-rose-200 rounded-lg px-3 py-2 hover:bg-rose-150 transition-all duration-200 shadow-sm text-gray-700 hover:text-gray-800 text-sm font-medium hover:scale-105 transform hover:shadow-md hover:border-rose-300"
        >
          ← 메인으로
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* 왼쪽: 프로필 정보 */}
          <div className="lg:col-span-2">
            {/* 프로필 사진 */}
            <div className="mb-6">
              <div
                className={`w-32 h-32 border-3 rounded-full mx-auto mb-4 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
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

                {/* 호버 오버레이 */}
                <div className="absolute inset-0 bg-amber-900 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center rounded-full">
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-bold shadow-lg">
                    {profileImage ? '📸 변경' : '📷 추가'}
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

              <h2 className="text-xl font-bold text-amber-700 text-center mb-2 hover:text-amber-800 transition-colors cursor-pointer" onClick={handleImageClick}>
                프로필 변경하기
              </h2>
            </div>

            {/* 닉네임 */}
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <span className="text-lg font-medium text-gray-800">닉네임 :</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="border border-gray-300 px-2 py-1 rounded text-lg text-gray-800 focus:text-amber-800"
                  />
                ) : (
                  <span className="text-lg font-bold text-amber-800">{nickname}</span>
                )}
                <button
                  onClick={handleEditProfile}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 hover:scale-110 transition-all duration-200 transform shadow-sm hover:shadow-md"
                >
                  {isEditing ? '저장' : '변경'}
                </button>
              </div>
            </div>

            {/* 통계 */}
            <div className="border border-rose-300 rounded mb-8 bg-rose-50">
              <div className="grid grid-cols-3 text-center">
                <div className="border-r border-rose-300 py-4">
                  <div className="text-2xl font-bold text-rose-800">{userStats.reviewCount}</div>
                  <div className="text-sm text-rose-700">내가 평가한 술</div>
                </div>
                <div className="border-r border-rose-300 py-4">
                  <div className="text-2xl font-bold text-rose-800">{userStats.noteCount}</div>
                  <div className="text-sm text-rose-700">노트</div>
                </div>
                <div className="py-4">
                  <div className="text-2xl font-bold text-rose-800">{userStats.wishlistCount}</div>
                  <div className="text-sm text-rose-700">찜</div>
                </div>
              </div>
            </div>

            {/* 남긴 별점 섹션 */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">남긴 별점</h3>
              <div className="space-y-3">
                {notesData.slice(0, 5).map((review) => (
                  <div key={review.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm">{review.rating}</span>
                    </div>
                    <span className="text-sm text-gray-700">{review.whisky}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 위스키 컬렉션 및 노트 */}
          <div className="lg:col-span-3">
            {/* 위스키 컬렉션 박스 */}
            <div className="mb-8">
              <div className="bg-amber-900 p-4 md:p-6 rounded-lg">
                <div className="bg-amber-800 p-3 md:p-4 rounded mb-4">
                  <h3 className="text-white text-center text-lg font-bold">위스키 컬렉션</h3>
                </div>
                <div className="bg-amber-800 p-6 md:p-8 rounded flex items-center justify-center">
                  <div className="flex gap-4 md:gap-8">
                    {reviewedWhiskies.length > 0 ? (
                      reviewedWhiskies.slice(0, 3).map((whisky, index) => (
                        <div key={index} className="w-8 md:w-10 h-16 md:h-20 bg-white bg-opacity-20 rounded overflow-hidden flex items-center justify-center">
                          <img
                            src={useWhiskyImage(whisky.id, whisky.image)}
                            alt={whisky.name}
                            className="w-full h-full object-cover"
                            style={{ filter: 'brightness(1.1)' }}
                          />
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="w-8 md:w-10 h-16 md:h-20 bg-white bg-opacity-30 rounded"></div>
                        <div className="w-8 md:w-10 h-16 md:h-20 bg-white bg-opacity-30 rounded"></div>
                        <div className="w-8 md:w-10 h-16 md:h-20 bg-white bg-opacity-30 rounded"></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-300 mb-8" />

            {/* 위스키 노트/리뷰 */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-red-500">위스키 노트/리뷰</h3>
                <button className="text-sm text-gray-600 hover:text-gray-800 hover:scale-110 transition-all duration-200 transform">작성일 가기</button>
              </div>

              <div className="space-y-4">
                {myNotes.map((note) => (
                  <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300">
                    {/* 노트 헤더 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {/* 프로필 사진 */}
                        <div className="w-8 h-8 rounded-full border border-gray-300 bg-gray-100 overflow-hidden flex-shrink-0">
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
                        <span className="font-medium text-gray-800">{note.user}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">★</span>
                        <span className="font-medium text-gray-700">{note.rating}</span>
                        <span className="text-sm text-gray-500">{note.date}</span>
                        <button
                          onClick={() => handleDeleteReview(note.id)}
                          className="text-red-500 text-xs px-2 py-1 hover:bg-red-50 rounded transition-colors"
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
                ))}
              </div>

              {/* 더보기/접기 버튼 */}
              {notesData.length > 3 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAllNotes(!showAllNotes)}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    {showAllNotes ? `접기` : `더보기 (${notesData.length - 3}개 더)`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}