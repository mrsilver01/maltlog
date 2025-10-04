'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getWhiskyData, getReviews, loadWhiskyDataFromStorage, loadReviewsFromStorage, updateAverageRating, saveWhiskyDataToStorage, WhiskyData, Review } from '../../../../lib/whiskyData'
import LoadingAnimation from '../../../../components/LoadingAnimation'
import { usePageTransition } from '../../../../hooks/usePageTransition'

export default function ReviewsPage() {
  const router = useRouter()
  const params = useParams()
  const [whiskyData, setWhiskyData] = useState<WhiskyData | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userNickname, setUserNickname] = useState('')
  const [expandedComments, setExpandedComments] = useState<{[key: string]: boolean}>({})
  const [showCommentForm, setShowCommentForm] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [showDropdown, setShowDropdown] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [userNote, setUserNote] = useState('')
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null)
  const { isTransitioning, transitionMessage, navigateWithTransition } = usePageTransition()

  // 데이터 로드
  useEffect(() => {
    const whiskyId = params?.id as string
    if (whiskyId) {
      loadWhiskyDataFromStorage()
      loadReviewsFromStorage()

      const data = getWhiskyData(whiskyId)

      // reviewsData에서 리뷰 데이터 가져오기 (위스키 상세 페이지와 동일한 방식)
      const reviewsData = JSON.parse(localStorage.getItem('reviewsData') || '{}')
      const reviewData = reviewsData[whiskyId] || getReviews(whiskyId)

      setWhiskyData(data)
      setReviews(reviewData)

      // 애니메이션 완료를 위해 최소 3.5초 대기
      setTimeout(() => {
        setLoading(false)
      }, 3500)
    }
  }, [params?.id])

  // 로그인 상태 확인 및 프로필 이미지 실시간 업데이트
  useEffect(() => {
    const updateUserData = () => {
      if (typeof window !== 'undefined') {
        const loginStatus = localStorage.getItem('isLoggedIn') === 'true'
        const nickname = localStorage.getItem('userNickname') || ''
        const profileImage = localStorage.getItem('userProfileImage')
        setIsLoggedIn(loginStatus)
        setUserNickname(nickname)
        setUserProfileImage(profileImage)
      }
    }

    // 초기 로딩
    updateUserData()

    // storage 이벤트 리스너 (다른 탭에서 변경 감지)
    window.addEventListener('storage', updateUserData)

    // 주기적으로 체크 (같은 탭에서 변경 감지)
    const interval = setInterval(updateUserData, 1000)

    return () => {
      window.removeEventListener('storage', updateUserData)
      clearInterval(interval)
    }
  }, [])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showDropdown && !target.closest('.dropdown-menu')) {
        setShowDropdown(null)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  // 사용자가 특정 리뷰에 좋아요를 눌렀는지 확인
  const hasUserLikedReview = (reviewId: string) => {
    if (!isLoggedIn) return false
    const userNickname = localStorage.getItem('userNickname')
    if (!userNickname) return false

    const reviewLikes = JSON.parse(localStorage.getItem('reviewLikes') || '{}')
    const userLikes = reviewLikes[userNickname] || []
    return userLikes.includes(reviewId)
  }

  // 댓글 토글 함수
  const toggleComments = (reviewId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }))
  }

  // 댓글 삭제 함수
  const handleDeleteComment = (reviewId: string, commentId: number) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return

    const whiskyId = params?.id as string
    if (!whiskyId) return

    const updatedReviews = reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          comments: review.comments.filter(comment => comment.id !== commentId)
        }
      }
      return review
    })

    setReviews(updatedReviews)

    // reviewsData에 저장
    const reviewsData = JSON.parse(localStorage.getItem('reviewsData') || '{}')
    reviewsData[whiskyId] = updatedReviews
    localStorage.setItem('reviewsData', JSON.stringify(reviewsData))
  }

  // 답글 삭제 함수
  const handleDeleteReply = (reviewId: string, commentId: number, replyId: number) => {
    if (!confirm('정말로 이 답글을 삭제하시겠습니까?')) return

    const whiskyId = params?.id as string
    if (!whiskyId) return

    const updatedReviews = reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          comments: review.comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: comment.replies.filter(reply => reply.id !== replyId)
              }
            }
            return comment
          })
        }
      }
      return review
    })

    setReviews(updatedReviews)

    // reviewsData에 저장
    const reviewsData = JSON.parse(localStorage.getItem('reviewsData') || '{}')
    reviewsData[whiskyId] = updatedReviews
    localStorage.setItem('reviewsData', JSON.stringify(reviewsData))
  }

  // 리뷰 좋아요 토글 함수
  const handleReviewLike = (reviewId: string) => {
    if (!isLoggedIn) {
      alert('좋아요를 누르려면 로그인해주세요.')
      return
    }

    const whiskyId = params?.id as string
    if (!whiskyId) return

    const currentlyLiked = hasUserLikedReview(reviewId)

    const updatedReviews = reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          likes: currentlyLiked ? review.likes - 1 : review.likes + 1
        }
      }
      return review
    })

    setReviews(updatedReviews)

    // reviewsData에 저장
    const reviewsData = JSON.parse(localStorage.getItem('reviewsData') || '{}')
    reviewsData[whiskyId] = updatedReviews
    localStorage.setItem('reviewsData', JSON.stringify(reviewsData))

    // localStorage에 좋아요 상태 저장
    if (typeof window !== 'undefined') {
      const reviewLikes = JSON.parse(localStorage.getItem('reviewLikes') || '{}')
      const userLikes = reviewLikes[userNickname] || []

      if (currentlyLiked) {
        reviewLikes[userNickname] = userLikes.filter((id: string) => id !== reviewId)
      } else {
        reviewLikes[userNickname] = [...userLikes, reviewId]
      }

      localStorage.setItem('reviewLikes', JSON.stringify(reviewLikes))
    }
  }

  // 댓글 작성 함수
  const handleAddComment = (reviewId: string) => {
    if (!isLoggedIn) {
      alert('댓글을 작성하려면 로그인해주세요.')
      return
    }

    if (!commentText.trim()) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    const whiskyId = params?.id as string
    if (!whiskyId) return

    const newComment = {
      id: Date.now(),
      user: userNickname,
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
      replies: []
    }

    const updatedReviews = reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          comments: [...review.comments, newComment]
        }
      }
      return review
    })

    setReviews(updatedReviews)

    // reviewsData에 저장
    const reviewsData = JSON.parse(localStorage.getItem('reviewsData') || '{}')
    reviewsData[whiskyId] = updatedReviews
    localStorage.setItem('reviewsData', JSON.stringify(reviewsData))

    setCommentText('')
    setShowCommentForm(null)
  }

  // 리뷰 제출 함수
  const handleSubmitReview = () => {
    if (!isLoggedIn) {
      alert('리뷰를 작성하려면 로그인해주세요.')
      return
    }

    if (userRating === 0) {
      alert('별점을 선택해주세요.')
      return
    }

    const whiskyId = params?.id as string
    if (!whiskyId) return

    // 사용자가 이미 리뷰를 작성했는지 확인
    const existingReview = reviews.find(review => review.user === userNickname)
    if (existingReview) {
      alert('이미 이 위스키에 대한 리뷰를 작성하셨습니다.')
      return
    }

    const reviewContent = userNote.trim() || `별점 ${userRating}점을 남겼습니다.`

    const newReview = {
      id: `review-${Date.now()}`,
      user: userNickname,
      rating: userRating,
      comment: reviewContent,
      likes: 0,
      createdAt: new Date().toISOString(),
      comments: []
    }

    // 리뷰 목록에 추가
    const updatedReviews = [newReview, ...reviews]
    setReviews(updatedReviews)

    // reviewsData에 저장 (위스키 상세 페이지와 동일한 방식)
    const reviewsData = JSON.parse(localStorage.getItem('reviewsData') || '{}')
    reviewsData[whiskyId] = updatedReviews
    localStorage.setItem('reviewsData', JSON.stringify(reviewsData))

    // 평균 별점 업데이트
    updateAverageRating(whiskyId)
    saveWhiskyDataToStorage()

    // 위스키 데이터 업데이트
    const totalReviews = updatedReviews.length
    const avgRating = totalReviews > 0
      ? Math.round((updatedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews) * 10) / 10
      : 0

    setWhiskyData(prev => prev ? { ...prev, avgRating, totalReviews } : prev)

    // 폼 초기화
    setUserRating(0)
    setUserNote('')
    setShowReviewForm(false)

    alert('리뷰가 작성되었습니다!')
  }

  // 리뷰 삭제 함수 추가
  const handleDeleteReview = (reviewId: string) => {
    const userNickname = localStorage.getItem('userNickname')
    if (!userNickname) {
      alert('리뷰를 삭제하려면 로그인해주세요.')
      return
    }

    if (confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      const updatedReviews = reviews.filter(review => review.id !== reviewId)
      setReviews(updatedReviews)

      // reviewsData에 저장하여 다른 페이지와 동기화
      if (whiskyData) {
        const reviewsData = JSON.parse(localStorage.getItem('reviewsData') || '{}')
        reviewsData[whiskyData.id] = updatedReviews
        localStorage.setItem('reviewsData', JSON.stringify(reviewsData))
      }

      alert('리뷰가 삭제되었습니다.')
    }
  }


  if (loading) {
    return <LoadingAnimation message="리뷰를 불러오는 중..." />
  }

  if (!whiskyData) {
    return (
      <div className="min-h-screen bg-rose-50 p-6 flex items-center justify-center">
        <div className="text-2xl text-gray-600">위스키를 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50 p-6">
      {/* 페이지 전환 애니메이션 */}
      {isTransitioning && (
        <LoadingAnimation message={transitionMessage} />
      )}

      {/* 헤더 */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-16 flex items-center justify-center">
            <img
              src="/whiskies/LOGO.png"
              alt="Maltlog Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-amber-800 font-[family-name:var(--font-jolly-lodger)]">Maltlog</h1>
          <span className="text-4xl font-bold text-red-500 ml-2 font-[family-name:var(--font-jolly-lodger)]">Notes</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => navigateWithTransition('/', '홈으로 이동 중...')}
            className="text-xl font-bold text-gray-600 hover:text-red-500 transition-all duration-200 hover:scale-110 transform font-[family-name:var(--font-jolly-lodger)]"
          >
            HOME
          </button>
        </div>
      </header>

      {/* 뒤로가기 버튼 */}
      <div className="mb-8 ml-8">
        <button
          onClick={() => router.back()}
          className="bg-rose-100 border border-rose-200 rounded-lg px-3 py-2 hover:bg-rose-150 transition-all duration-200 shadow-sm text-gray-700 hover:text-gray-800 text-sm font-medium hover:scale-105 transform hover:shadow-md hover:border-rose-300"
        >
          ← 뒤로 가기
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-6xl mx-auto">
        {/* 위스키 정보 헤더 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-28 bg-gray-100 rounded flex items-center justify-center">
              <img
                src={whiskyData.image}
                alt={whiskyData.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-500 mb-2">{whiskyData.name}</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 text-xl">★</span>
                  <span className="text-xl font-bold text-gray-800">
                    {whiskyData.avgRating > 0 ? whiskyData.avgRating : '0.0'}
                  </span>
                </div>
                <span className="text-gray-600">({whiskyData.totalReviews}개의 리뷰)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 리뷰 작성 섹션 */}
        {isLoggedIn && !reviews.find(review => review.user === userNickname) && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">내 리뷰 작성</h3>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                {showReviewForm ? '작성 취소' : '리뷰 작성'}
              </button>
            </div>

            {showReviewForm && (
              <div className="space-y-4">
                {/* 별점 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">별점</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setUserRating(star)}
                        className={`text-2xl transition-colors ${
                          star <= userRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {userRating > 0 && `${userRating}점`}
                    </span>
                  </div>
                </div>

                {/* 노트 작성 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">노트 (선택사항)</label>
                  <textarea
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="이 위스키에 대한 생각을 자유롭게 작성해보세요..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* 제출 버튼 */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitReview}
                    disabled={userRating === 0}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    리뷰 작성
                  </button>
                  <button
                    onClick={() => {
                      setShowReviewForm(false)
                      setUserRating(0)
                      setUserNote('')
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 전체 리뷰 목록 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">전체 리뷰 ({reviews.length}개)</h3>

          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* 프로필 사진 */}
                      <div className="w-8 h-8 rounded-full border border-gray-300 bg-gray-100 overflow-hidden flex-shrink-0">
                        {review.user === userNickname && userProfileImage ? (
                          <img
                            src={userProfileImage}
                            alt="프로필"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            👤
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-800">{review.user}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="font-medium text-gray-700">{review.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      {/* 본인 리뷰인 경우 삭제 버튼 표시 */}
                      {review.user === userNickname && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-500 hover:text-red-700 text-sm px-2 py-1 hover:bg-red-50 rounded transition-colors"
                          title="리뷰 삭제"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 별점만 남긴 경우 comment 숨기기 */}
                  {review.comment.trim() !== `별점 ${review.rating}점을 남겼습니다.` && (
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {review.comment}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>좋아요 {review.likes}</span>
                    <span>댓글 {review.comments.length}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleReviewLike(review.id)}
                        className={`transition-all duration-200 hover:scale-110 transform ${
                          hasUserLikedReview(review.id)
                            ? 'text-red-500'
                            : 'text-gray-300 hover:text-red-400'
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill={hasUserLikedReview(review.id) ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setShowCommentForm(showCommentForm === review.id ? null : review.id)}
                        className="text-gray-300 hover:text-blue-400 transition-all duration-200 hover:scale-110 transform"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                    </div>

                    {/* 댓글 토글 버튼 */}
                    {review.comments.length > 0 && (
                      <button
                        onClick={() => toggleComments(review.id)}
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors"
                      >
                        <span>{expandedComments[review.id] ? '댓글 접기' : '댓글 보기'}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${expandedComments[review.id] ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* 댓글 표시 - 토글 상태에 따라 표시 */}
                  {review.comments.length > 0 && expandedComments[review.id] && (
                    <div className="mt-4 ml-4 space-y-3 border-l-2 border-gray-100 pl-4">
                      {review.comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {/* 댓글 작성자 프로필 사진 */}
                              <div className="w-6 h-6 rounded-full border border-gray-300 bg-gray-100 overflow-hidden flex-shrink-0">
                                {comment.user === userNickname && userProfileImage ? (
                                  <img
                                    src={userProfileImage}
                                    alt="프로필"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                    👤
                                  </div>
                                )}
                              </div>
                              <span className="text-sm font-medium text-gray-800">{comment.user}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                              {/* 댓글 작성자만 점 3개 메뉴 표시 */}
                              {comment.user === userNickname && (
                                <div className="relative dropdown-menu">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setShowDropdown(showDropdown === `comment-${comment.id}` ? null : `comment-${comment.id}`)
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                                    </svg>
                                  </button>
                                  {showDropdown === `comment-${comment.id}` && (
                                    <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-20 min-w-[80px]">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          // TODO: 수정 기능 구현
                                          alert('수정 기능은 곧 추가될 예정입니다.')
                                          setShowDropdown(null)
                                        }}
                                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        수정
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteComment(review.id, comment.id)
                                          setShowDropdown(null)
                                        }}
                                        className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                                      >
                                        삭제
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>

                          {/* 답글 표시 */}
                          {comment.replies.length > 0 && (
                            <div className="mt-2 ml-4 space-y-2">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="bg-white p-2 rounded border-l-2 border-blue-200">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-800">{reply.user}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                      </span>
                                      {/* 답글 작성자만 점 3개 메뉴 표시 */}
                                      {reply.user === userNickname && (
                                        <div className="relative dropdown-menu">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setShowDropdown(showDropdown === `reply-${reply.id}` ? null : `reply-${reply.id}`)
                                            }}
                                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                          >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                                            </svg>
                                          </button>
                                          {showDropdown === `reply-${reply.id}` && (
                                            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-20 min-w-[80px]">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  // TODO: 수정 기능 구현
                                                  alert('수정 기능은 곧 추가될 예정입니다.')
                                                  setShowDropdown(null)
                                                }}
                                                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                              >
                                                수정
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  handleDeleteReply(review.id, comment.id, reply.id)
                                                  setShowDropdown(null)
                                                }}
                                                className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                                              >
                                                삭제
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-800">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 댓글 작성 폼 */}
                  {showCommentForm === review.id && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="댓글을 입력하세요..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddComment(review.id)
                            }
                          }}
                          className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => handleAddComment(review.id)}
                          disabled={!commentText.trim()}
                          className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          작성
                        </button>
                        <button
                          onClick={() => setShowCommentForm(null)}
                          className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-2">아직 작성된 리뷰가 없습니다.</p>
              <p className="text-gray-400 text-sm">첫 번째 리뷰를 작성해보세요!</p>
              <button
                onClick={() => router.back()}
                className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                리뷰 작성하러 가기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}