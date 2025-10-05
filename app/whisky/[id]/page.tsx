'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getWhiskyData, getReviews, addReview, addComment, addReply, WhiskyData, Review, Comment, updateAverageRating, loadWhiskyDataFromStorage, loadReviewsFromStorage, saveWhiskyDataToStorage } from '../../../lib/whiskyData'
import { authHelpers } from '../../../lib/supabase'
import { getUserWhiskyReview, saveWhiskyReview, deleteWhiskyReview, hasUserReviewedWhisky, getUserWhiskyRating } from '../../../lib/whiskyReviews'
import LoadingAnimation from '../../../components/LoadingAnimation'
import { WhiskyDetailSkeleton } from '../../../components/Skeleton'
import { usePageTransition } from '../../../hooks/usePageTransition'
import RatingSystem from '../../../components/RatingSystem'

export default function WhiskyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [userRating, setUserRating] = useState(0)
  const [userNote, setUserNote] = useState('')
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [whiskyData, setWhiskyData] = useState<WhiskyData | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [hasUserRated, setHasUserRated] = useState(false)
  const [hasUserReviewed, setHasUserReviewed] = useState(false)
  const [supabaseUserReview, setSupabaseUserReview] = useState<any>(null)
  const [isLoadingReview, setIsLoadingReview] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loadingComments, setLoadingComments] = useState<{[key: string]: boolean}>({})
  const [loadingReplies, setLoadingReplies] = useState<{[key: string]: boolean}>({})
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showDropdown, setShowDropdown] = useState<string | null>(null)
  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editRating, setEditRating] = useState(0)
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null)
  const { isTransitioning, transitionMessage, navigateWithTransition } = usePageTransition()

  // 위스키 데이터 로드
  useEffect(() => {
    const whiskyId = params?.id as string
    if (whiskyId) {
      // localStorage에서 데이터 로드
      loadWhiskyDataFromStorage()
      loadReviewsFromStorage()

      const data = getWhiskyData(whiskyId)

      // reviewsData에서 우선 로드, 없으면 기본 데이터 사용
      const reviewsData = JSON.parse(localStorage.getItem('reviewsData') || '{}')
      const reviewData = reviewsData[whiskyId] || getReviews(whiskyId)

      setWhiskyData(data)
      setReviews(reviewData)

      // 사용자가 이미 평가했는지 확인
      checkUserRatingStatus(whiskyId, reviewData)

      // Supabase에서 사용자 리뷰 로드
      if (data) {
        loadUserReviewFromSupabase(data.name)
      }

      // 애니메이션 완료를 위해 1초 대기 (직접 URL 접근 시에만)
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    }
  }, [params?.id])

  // 로그인 상태 확인 및 프로필 이미지 실시간 업데이트
  useEffect(() => {
    const updateUserData = () => {
      if (typeof window !== 'undefined') {
        const loginStatus = localStorage.getItem('isLoggedIn') === 'true'
        const profileImage = localStorage.getItem('userProfileImage')
        setIsLoggedIn(loginStatus)
        setUserProfileImage(profileImage)

        // 로그인 상태 변경 시 리뷰 상태 재확인
        if (params?.id && whiskyData) {
          checkUserRatingStatus(params.id as string, reviews)
        }
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

  // 페이지 로드 시 로컬스토리지에서 별점 데이터 복원
  useEffect(() => {
    if (typeof window !== 'undefined' && whiskyData) {
      const savedWhiskyData = JSON.parse(localStorage.getItem('whiskyData') || '{}')
      if (savedWhiskyData[whiskyData.id]) {
        setWhiskyData(prev => prev ? { ...prev, ...savedWhiskyData[whiskyData.id] } : prev)
      }
    }
  }, [whiskyData?.id])

  // 로그인 상태 변경시 사용자 평가 상태 재확인
  useEffect(() => {
    if (params?.id && whiskyData) {
      checkUserRatingStatus(params.id as string, reviews)
      // 로그인 상태 변경 시 Supabase 리뷰도 다시 로드
      if (isLoggedIn) {
        loadUserReviewFromSupabase(whiskyData.name)
      } else {
        setSupabaseUserReview(null)
      }
    }
  }, [isLoggedIn, params?.id, whiskyData, reviews])

  // Supabase에서 사용자 리뷰 로드
  const loadUserReviewFromSupabase = async (whiskyName: string) => {
    if (!isLoggedIn) {
      setSupabaseUserReview(null)
      return
    }

    setIsLoadingReview(true)
    try {
      const review = await getUserWhiskyReview(whiskyName)
      setSupabaseUserReview(review)

      // Supabase 리뷰 데이터로 상태 업데이트
      if (review) {
        setHasUserRated(true)
        setHasUserReviewed(!!review.note && review.note.trim() !== '')
        setUserRating(review.rating)
        setUserNote(review.note || '')
      } else {
        setHasUserRated(false)
        setHasUserReviewed(false)
        setUserRating(0)
        setUserNote('')
      }
    } catch (error) {
      console.error('사용자 리뷰 로드 실패:', error)
    } finally {
      setIsLoadingReview(false)
    }
  }

  // 사용자 평가 상태 확인 (기존 localStorage 로직과 병행)
  const checkUserRatingStatus = (whiskyId: string, reviewData: Review[]) => {
    if (typeof window !== 'undefined') {
      if (!isLoggedIn) {
        // 로그아웃 상태에서는 평가/리뷰 상태를 false로 설정
        setHasUserRated(false)
        setHasUserReviewed(false)
        return
      }

      const userNickname = localStorage.getItem('userNickname') || '익명 사용자'

      // 로그인된 사용자의 경우 localStorage에서 평가 여부 확인 (기존 로직 유지)
      const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}')
      const hasRated = userRatings[whiskyId] || false

      // Supabase 데이터가 없는 경우에만 localStorage 데이터 사용
      if (!supabaseUserReview) {
        setHasUserRated(hasRated)

        // 리뷰 작성 여부 확인 (실제 노트가 있는 경우만, 로그인된 사용자만)
        const hasReviewed = reviewData.some(review =>
          review.user === userNickname &&
          review.comment &&
          review.comment.trim() !== `별점 ${review.rating}점을 남겼습니다.`
        )
        setHasUserReviewed(hasReviewed)
      }
    }
  }

  const handleSubmitNote = async () => {
    // 로그인 확인
    if (!isLoggedIn) {
      alert('리뷰를 작성하려면 로그인해주세요.')
      return
    }

    if (!whiskyData || !userNote.trim()) {
      alert('노트를 입력해주세요.')
      return
    }

    if (userRating === 0) {
      alert('별점을 선택해주세요.')
      return
    }

    try {
      // Supabase에 리뷰 저장
      const success = await saveWhiskyReview(whiskyData.name, userRating, userNote.trim())

      if (success) {
        // 성공 시 상태 업데이트
        setHasUserRated(true)
        setHasUserReviewed(true)
        setShowNoteForm(false)

        // Supabase에서 업데이트된 리뷰 다시 로드
        await loadUserReviewFromSupabase(whiskyData.name)

        alert('리뷰가 성공적으로 저장되었습니다!')

        // 기존 localStorage 로직도 유지 (하위 호환성)
        const userNickname = localStorage.getItem('userNickname') || '익명 사용자'
        const newReview = addReview(whiskyData.id, {
          user: userNickname,
          rating: userRating,
          comment: userNote.trim()
        })

        const updatedReviews = (() => {
          const existingIndex = reviews.findIndex(r => r.user === userNickname)
          if (existingIndex !== -1) {
            const updated = [...reviews]
            updated[existingIndex] = newReview
            return updated
          } else {
            return [newReview, ...reviews]
          }
        })()
        setReviews(updatedReviews)

        // reviewsData에 저장
        const reviewsData = JSON.parse(localStorage.getItem('reviewsData') || '{}')
        reviewsData[whiskyData.id] = updatedReviews
        localStorage.setItem('reviewsData', JSON.stringify(reviewsData))

        // 사용자 프로필에 위스키 추가 (노트 작성 시)
        if (typeof window !== 'undefined' && whiskyData) {
          const userNickname = localStorage.getItem('userNickname')
          if (userNickname) {
            const userWhiskies = JSON.parse(localStorage.getItem('userWhiskies') || '{}')
            if (!userWhiskies[userNickname]) {
              userWhiskies[userNickname] = []
            }

            const existingWhisky = userWhiskies[userNickname].find((w: any) => w.id === whiskyData.id)
            if (!existingWhisky) {
              userWhiskies[userNickname].push({
                id: whiskyData.id,
                name: whiskyData.name,
                image: whiskyData.image,
                rating: userRating,
                addedAt: new Date().toISOString()
              })
              localStorage.setItem('userWhiskies', JSON.stringify(userWhiskies))
            }
          }
        }
      } else {
        alert('리뷰 저장에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('리뷰 저장 오류:', error)
      alert('리뷰 저장 중 오류가 발생했습니다.')
    }
  }

  // 별점만 저장하는 함수 (로그인된 사용자용) - Supabase 사용
  const handleRatingOnlySubmit = async (rating: number) => {
    if (!whiskyData) return

    // 로그인 확인
    if (!isLoggedIn) {
      alert('평점을 남기려면 로그인해주세요.')
      return
    }

    try {
      // Supabase에 평점만 저장 (노트 없이)
      const success = await saveWhiskyReview(whiskyData.name, rating)

      if (success) {
        // 성공 시 상태 업데이트
        setHasUserRated(true)
        setUserRating(rating)

        // Supabase에서 업데이트된 리뷰 다시 로드
        await loadUserReviewFromSupabase(whiskyData.name)

        console.log(`${whiskyData.name}에 ${rating}점 평점을 남겼습니다.`)

        // 기존 localStorage 로직도 유지 (하위 호환성)
        const userNickname = localStorage.getItem('userNickname') || '익명 사용자'
        const newReview = addReview(whiskyData.id, {
          user: userNickname,
          rating: rating,
          comment: `별점 ${rating}점을 남겼습니다.`
        })

        const updatedReviews = (() => {
          const userIdentifier = userNickname
          const existingIndex = reviews.findIndex(r => r.user === userIdentifier)
          if (existingIndex !== -1) {
            const updated = [...reviews]
            updated[existingIndex] = newReview
            return updated
          } else {
            return [newReview, ...reviews]
          }
        })()
        setReviews(updatedReviews)

        // reviewsData에 저장
        const reviewsData = JSON.parse(localStorage.getItem('reviewsData') || '{}')
        reviewsData[whiskyData.id] = updatedReviews
        localStorage.setItem('reviewsData', JSON.stringify(reviewsData))

        // 로컬스토리지에 평가 기록 저장
        if (typeof window !== 'undefined') {
          const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}')
          userRatings[whiskyData.id] = true
          localStorage.setItem('userRatings', JSON.stringify(userRatings))
        }

        // 위스키 데이터 업데이트
        setWhiskyData(prev => {
          if (!prev) return prev
          return {
            ...prev,
            avgRating: Math.round(((prev.avgRating * prev.totalReviews + rating) / (prev.totalReviews + 1)) * 10) / 10,
            totalReviews: prev.totalReviews + 1
          }
        })

        // 사용자 프로필에 위스키 추가
        if (typeof window !== 'undefined' && whiskyData) {
          const userNickname = localStorage.getItem('userNickname')
          if (userNickname) {
            const userWhiskies = JSON.parse(localStorage.getItem('userWhiskies') || '{}')
            if (!userWhiskies[userNickname]) {
              userWhiskies[userNickname] = []
            }

            const existingWhisky = userWhiskies[userNickname].find((w: any) => w.id === whiskyData.id)
            if (!existingWhisky) {
              userWhiskies[userNickname].push({
                id: whiskyData.id,
                name: whiskyData.name,
                image: whiskyData.image,
                rating: rating,
                addedAt: new Date().toISOString()
              })
              localStorage.setItem('userWhiskies', JSON.stringify(userWhiskies))
            }
          }
        }
      } else {
        alert('평점 저장에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('평점 저장 오류:', error)
      alert('평점 저장 중 오류가 발생했습니다.')
    }
  }

  // 댓글 추가 함수
  const handleAddComment = async (reviewId: string) => {
    if (!isLoggedIn) {
      alert('댓글을 작성하려면 로그인해주세요.')
      return
    }

    if (!commentText.trim() || !whiskyData) return

    // 로딩 상태 시작
    setLoadingComments(prev => ({ ...prev, [reviewId]: true }))

    try {
      // 실제 환경에서는 API 호출 시뮬레이션을 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 800))

      const userNickname = localStorage.getItem('userNickname') || '익명 사용자'
      const newComment = addComment(whiskyData.id, reviewId, {
        user: userNickname,
        content: commentText.trim()
      })

      // 리뷰 목록 업데이트
      const updatedReviews = reviews.map(review =>
        review.id === reviewId
          ? { ...review, comments: [...review.comments, newComment] }
          : review
      )
      setReviews(updatedReviews)

      // reviewsData에도 저장
      const reviewsData = JSON.parse(localStorage.getItem('reviewsData') || '{}')
      reviewsData[whiskyData.id] = updatedReviews
      localStorage.setItem('reviewsData', JSON.stringify(reviewsData))

      setCommentText('')
      setShowCommentForm(null)
    } catch (error) {
      alert('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      // 로딩 상태 종료
      setLoadingComments(prev => ({ ...prev, [reviewId]: false }))
    }
  }

  // 답글 추가 함수
  const handleAddReply = async (reviewId: string, commentId: string) => {
    if (!isLoggedIn) {
      alert('답글을 작성하려면 로그인해주세요.')
      return
    }

    if (!replyText.trim() || !whiskyData) return

    // 로딩 상태 시작
    const replyKey = `${reviewId}-${commentId}`
    setLoadingReplies(prev => ({ ...prev, [replyKey]: true }))

    try {
      // 실제 환경에서는 API 호출 시뮬레이션을 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 800))

      const userNickname = localStorage.getItem('userNickname') || '익명 사용자'
      const newReply = addReply(whiskyData.id, reviewId, commentId, {
        user: userNickname,
        content: replyText.trim()
      })

      // 리뷰 목록 업데이트
      const updatedReviews = reviews.map(review =>
        review.id === reviewId
          ? {
              ...review,
              comments: review.comments.map(comment =>
                comment.id === commentId
                  ? { ...comment, replies: [...comment.replies, newReply] }
                  : comment
              )
            }
          : review
      )
      setReviews(updatedReviews)

      // reviewsData에도 저장
      const reviewsData = JSON.parse(localStorage.getItem('reviewsData') || '{}')
      reviewsData[whiskyData.id] = updatedReviews
      localStorage.setItem('reviewsData', JSON.stringify(reviewsData))

      setReplyText('')
      setShowReplyForm(null)
    } catch (error) {
      alert('답글 작성 중 오류가 발생했습니다.')
    } finally {
      // 로딩 상태 종료
      setLoadingReplies(prev => ({ ...prev, [replyKey]: false }))
    }
  }

  // 답글 삭제 함수
  const handleDeleteComment = (reviewId: string, commentId: string) => {
    if (!isLoggedIn) {
      alert('댓글을 삭제하려면 로그인해주세요.')
      return
    }

    if (confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      const updatedReviews = reviews.map(review =>
        review.id === reviewId
          ? { ...review, comments: review.comments.filter(comment => comment.id !== commentId) }
          : review
      )
      setReviews(updatedReviews)

      // reviewsData에 저장
      if (whiskyData) {
        const reviewsData = JSON.parse(localStorage.getItem('reviewsData') || '{}')
        reviewsData[whiskyData.id] = updatedReviews
        localStorage.setItem('reviewsData', JSON.stringify(reviewsData))
      }
    }
  }

  const handleDeleteReply = (reviewId: string, commentId: string, replyId: string) => {
    if (!isLoggedIn) {
      alert('답글을 삭제하려면 로그인해주세요.')
      return
    }

    if (confirm('정말로 이 답글을 삭제하시겠습니까?')) {
      const updatedReviews = reviews.map(review =>
        review.id === reviewId
          ? {
              ...review,
              comments: review.comments.map(comment =>
                comment.id === commentId
                  ? { ...comment, replies: comment.replies.filter(reply => reply.id !== replyId) }
                  : comment
              )
            }
          : review
      )
      setReviews(updatedReviews)

      // reviewsData에 저장
      if (whiskyData) {
        const reviewsData = JSON.parse(localStorage.getItem('reviewsData') || '{}')
        reviewsData[whiskyData.id] = updatedReviews
        localStorage.setItem('reviewsData', JSON.stringify(reviewsData))
      }
    }
  }

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await authHelpers.signOut()
      setIsLoggedIn(false)
      alert('로그아웃되었습니다.')
    } catch (error: any) {
      alert('로그아웃 오류: ' + error.message)
    }
  }

  // 리뷰 좋아요 토글
  const handleReviewLike = (reviewId: string) => {
    if (!isLoggedIn) {
      alert('좋아요 기능을 사용하려면 로그인해주세요.')
      return
    }

    const userNickname = localStorage.getItem('userNickname')
    if (!userNickname) return

    // 사용자별 좋아요 상태 저장
    const reviewLikes = JSON.parse(localStorage.getItem('reviewLikes') || '{}')
    const userLikes = reviewLikes[userNickname] || []

    const hasLiked = userLikes.includes(reviewId)

    if (hasLiked) {
      // 좋아요 취소
      reviewLikes[userNickname] = userLikes.filter((id: string) => id !== reviewId)
      setReviews(prev => prev.map(review =>
        review.id === reviewId
          ? { ...review, likes: Math.max(0, review.likes - 1) }
          : review
      ))
    } else {
      // 좋아요 추가
      reviewLikes[userNickname] = [...userLikes, reviewId]
      setReviews(prev => prev.map(review =>
        review.id === reviewId
          ? { ...review, likes: review.likes + 1 }
          : review
      ))
    }

    localStorage.setItem('reviewLikes', JSON.stringify(reviewLikes))
  }

  // 사용자가 특정 리뷰에 좋아요를 눌렀는지 확인
  const hasUserLikedReview = (reviewId: string) => {
    if (!isLoggedIn) return false
    const userNickname = localStorage.getItem('userNickname')
    if (!userNickname) return false

    const reviewLikes = JSON.parse(localStorage.getItem('reviewLikes') || '{}')
    const userLikes = reviewLikes[userNickname] || []
    return userLikes.includes(reviewId)
  }

  // 리뷰 수정 시작
  const handleEditReview = (review: Review) => {
    setEditingReview(review.id)
    setEditText(review.comment)
    setEditRating(review.rating)
    setShowDropdown(null)
  }

  // 리뷰 수정 저장
  const handleSaveEdit = () => {
    if (!editText.trim() || !whiskyData) return

    const updatedReviews = reviews.map(review =>
      review.id === editingReview
        ? { ...review, comment: editText.trim(), rating: editRating }
        : review
    )

    setReviews(updatedReviews)

    // whiskyData.ts의 reviewsDatabase 업데이트
    const reviewsData = JSON.parse(localStorage.getItem('reviewsData') || '{}')
    reviewsData[whiskyData.id] = updatedReviews
    localStorage.setItem('reviewsData', JSON.stringify(reviewsData))

    // 평균 별점 업데이트
    updateAverageRating(whiskyData.id)
    saveWhiskyDataToStorage()

    setEditingReview(null)
    setEditText('')
    setEditRating(0)
  }

  // 리뷰 삭제
  const handleDeleteReview = (reviewId: string) => {
    if (confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      const updatedReviews = reviews.filter(review => review.id !== reviewId)
      setReviews(updatedReviews)

      // whiskyData.ts의 reviewsDatabase 업데이트
      if (whiskyData) {
        const reviewsData = JSON.parse(localStorage.getItem('reviewsData') || '{}')
        reviewsData[whiskyData.id] = updatedReviews
        localStorage.setItem('reviewsData', JSON.stringify(reviewsData))

        // 평균 별점 업데이트
        updateAverageRating(whiskyData.id)
        saveWhiskyDataToStorage()

        // 위스키 데이터 업데이트
        const totalReviews = updatedReviews.length
        const avgRating = totalReviews > 0
          ? Math.round((updatedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews) * 10) / 10
          : 0

        setWhiskyData(prev => prev ? { ...prev, avgRating, totalReviews } : prev)
      }

      setShowDropdown(null)
    }
  }

  if (loading) {
    return <WhiskyDetailSkeleton />
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
          {/* 로고 이미지 */}
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
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {typeof window !== 'undefined' ? localStorage.getItem('userNickname') : ''}님
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-5 py-2 rounded-full text-sm hover:bg-gray-700 transition-all duration-200 hover:scale-110 transform shadow-md hover:shadow-lg"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigateWithTransition('/login', '로그인 페이지로 이동 중...')}
              className="bg-amber-900 text-white px-5 py-2 rounded-full text-sm hover:bg-amber-800 transition-all duration-200 hover:scale-110 transform shadow-md hover:shadow-lg"
            >
              로그인
            </button>
          )}
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

      {/* 메인 컨텐츠 중앙 정렬 */}
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-16 items-start">
          {/* 왼쪽: 위스키 이미지 */}
          <div className="flex-shrink-0">
            <div className="w-72 h-[500px] bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-center shadow-sm">
              <img
                src={encodeURI(whiskyData.image)}
                alt={whiskyData.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/whiskies/no.pic whisky.png';
                }}
              />
            </div>
          </div>

          {/* 오른쪽: 위스키 정보 */}
          <div className="flex-1 max-w-2xl">
          {/* 위스키 이름 */}
          <h2 className="text-4xl font-bold text-red-500 mb-3 text-center">{whiskyData.name}</h2>

          {/* 안내 문구 */}
          <p className="text-sm text-gray-400 mb-8 text-center">
            술 관련 설명이 실제와 다를 수 있습니다.
          </p>

          {/* 위스키 상세 정보 - 중앙 정렬 및 깔끔한 디자인 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-10">
            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-amber-800">도수</span>
                <span className="text-lg font-bold text-amber-900">{whiskyData.abv}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-amber-800">지역</span>
                <span className="text-lg font-semibold text-amber-900">{whiskyData.region}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-amber-800">가격</span>
                <span className="text-lg font-semibold text-amber-900">{whiskyData.price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-amber-800">캐스크</span>
                <span className="text-lg font-semibold text-amber-900">{whiskyData.cask}</span>
              </div>
            </div>
          </div>

          {/* 평점 섹션 - 갈색 테마로 변경 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">이 위스키의 평균 별점은?</h3>
            <div className="flex items-center justify-center gap-12">
              {/* 별점 차트 - 실제 데이터 반영 */}
              <RatingChart reviews={reviews} />

              {/* 평균 별점 - 갈색 테마 */}
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-amber-500 text-4xl">★</span>
                  <span className="text-4xl font-bold text-gray-800">
                    {whiskyData.avgRating > 0 ? whiskyData.avgRating : '0.0'}
                  </span>
                </div>
                {whiskyData.avgRating === 0 && (
                  <div className="text-sm text-gray-500 mt-2">아직 평가가 없습니다</div>
                )}
              </div>
            </div>
          </div>

          {/* 빠른 별점 매기기 섹션 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-amber-800 mb-4 text-center">
              {!isLoggedIn ? '로그인 후 평가 가능' : hasUserRated ? '내가 매긴 별점' : '이 위스키를 평가해보세요'}
            </h3>
            <div className="flex justify-center">
              {(() => {
                if (!isLoggedIn) {
                  return (
                    <div className="text-gray-500 text-center">
                      <p className="mb-2">평점을 남기려면 로그인해주세요</p>
                      <button
                        onClick={() => window.location.href = '/login'}
                        className="text-amber-600 hover:text-amber-800 font-medium underline"
                      >
                        로그인하러 가기
                      </button>
                    </div>
                  )
                }

                if (hasUserRated) {
                  // Supabase 데이터 우선, 없으면 localStorage 데이터 사용
                  let userRatingValue = 0
                  if (supabaseUserReview) {
                    userRatingValue = supabaseUserReview.rating
                  } else {
                    // 하위 호환성을 위한 localStorage 백업
                    const userNickname = typeof window !== 'undefined' ? localStorage.getItem('userNickname') || '익명 사용자' : '익명 사용자'
                    const userReview = reviews.find(review => review.user === userNickname)
                    userRatingValue = userReview ? userReview.rating : 0
                  }

                  return (
                    <div>
                      <RatingSystem
                        whiskyId={whiskyData.id}
                        currentRating={userRatingValue}
                        onRatingChange={() => {}} // 읽기 전용
                        size="lg"
                        showLabels={true}
                        readOnly={true}
                      />
                      {supabaseUserReview && (
                        <div className="mt-2 text-center text-sm text-green-600">
                          Supabase에서 로드된 데이터
                        </div>
                      )}
                    </div>
                  )
                } else {
                  return (
                    <RatingSystem
                      whiskyId={whiskyData.id}
                      currentRating={0}
                      onRatingChange={handleRatingOnlySubmit}
                      size="lg"
                      showLabels={true}
                    />
                  )
                }
              })()}
            </div>
          </div>

          {/* 노트 작성 버튼 - 중앙 정렬 */}
          <div className="mb-8 text-center">
            {!hasUserReviewed && (
              <button
                onClick={() => {
                  // 기존 Supabase 리뷰가 있다면 데이터 미리 채우기
                  if (supabaseUserReview) {
                    setUserRating(supabaseUserReview.rating)
                    setUserNote(supabaseUserReview.note || '')
                  }
                  setShowNoteForm(true)
                }}
                className="bg-red-500 text-white px-10 py-3 rounded-xl font-bold hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 transform"
              >
                {supabaseUserReview ? '내 노트 수정하기' : '내 노트 작성하기'}
              </button>
            )}
            {supabaseUserReview && supabaseUserReview.note && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-gray-800 mb-2">내 리뷰</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400">★</span>
                  <span className="font-bold">{supabaseUserReview.rating}점</span>
                </div>
                <p className="text-gray-700 text-sm">{supabaseUserReview.note}</p>
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(supabaseUserReview.created_at).toLocaleDateString('ko-KR')}
                </div>
              </div>
            )}
          </div>

          {/* 노트 작성 폼 - 향상된 디자인 */}
          {showNoteForm && (
            <div className="bg-white p-8 rounded-xl border border-gray-200 mb-8 shadow-lg">
              <h4 className="text-xl font-bold mb-6 text-center text-gray-800">노트 작성하기</h4>
              
              {/* 별점 선택 - 갈색 테마 RatingSystem 사용 */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3 text-center text-amber-800">별점</label>
                <div className="flex justify-center">
                  <RatingSystem
                    whiskyId={whiskyData.id}
                    currentRating={userRating}
                    onRatingChange={(rating) => setUserRating(rating)}
                    size="md"
                    showLabels={false}
                  />
                </div>
              </div>

              {/* 노트 텍스트 */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3 text-center text-gray-700">노트</label>
                <textarea
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="노즈: 바닐라, 캬라멜이 느껴짐&#10;팔레트: &#10;피니시: 긴 여운..."
                  className="w-full h-28 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800 placeholder-gray-500"
                />
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleSubmitNote}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium hover:scale-110 transform shadow-md hover:shadow-lg"
                >
                  저장
                </button>
                <button
                  onClick={() => setShowNoteForm(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium hover:scale-110 transform shadow-md hover:shadow-lg"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* 위스키 노트/리뷰 섹션 */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-red-500">위스키 노트/리뷰</h3>
              <button
                onClick={() => navigateWithTransition(`/whisky/${whiskyData.id}/reviews`, '전체 리뷰를 불러오는 중...')}
                className="text-sm text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-110 transform"
              >
                더보기
              </button>
            </div>

            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* 프로필 사진 */}
                        <div className="w-8 h-8 rounded-full border border-gray-300 bg-gray-100 overflow-hidden flex-shrink-0">
                          {review.user === (typeof window !== 'undefined' ? localStorage.getItem('userNickname') : '') && userProfileImage ? (
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
                        <span className="text-sm font-medium text-gray-800">{review.user}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm font-medium text-gray-700">{review.rating}</span>
                      </div>
                    </div>

                    {/* 수정 모드 */}
                    {editingReview === review.id ? (
                      <div className="mb-4">
                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-2">별점</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                onClick={() => setEditRating(star)}
                                className={`text-xl ${editRating >= star ? 'text-amber-500' : 'text-gray-300'}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingReview(null)}
                            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* 별점만 남긴 경우 comment 숨기기 */
                      review.comment.trim() !== `별점 ${review.rating}점을 남겼습니다.` && (
                        <p className="text-sm text-gray-700 mb-4 min-h-16 leading-relaxed">
                          {review.comment}
                        </p>
                      )
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
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
                            className="w-5 h-5"
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
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>
                      </div>

                      {/* 작성자만 보이는 점 세개 메뉴 */}
                      {isLoggedIn && typeof window !== 'undefined' &&
                       localStorage.getItem('userNickname') === review.user && (
                        <div className="relative">
                          <button
                            onClick={() => setShowDropdown(showDropdown === review.id ? null : review.id)}
                            className="text-gray-300 hover:text-gray-500 transition-all duration-200 hover:scale-110 transform"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>

                          {/* 드롭다운 메뉴 */}
                          {showDropdown === review.id && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-24">
                              <button
                                onClick={() => handleEditReview(review)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-lg"
                              >
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 댓글 작성 폼 */}
                    {showCommentForm === review.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="댓글을 작성해주세요..."
                          className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => setShowCommentForm(null)}
                            className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                          >
                            취소
                          </button>
                          <button
                            onClick={() => handleAddComment(review.id)}
                            disabled={loadingComments[review.id]}
                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingComments[review.id] ? '작성 중...' : '댓글 달기'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 댓글 로딩 스켈레톤 */}
                    {loadingComments[review.id] && (
                      <div className="mt-4 space-y-3">
                        <div className="bg-gray-50 p-3 rounded animate-pulse">
                          <div className="flex items-center justify-between mb-2">
                            <div className="h-4 bg-gray-300 rounded w-20"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                          </div>
                          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    )}

                    {/* 댓글 목록 */}
                    {review.comments.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {review.comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 p-3 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {/* 댓글 작성자 프로필 사진 */}
                                <div className="w-6 h-6 rounded-full border border-gray-300 bg-gray-100 overflow-hidden flex-shrink-0">
                                  {comment.user === (typeof window !== 'undefined' ? localStorage.getItem('userNickname') : '') && userProfileImage ? (
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
                                {/* 작성자만 삭제 버튼 표시 */}
                                {isLoggedIn && typeof window !== 'undefined' &&
                                 localStorage.getItem('userNickname') === comment.user && (
                                  <button
                                    onClick={() => handleDeleteComment(review.id, comment.id)}
                                    className="text-xs text-red-500 hover:text-red-700 px-1"
                                  >
                                    삭제
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{comment.content}</p>

                            <button
                              onClick={() => setShowReplyForm(showReplyForm === comment.id ? null : comment.id)}
                              className="text-xs text-blue-500 hover:text-blue-700"
                            >
                              답글 달기
                            </button>

                            {/* 답글 작성 폼 */}
                            {showReplyForm === comment.id && (
                              <div className="mt-2 p-3 bg-white rounded">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="답글을 작성해주세요..."
                                  className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows={2}
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                  <button
                                    onClick={() => setShowReplyForm(null)}
                                    className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                                  >
                                    취소
                                  </button>
                                  <button
                                    onClick={() => handleAddReply(review.id, comment.id)}
                                    disabled={loadingReplies[`${review.id}-${comment.id}`]}
                                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {loadingReplies[`${review.id}-${comment.id}`] ? '작성 중...' : '답글 달기'}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* 답글 로딩 스켈레톤 */}
                            {loadingReplies[`${review.id}-${comment.id}`] && (
                              <div className="mt-3 ml-4 space-y-2">
                                <div className="bg-white p-2 rounded border-l-2 border-blue-200 animate-pulse">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                                    <div className="h-2 bg-gray-200 rounded w-12"></div>
                                  </div>
                                  <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                                </div>
                              </div>
                            )}

                            {/* 답글 목록 */}
                            {comment.replies.length > 0 && (
                              <div className="mt-3 ml-4 space-y-2">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="bg-white p-2 rounded border-l-2 border-blue-200">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-2">
                                        {/* 답글 작성자 프로필 사진 */}
                                        <div className="w-5 h-5 rounded-full border border-gray-300 bg-gray-100 overflow-hidden flex-shrink-0">
                                          {reply.user === (typeof window !== 'undefined' ? localStorage.getItem('userNickname') : '') && userProfileImage ? (
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
                                        <span className="text-sm font-medium text-gray-800">{reply.user}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">
                                          {new Date(reply.createdAt).toLocaleDateString()}
                                        </span>
                                        {/* 작성자만 삭제 버튼 표시 */}
                                        {isLoggedIn && typeof window !== 'undefined' &&
                                         localStorage.getItem('userNickname') === reply.user && (
                                          <button
                                            onClick={() => handleDeleteReply(review.id, comment.id, reply.id)}
                                            className="text-xs text-red-500 hover:text-red-700 px-1"
                                          >
                                            삭제
                                          </button>
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <p className="text-gray-500 text-lg mb-2">아직 작성된 리뷰가 없습니다.</p>
                <p className="text-gray-400 text-sm">첫 번째 리뷰를 작성해보세요!</p>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 별점 차트 컴포넌트
function RatingChart({ reviews }: { reviews: Review[] }) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  // 각 별점별 개수 계산
  const ratingCounts = Array.from({ length: 5 }, (_, i) => {
    const rating = i + 1
    return reviews.filter(review => review.rating === rating).length
  })

  // 최대값 구하기 (차트 높이 정규화용)
  const maxCount = Math.max(...ratingCounts, 1)

  // 높이 계산 (최소 4px, 최대 64px)
  const getBarHeight = (count: number) => {
    if (count === 0) return 4
    return Math.max(4, (count / maxCount) * 64)
  }

  // 색상 결정
  const getBarColor = (count: number, rating: number) => {
    if (count === 0) return 'bg-amber-200'
    if (hoveredRating === rating) return 'bg-amber-600'
    if (count === maxCount && maxCount > 0) return 'bg-amber-500'
    return 'bg-amber-300'
  }

  const totalReviews = reviews.length

  return (
    <div className="flex-1 max-w-xs">
      <div className="flex items-end justify-center gap-1 h-20 relative">
        {ratingCounts.map((count, index) => {
          const rating = index + 1
          return (
            <div
              key={rating}
              className="relative flex flex-col items-center"
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(null)}
            >
              <div
                className={`w-6 rounded-t transition-all duration-200 ${getBarColor(count, rating)} hover:scale-110 cursor-default`}
                style={{ height: `${getBarHeight(count)}px` }}
              />

              {/* 호버 시 툴팁 */}
              {hoveredRating === rating && (
                <div className="absolute -top-8 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                  {rating}점: {count}명
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 별점 라벨 */}
      <div className="flex justify-center gap-1 mt-2">
        {[1, 2, 3, 4, 5].map(rating => (
          <div key={rating} className="w-6 text-xs text-gray-500 text-center">
            {rating}
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 mt-3 text-center">
        {totalReviews}명
      </div>
    </div>
  )
}
