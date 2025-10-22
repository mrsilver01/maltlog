'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'
import LoadingAnimation from '@/components/LoadingAnimation'
import { likeReview, unlikeReview, checkMultipleReviewsLiked, getReviewLikesCount, deleteReview } from '@/lib/reviewActions'
import { getReviewComments, addComment, getReviewCommentsCount, ReviewComment, updateComment, deleteComment } from '@/lib/commentActions'
import toast from 'react-hot-toast'

// RatingSystem 컴포넌트 - 원본 디자인 적용
interface RatingSystemProps {
  currentRating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

const RatingSystem = ({
  currentRating,
  onRatingChange,
  readOnly = false,
  size = 'md',
  showLabels = false
}: RatingSystemProps) => {
  const starSizeClass = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }[size];

  const handleStarClick = (star: number, event: React.MouseEvent) => {
    if (readOnly || !onRatingChange) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;

    // 왼쪽 절반 클릭: 0.5점, 오른쪽 절반 클릭: 1점
    const rating = clickX < width / 2 ? star - 0.5 : star;
    onRatingChange(rating);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const fullStars = Math.floor(currentRating);
        const hasHalfStar = currentRating % 1 >= 0.5;

        let starColor = 'text-gray-300';
        if (star <= fullStars) {
          starColor = 'text-amber-500';
        } else if (star === fullStars + 1 && hasHalfStar) {
          starColor = 'text-amber-500 opacity-50';
        }

        return (
          <button
            key={star}
            type="button"
            onClick={(e) => handleStarClick(star, e)}
            disabled={readOnly}
            className={`
              relative transition-colors duration-200
              ${starSizeClass}
              ${starColor}
              ${!readOnly ? 'hover:text-amber-400 hover:scale-110 transform cursor-pointer' : 'cursor-default'}
            `}
          >
            ★
          </button>
        );
      })}
      {showLabels && (
        <span className="ml-2 text-sm text-gray-600">
          {currentRating > 0 ? `${currentRating}/5` : '평가해주세요'}
        </span>
      )}
    </div>
  );
};

// RatingChart 컴포넌트 - 평점 분포 차트
interface RatingChartProps {
  reviews: Review[];
}

const RatingChart = ({ reviews }: RatingChartProps) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1]++;
    }
  });

  const maxCount = Math.max(...ratingCounts, 1);
  const totalReviews = reviews.length;

  const getBarHeight = (count: number) => {
    return Math.max((count / maxCount) * 60, count > 0 ? 8 : 0);
  };

  const getBarColor = (count: number, rating: number) => {
    if (count === 0) return 'bg-gray-200';
    if (rating >= 4) return 'bg-amber-700';
    if (rating >= 3) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="flex-1 max-w-xs">
      <div className="flex items-end justify-center gap-1 h-20 relative">
        {ratingCounts.map((count, index) => {
          const rating = index + 1;
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
              {hoveredRating === rating && (
                <div className="absolute -top-8 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                  {rating}점: {count}명
                </div>
              )}
            </div>
          );
        })}
      </div>
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
  );
};

interface Whisky {
  id: string;
  name: string;
  image: string;
  distillery: string;
  region: string;
  abv: string;
  cask: string;
  price: string;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  note: string | null;
  created_at: string;
  profiles: {
    nickname: string;
    avatar_url: string | null;
  } | null;
}

interface ReviewLike {
  reviewId: string;
  isLiked: boolean;
  count: number;
}

interface WhiskyDetailClientProps {
  whisky: Whisky;
  initialReviews: Review[];
}

export default function WhiskyDetailClient({ whisky, initialReviews }: WhiskyDetailClientProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const REVIEWS_PER_PAGE = 6

  const [reviews, setReviews] = useState<Review[]>(initialReviews.slice(0, REVIEWS_PER_PAGE))
  const [myReview, setMyReview] = useState<Review | null>(null)
  const [currentRating, setCurrentRating] = useState(0)
  const [currentNote, setCurrentNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [hasUserRated, setHasUserRated] = useState(false)
  const [hasUserReviewed, setHasUserReviewed] = useState(false)
  const [reviewLikes, setReviewLikes] = useState<{[key: string]: ReviewLike}>({})
  const [likesLoading, setLikesLoading] = useState<{[key: string]: boolean}>({})
  const [commentSections, setCommentSections] = useState<{[key: string]: boolean}>({})
  const [reviewComments, setReviewComments] = useState<{[key: string]: ReviewComment[]}>({})
  const [commentCounts, setCommentCounts] = useState<{[key: string]: number}>({})
  const [newComments, setNewComments] = useState<{[key: string]: string}>({})
  const [commentSubmitting, setCommentSubmitting] = useState<{[key: string]: boolean}>({})
  const [editingComments, setEditingComments] = useState<{[key: string]: boolean}>({})
  const [editCommentTexts, setEditCommentTexts] = useState<{[key: string]: string}>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreReviews, setHasMoreReviews] = useState(true)
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false)
  const [expandedNotes, setExpandedNotes] = useState<{[key: string]: boolean}>({})

  // 평균 별점 계산
  const avgRating = reviews.length > 0
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
    : 0;

  // 초기 리뷰 데이터 설정 및 페이지네이션 상태 초기화
  useEffect(() => {
    setReviews(initialReviews.slice(0, REVIEWS_PER_PAGE))
    setHasMoreReviews(initialReviews.length > REVIEWS_PER_PAGE)
    setCurrentPage(1)
  }, [initialReviews])

  // 사용자의 기존 리뷰 찾기 (전체 initialReviews에서 찾기)
  useEffect(() => {
    if (user && initialReviews.length > 0) {
      const userReview = initialReviews.find(review => review.user_id === user.id)
      if (userReview) {
        setMyReview(userReview)
        setCurrentRating(userReview.rating)
        setCurrentNote(userReview.note || '')
        setHasUserRated(true)
        setHasUserReviewed(!!userReview.note && userReview.note.trim() !== '')
      } else {
        setMyReview(null)
        setCurrentRating(0)
        setCurrentNote('')
        setHasUserRated(false)
        setHasUserReviewed(false)
      }
    } else if (!user) {
      setMyReview(null)
      setCurrentRating(0)
      setCurrentNote('')
      setHasUserRated(false)
      setHasUserReviewed(false)
    }
  }, [user, initialReviews])

  // 리뷰 좋아요 상태 로딩
  useEffect(() => {
    const loadReviewLikes = async () => {
      if (reviews.length === 0) return

      const reviewIds = reviews.map(review => review.id)
      const likesPromises = reviewIds.map(async (reviewId) => {
        const count = await getReviewLikesCount(reviewId)
        let isLiked = false
        if (user) {
          const likedReviews = await checkMultipleReviewsLiked([reviewId], user.id)
          isLiked = likedReviews[reviewId] || false
        }
        return { reviewId, count, isLiked }
      })

      const likesData = await Promise.all(likesPromises)
      const likesMap: {[key: string]: ReviewLike} = {}
      likesData.forEach(({ reviewId, count, isLiked }) => {
        likesMap[reviewId] = { reviewId, count, isLiked }
      })
      setReviewLikes(likesMap)
    }

    loadReviewLikes()
  }, [reviews, user])

  // 댓글 개수 로딩
  useEffect(() => {
    const loadCommentCounts = async () => {
      if (reviews.length === 0) return

      const reviewIds = reviews.map(review => review.id)
      const countPromises = reviewIds.map(async (reviewId) => {
        const count = await getReviewCommentsCount(reviewId)
        return { reviewId, count }
      })

      const countData = await Promise.all(countPromises)
      const countMap: {[key: string]: number} = {}
      countData.forEach(({ reviewId, count }) => {
        countMap[reviewId] = count
      })
      setCommentCounts(countMap)
    }

    loadCommentCounts()
  }, [reviews])

  const refreshReviews = async () => {
    const { data: updatedReviews, error } = await supabase
      .from('reviews')
      .select(`*, profiles (nickname, avatar_url)`)
      .eq('whisky_id', whisky.id)
      .order('created_at', { ascending: false })

    if (!error && updatedReviews) {
      setReviews(updatedReviews as Review[])
      // 전체 리뷰 수를 확인하여 hasMoreReviews 업데이트
      setHasMoreReviews(updatedReviews.length > REVIEWS_PER_PAGE)
      setCurrentPage(1)
    }
  }

  // 추가 리뷰 로드 함수
  const loadMoreReviews = async () => {
    if (loadingMoreReviews || !hasMoreReviews) return

    setLoadingMoreReviews(true)

    try {
      const startIndex = currentPage * REVIEWS_PER_PAGE
      const endIndex = startIndex + REVIEWS_PER_PAGE - 1

      const { data: newReviews, error } = await supabase
        .from('reviews')
        .select(`*, profiles (nickname, avatar_url)`)
        .eq('whisky_id', whisky.id)
        .order('created_at', { ascending: false })
        .range(startIndex, endIndex)

      if (!error && newReviews) {
        if (newReviews.length < REVIEWS_PER_PAGE) {
          setHasMoreReviews(false)
        }

        if (newReviews.length > 0) {
          setReviews(prev => [...prev, ...newReviews as Review[]])
          setCurrentPage(prev => prev + 1)
        } else {
          setHasMoreReviews(false)
        }
      }
    } catch (error) {
      console.error('추가 리뷰 로드 중 오류:', error)
    } finally {
      setLoadingMoreReviews(false)
    }
  }

  // 별점만 저장하는 함수
  const handleRatingOnlySubmit = async (rating: number) => {
    if (!user) {
      toast('평점을 남기려면 로그인해주세요.')
      router.push('/login')
      return
    }

    try {
      const reviewData = {
        whisky_id: whisky.id,
        user_id: user.id,
        rating: rating,
        note: null,
      }

      const { error } = await supabase
        .from('reviews')
        .upsert(reviewData, {
          onConflict: 'whisky_id,user_id'
        })

      if (error) {
        console.error('평점 저장 실패:', error)
        toast.error('평점 저장에 실패했습니다.')
      } else {
        setCurrentRating(rating)
        setHasUserRated(true)
        await refreshReviews()
        toast.success('평점이 저장되었습니다!')
      }
    } catch (error) {
      console.error('평점 저장 중 오류:', error)
      toast.error('평점 저장 중 오류가 발생했습니다.')
    }
  }

  // 노트 포함 리뷰 저장
  const handleReviewSubmit = async () => {
    if (!user) {
      toast('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    if (currentRating === 0) {
      toast('별점을 먼저 선택해주세요.')
      return
    }

    if (!currentNote.trim()) {
      toast('노트를 입력해주세요.')
      return
    }

    setSubmitting(true)

    try {
      const reviewData = {
        whisky_id: whisky.id,
        user_id: user.id,
        rating: currentRating,
        note: currentNote.trim(),
      }

      const { error } = await supabase
        .from('reviews')
        .upsert(reviewData, {
          onConflict: 'whisky_id,user_id'
        })

      if (error) {
        console.error('리뷰 저장 실패:', error)
        toast.error('리뷰 저장에 실패했습니다: ' + error.message)
      } else {
        // 사용자의 리뷰 정보 즉시 업데이트
        const newReview = {
          id: Date.now().toString(),
          user_id: user.id,
          rating: currentRating,
          note: currentNote.trim(),
          created_at: new Date().toISOString(),
          profiles: {
            nickname: user.user_metadata?.nickname || '사용자',
            avatar_url: user.user_metadata?.avatar_url || null
          }
        }

        setMyReview(newReview)
        setHasUserRated(true)
        setHasUserReviewed(true)
        setShowNoteForm(false)

        // 리뷰 목록 새로고침
        await refreshReviews()

        toast.success('리뷰가 저장되었습니다!')
      }
    } catch (error) {
      console.error('리뷰 저장 중 오류:', error)
      toast.error('리뷰 저장 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // 리뷰 좋아요/취소 핸들러
  const handleReviewLike = async (reviewId: string) => {
    if (!user) {
      toast('좋아요를 누르려면 로그인해주세요.')
      router.push('/login')
      return
    }

    if (likesLoading[reviewId]) return

    setLikesLoading(prev => ({ ...prev, [reviewId]: true }))

    const currentLike = reviewLikes[reviewId]
    const isCurrentlyLiked = currentLike?.isLiked || false
    const currentCount = currentLike?.count || 0

    // 옵티미스틱 업데이트
    setReviewLikes(prev => ({
      ...prev,
      [reviewId]: {
        reviewId,
        isLiked: !isCurrentlyLiked,
        count: isCurrentlyLiked ? currentCount - 1 : currentCount + 1
      }
    }))

    try {
      let success = false
      if (isCurrentlyLiked) {
        success = await unlikeReview(reviewId, user.id)
      } else {
        success = await likeReview(reviewId, user.id)
      }

      if (!success) {
        // 실패시 롤백
        setReviewLikes(prev => ({
          ...prev,
          [reviewId]: {
            reviewId,
            isLiked: isCurrentlyLiked,
            count: currentCount
          }
        }))
        toast.error('좋아요 처리에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error)
      // 실패시 롤백
      setReviewLikes(prev => ({
        ...prev,
        [reviewId]: {
          reviewId,
          isLiked: isCurrentlyLiked,
          count: currentCount
        }
      }))
      toast.error('좋아요 처리 중 오류가 발생했습니다.')
    } finally {
      setLikesLoading(prev => ({ ...prev, [reviewId]: false }))
    }
  }

  // 댓글 섹션 토글
  const toggleCommentSection = async (reviewId: string) => {
    const isCurrentlyOpen = commentSections[reviewId]

    setCommentSections(prev => ({
      ...prev,
      [reviewId]: !isCurrentlyOpen
    }))

    // 댓글 섹션을 처음 열 때 댓글 로드
    if (!isCurrentlyOpen && !reviewComments[reviewId]) {
      const comments = await getReviewComments(reviewId)
      setReviewComments(prev => ({
        ...prev,
        [reviewId]: comments
      }))
    }
  }

  // 새 댓글 제출
  const handleCommentSubmit = async (reviewId: string) => {
    if (!user) {
      toast('댓글을 작성하려면 로그인해주세요.')
      router.push('/login')
      return
    }

    const content = newComments[reviewId]?.trim()
    if (!content) {
      toast('댓글 내용을 입력해주세요.')
      return
    }

    setCommentSubmitting(prev => ({ ...prev, [reviewId]: true }))

    try {
      const success = await addComment(reviewId, user.id, content)

      if (success) {
        // 댓글 목록 새로고침
        const updatedComments = await getReviewComments(reviewId)
        setReviewComments(prev => ({
          ...prev,
          [reviewId]: updatedComments
        }))

        // 댓글 개수 업데이트
        setCommentCounts(prev => ({
          ...prev,
          [reviewId]: (prev[reviewId] || 0) + 1
        }))

        // 입력 필드 초기화
        setNewComments(prev => ({
          ...prev,
          [reviewId]: ''
        }))

        toast.success('댓글이 등록되었습니다!')
      } else {
        toast.error('댓글 등록에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('댓글 등록 중 오류:', error)
      toast.error('댓글 등록 중 오류가 발생했습니다.')
    } finally {
      setCommentSubmitting(prev => ({ ...prev, [reviewId]: false }))
    }
  }

  // 리뷰 삭제
  const handleReviewDelete = async () => {
    if (!user || !myReview) return

    const confirmed = window.confirm('정말로 리뷰를 삭제하시겠습니까?')
    if (!confirmed) return

    try {
      const success = await deleteReview(myReview.id, user.id)

      if (success) {
        // UI에서 즉시 리뷰 제거
        setMyReview(null)
        setCurrentRating(0)
        setCurrentNote('')
        setHasUserRated(false)
        setHasUserReviewed(false)

        // 리뷰 목록 새로고침
        await refreshReviews()

        toast.success('리뷰가 삭제되었습니다.')
      } else {
        toast.error('리뷰 삭제에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('리뷰 삭제 중 오류:', error)
      toast.error('리뷰 삭제 중 오류가 발생했습니다.')
    }
  }

  // 리뷰 수정 버튼 클릭
  const handleReviewEdit = () => {
    if (myReview) {
      setCurrentRating(myReview.rating)
      setCurrentNote(myReview.note || '')
      setShowNoteForm(true)
    }
  }

  // 댓글 수정 시작
  const startEditComment = (commentId: string, currentContent: string) => {
    setEditingComments(prev => ({ ...prev, [commentId]: true }))
    setEditCommentTexts(prev => ({ ...prev, [commentId]: currentContent }))
  }

  // 댓글 수정 취소
  const cancelEditComment = (commentId: string) => {
    setEditingComments(prev => ({ ...prev, [commentId]: false }))
    setEditCommentTexts(prev => ({ ...prev, [commentId]: '' }))
  }

  // 댓글 수정 저장
  const saveEditComment = async (commentId: string, reviewId: string) => {
    if (!user) return

    const newContent = editCommentTexts[commentId]?.trim()
    if (!newContent) {
      toast('댓글 내용을 입력해주세요.')
      return
    }

    try {
      const success = await updateComment(commentId, user.id, newContent)

      if (success) {
        // 댓글 목록 새로고침
        const updatedComments = await getReviewComments(reviewId)
        setReviewComments(prev => ({
          ...prev,
          [reviewId]: updatedComments
        }))

        // 수정 모드 종료
        setEditingComments(prev => ({ ...prev, [commentId]: false }))
        setEditCommentTexts(prev => ({ ...prev, [commentId]: '' }))

        toast.success('댓글이 수정되었습니다.')
      } else {
        toast.error('댓글 수정에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('댓글 수정 중 오류:', error)
      toast.error('댓글 수정 중 오류가 발생했습니다.')
    }
  }

  // 댓글 삭제
  const handleCommentDelete = async (commentId: string, reviewId: string) => {
    if (!user) return

    const confirmed = window.confirm('정말로 댓글을 삭제하시겠습니까?')
    if (!confirmed) return

    try {
      const success = await deleteComment(commentId, user.id)

      if (success) {
        // 댓글 목록 새로고침
        const updatedComments = await getReviewComments(reviewId)
        setReviewComments(prev => ({
          ...prev,
          [reviewId]: updatedComments
        }))

        // 댓글 개수 업데이트
        setCommentCounts(prev => ({
          ...prev,
          [reviewId]: Math.max((prev[reviewId] || 0) - 1, 0)
        }))

        toast.success('댓글이 삭제되었습니다.')
      } else {
        toast.error('댓글 삭제에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('댓글 삭제 중 오류:', error)
      toast.error('댓글 삭제 중 오류가 발생했습니다.')
    }
  }

  if (authLoading) {
    return <LoadingAnimation message="위스키 노트를 준비 중입니다..." />
  }

  return (
    <div className="min-h-screen bg-rose-50 p-6">
      {/* 헤더 - maltlog notes 스타일 */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-16 flex items-center justify-center">
            <img
              src="/LOGO.png"
              alt="Maltlog Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-amber-800 font-[family-name:var(--font-jolly-lodger)]">Maltlog</h1>
          <span className="text-4xl font-bold text-red-500 ml-2 font-[family-name:var(--font-jolly-lodger)]">Notes</span>
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
              <span className="text-sm text-gray-600">
                {user.user_metadata?.nickname || '사용자'}님
              </span>
              <button
                onClick={() => router.push('/profile')}
                className="bg-gray-600 text-white px-5 py-2 rounded-full text-sm hover:bg-gray-700 transition-all duration-200 hover:scale-110 transform shadow-md hover:shadow-lg"
              >
                프로필
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
                src={whisky.image}
                alt={whisky.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/whiskies/no.pic whisky.png'
                }}
              />
            </div>
          </div>

          {/* 오른쪽: 위스키 정보 */}
          <div className="flex-1 max-w-2xl">
            {/* 위스키 이름 */}
            <h2 className="text-4xl font-bold text-red-500 mb-3 text-center">{whisky.name}</h2>

            {/* 안내 문구 */}
            <p className="text-sm text-gray-400 mb-8 text-center">
              술 관련 설명이 실제와 다를 수 있습니다.
            </p>

            {/* 위스키 상세 정보 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-10">
              <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-amber-800">도수</span>
                  <span className="text-lg font-bold text-amber-900">{whisky.abv}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-amber-800">지역</span>
                  <span className="text-lg font-semibold text-amber-900">{whisky.region}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-amber-800">가격</span>
                  <span className="text-lg font-semibold text-amber-900">{whisky.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-amber-800">캐스크</span>
                  <span className="text-lg font-semibold text-amber-900">{whisky.cask}</span>
                </div>
              </div>
            </div>

            {/* 평점 섹션 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">이 위스키의 평균 별점은?</h3>
              <div className="flex items-center justify-center gap-12">
                {/* 별점 차트 */}
                <RatingChart reviews={reviews} />

                {/* 평균 별점 */}
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <span className="text-amber-500 text-4xl">★</span>
                    <span className="text-4xl font-bold text-gray-800">
                      {avgRating > 0 ? avgRating : '0.0'}
                    </span>
                  </div>
                  {avgRating === 0 && (
                    <div className="text-sm text-gray-500 mt-2">아직 평가가 없습니다</div>
                  )}
                </div>
              </div>
            </div>

            {/* 빠른 별점 매기기 섹션 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-lg font-bold text-amber-800 mb-4 text-center">
                {!user ? '로그인 후 평가 가능' : hasUserRated ? '내가 매긴 별점' : '이 위스키를 평가해보세요'}
              </h3>
              <div className="flex justify-center">
                {!user ? (
                  <div className="text-gray-500 text-center">
                    <p className="mb-2">평점을 남기려면 로그인해주세요</p>
                    <button
                      onClick={() => router.push('/login')}
                      className="text-amber-600 hover:text-amber-800 font-medium underline"
                    >
                      로그인하러 가기
                    </button>
                  </div>
                ) : hasUserRated ? (
                  <div>
                    <RatingSystem
                      currentRating={currentRating}
                      onRatingChange={() => {}}
                      size="lg"
                      showLabels={true}
                      readOnly={true}
                    />
                    {myReview && (
                      <div className="mt-2 text-center text-sm text-amber-700">
                        별점을 남겼습니다.
                      </div>
                    )}
                  </div>
                ) : (
                  <RatingSystem
                    currentRating={currentRating}
                    onRatingChange={handleRatingOnlySubmit}
                    size="lg"
                    showLabels={true}
                  />
                )}
              </div>
            </div>

            {/* 노트 작성 버튼 */}
            <div className="mb-8 text-center">
              {!hasUserReviewed && user && (
                <button
                  onClick={() => {
                    if (myReview) {
                      setCurrentRating(myReview.rating)
                      setCurrentNote(myReview.note || '')
                    }
                    setShowNoteForm(true)
                  }}
                  className="bg-red-500 text-white px-10 py-3 rounded-xl font-bold hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 transform"
                >
                  {myReview ? '내 노트 수정하기' : '내 노트 작성하기'}
                </button>
              )}
              {myReview && myReview.note && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">내 리뷰</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleReviewEdit}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                      >
                        수정하기
                      </button>
                      <button
                        onClick={handleReviewDelete}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                      >
                        삭제하기
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-400">★</span>
                    <span className="font-bold">{myReview.rating}점</span>
                  </div>
                  <p className="text-gray-700 text-sm">{myReview.note}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(myReview.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              )}
            </div>

            {/* 노트 작성 폼 */}
            {showNoteForm && (
              <div className="bg-white p-8 rounded-xl border border-gray-200 mb-8 shadow-lg">
                <h4 className="text-xl font-bold mb-6 text-center text-gray-800">노트 작성하기</h4>

                {/* 별점 선택 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3 text-center text-amber-800">별점</label>
                  <div className="flex justify-center">
                    <RatingSystem
                      currentRating={currentRating}
                      onRatingChange={(rating) => setCurrentRating(rating)}
                      size="md"
                      showLabels={false}
                    />
                  </div>
                </div>

                {/* 노트 텍스트 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3 text-center text-gray-700">노트</label>
                  <textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="노즈:
팔레트:
피니쉬:"
                    className="w-full h-28 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800 placeholder-gray-500"
                    disabled={submitting}
                  />
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleReviewSubmit}
                    disabled={submitting}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium hover:scale-110 transform shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {submitting ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={() => setShowNoteForm(false)}
                    disabled={submitting}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium hover:scale-110 transform shadow-md hover:shadow-lg disabled:opacity-50"
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
              </div>

              {/* 새 리뷰 작성 영역 */}
              {user && (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full border border-gray-300 bg-gray-100 overflow-hidden flex-shrink-0">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="내 프로필"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          👤
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-800">새 리뷰 작성</span>
                  </div>
                  <textarea
                    placeholder="노즈:
팔레트:
피니쉬: "
                    className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400"
                    rows={4}
                  />
                  <div className="flex justify-end mt-3">
                    <button className="bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition-colors text-sm">
                      리뷰 등록
                    </button>
                  </div>
                </div>
              )}

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-4">
                    {reviews.map((review) => (
                    <div key={review.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full border border-gray-300 bg-gray-100 overflow-hidden flex-shrink-0">
                            {review.profiles?.avatar_url ? (
                              <img
                                src={review.profiles.avatar_url}
                                alt="프로필"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                👤
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{review.profiles?.nickname || '익명'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm font-medium text-gray-700">{review.rating}</span>
                        </div>
                      </div>

                      {review.note && review.note.trim() !== '' && (
                        <div className="mb-4">
                          <p className={`text-sm text-gray-700 leading-relaxed ${
                            expandedNotes[review.id] ? '' : 'line-clamp-1'
                          }`}>
                            {review.note}
                          </p>
                          {review.note.length > 50 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedNotes(prev => ({
                                  ...prev,
                                  [review.id]: !prev[review.id]
                                }))
                              }}
                              className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                            >
                              {expandedNotes[review.id] ? '접기' : '더보기'}
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('ko-KR')}
                        </div>
                        <div className="flex items-center gap-3">
                          {/* 댓글 버튼 */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleCommentSection(review.id)
                            }}
                            className="flex items-center gap-1 text-sm hover:bg-gray-50 px-2 py-1 rounded-md transition-colors group"
                          >
                            <span className="text-gray-300 group-hover:text-gray-400 opacity-50">
                              💬
                            </span>
                            <span className="text-gray-600">
                              {commentCounts[review.id] || 0}
                            </span>
                          </button>

                          {/* 좋아요 버튼 */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReviewLike(review.id)
                            }}
                            disabled={likesLoading[review.id]}
                            className="flex items-center gap-1 text-sm hover:bg-gray-50 px-2 py-1 rounded-md transition-colors group disabled:opacity-50"
                          >
                            <span className={`transition-colors ${
                              reviewLikes[review.id]?.isLiked
                                ? 'text-red-500'
                                : 'text-gray-400 group-hover:text-red-400'
                            }`}>
                              {reviewLikes[review.id]?.isLiked ? '❤️' : '🤍'}
                            </span>
                            <span className="text-gray-600">
                              {reviewLikes[review.id]?.count || 0}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* 댓글 섹션 */}
                      {commentSections[review.id] && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          {/* 기존 댓글 목록 */}
                          <div className="space-y-3 mb-4">
                            {reviewComments[review.id]?.length > 0 ? (
                              reviewComments[review.id].map((comment) => (
                                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full border border-gray-300 bg-gray-100 overflow-hidden flex-shrink-0">
                                        {comment.profiles?.avatar_url ? (
                                          <img
                                            src={comment.profiles.avatar_url}
                                            alt="프로필"
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                            👤
                                          </div>
                                        )}
                                      </div>
                                      <span className="text-sm font-medium text-gray-700">
                                        {comment.profiles?.nickname || '익명'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                                      </span>
                                    </div>

                                    {/* 댓글 수정/삭제 버튼 (본인이 작성한 댓글에만 표시) */}
                                    {user && user.id === comment.user_id && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => startEditComment(comment.id, comment.content)}
                                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                                        >
                                          수정
                                        </button>
                                        <button
                                          onClick={() => handleCommentDelete(comment.id, review.id)}
                                          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                                        >
                                          삭제
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* 댓글 내용 - 수정 모드인지 일반 모드인지에 따라 다르게 렌더링 */}
                                  {editingComments[comment.id] ? (
                                    <div className="space-y-2">
                                      <textarea
                                        value={editCommentTexts[comment.id] || ''}
                                        onChange={(e) => setEditCommentTexts(prev => ({
                                          ...prev,
                                          [comment.id]: e.target.value
                                        }))}
                                        className="w-full p-2 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={2}
                                      />
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => saveEditComment(comment.id, review.id)}
                                          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                                        >
                                          저장
                                        </button>
                                        <button
                                          onClick={() => cancelEditComment(comment.id)}
                                          className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors"
                                        >
                                          취소
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {comment.content}
                                    </p>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-4">
                                아직 댓글이 없습니다.
                              </p>
                            )}
                          </div>

                          {/* 새 댓글 작성 폼 */}
                          {user ? (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full border border-gray-300 bg-gray-100 overflow-hidden flex-shrink-0">
                                  {user.user_metadata?.avatar_url ? (
                                    <img
                                      src={user.user_metadata.avatar_url}
                                      alt="내 프로필"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                      👤
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <textarea
                                    value={newComments[review.id] || ''}
                                    onChange={(e) => setNewComments(prev => ({
                                      ...prev,
                                      [review.id]: e.target.value
                                    }))}
                                    placeholder="댓글을 작성하세요..."
                                    className="w-full p-2 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={2}
                                    disabled={commentSubmitting[review.id]}
                                  />
                                  <div className="flex justify-end mt-2">
                                    <button
                                      onClick={() => handleCommentSubmit(review.id)}
                                      disabled={commentSubmitting[review.id] || !newComments[review.id]?.trim()}
                                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                        commentSubmitting[review.id] || !newComments[review.id]?.trim()
                                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                          : 'bg-blue-500 text-white hover:bg-blue-600'
                                      }`}
                                    >
                                      {commentSubmitting[review.id] ? '등록 중...' : '등록'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-gray-500 mb-2">
                                댓글을 작성하려면 로그인해주세요
                              </p>
                              <button
                                onClick={() => router.push('/login')}
                                className="text-blue-600 hover:text-blue-800 font-medium underline text-sm"
                              >
                                로그인하러 가기
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    ))}
                  </div>

                  {/* 더보기 버튼 */}
                  {hasMoreReviews && (
                    <div className="text-center mt-8">
                      <button
                        onClick={loadMoreReviews}
                        disabled={loadingMoreReviews}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingMoreReviews ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            로딩 중...
                          </div>
                        ) : (
                          '더 많은 리뷰 보기'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">아직 작성된 리뷰가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}