'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { likePost, unlikePost, checkIfPostLiked, getPostLikesCount } from '@/lib/postActions'
import toast from 'react-hot-toast'

interface Post {
  id: string
  user_id: string
  title: string
  content: string
  image_url?: string
  likes_count: number
  comments_count: number
  created_at: string
  profiles?: {
    nickname: string
    avatar_url?: string
  }
  author: string
  authorImage?: string | null
}

interface Comment {
  id: string
  user_id: string
  post_id: string
  content: string
  created_at: string
  profiles?: {
    nickname: string
    avatar_url?: string
  }
  author: string
  authorImage?: string | null
}

interface PostDetailClientProps {
  post: Post
  initialComments: Comment[]
}

export default function PostDetailClient({ post, initialComments }: PostDetailClientProps) {
  const router = useRouter()
  const { user } = useAuth()

  // 댓글 관련 상태
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentContent, setEditCommentContent] = useState('')

  // 대댓글 관련 상태
  const [replies, setReplies] = useState<{[key: string]: Comment[]}>({})
  const [showReplies, setShowReplies] = useState<{[key: string]: boolean}>({})
  const [replyForms, setReplyForms] = useState<{[key: string]: boolean}>({})
  const [replyContents, setReplyContents] = useState<{[key: string]: string}>({})
  const [replySubmitting, setReplySubmitting] = useState<{[key: string]: boolean}>({})

  // 좋아요 관련 상태
  const [isLiked, setIsLiked] = useState<boolean>(false)
  const [likesCount, setLikesCount] = useState<number>(post.likes_count)
  const [likesLoading, setLikesLoading] = useState<boolean>(true)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    return date.toLocaleDateString('ko-KR')
  }

  // 좋아요 상태 초기화
  useEffect(() => {
    const initializeLikes = async () => {
      if (!user) {
        setLikesLoading(false)
        return
      }

      try {
        const [likeStatus, likeCount] = await Promise.all([
          checkIfPostLiked(post.id, user.id),
          getPostLikesCount(post.id)
        ])

        setIsLiked(likeStatus)
        setLikesCount(likeCount)
      } catch (error) {
        console.error('좋아요 상태 초기화 실패:', error)
      } finally {
        setLikesLoading(false)
      }
    }

    initializeLikes()
  }, [user, post.id])

  // 좋아요 처리 함수 (옵티미스틱 업데이트)
  const handlePostLike = useCallback(async () => {
    if (!user) {
      toast('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    const newIsLiked = !isLiked
    const newCount = newIsLiked ? likesCount + 1 : likesCount - 1

    // 옵티미스틱 업데이트 (즉시 UI 변경)
    setIsLiked(newIsLiked)
    setLikesCount(Math.max(0, newCount)) // 음수 방지

    try {
      // 서버 상태 업데이트
      const success = newIsLiked
        ? await likePost(post.id, user.id)
        : await unlikePost(post.id, user.id)

      if (!success) {
        // 실패 시 롤백
        setIsLiked(isLiked)
        setLikesCount(likesCount)
        toast.error('좋아요 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('좋아요 처리 오류:', error)
      // 에러 시 롤백
      setIsLiked(isLiked)
      setLikesCount(likesCount)
      toast.error('좋아요 처리 중 오류가 발생했습니다.')
    }
  }, [user, isLiked, likesCount, post.id, router])

  // 댓글 새로고침 (대댓글 포함)
  const refreshComments = async () => {
    // 최상위 댓글들만 가져오기 (parent_comment_id가 null인 것들)
    const { data: commentsData, error } = await supabase
      .from('comments')
      .select(`
        id,
        user_id,
        content,
        created_at,
        post_id,
        parent_comment_id,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .eq('post_id', post.id)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: true })

    if (!error && commentsData) {
      const transformedComments = commentsData.map((comment: any) => ({
        id: comment.id,
        user_id: comment.user_id,
        post_id: comment.post_id,
        content: comment.content,
        created_at: comment.created_at,
        profiles: comment.profiles,
        author: comment.profiles?.nickname || '익명 사용자',
        authorImage: comment.profiles?.avatar_url || null
      }))
      setComments(transformedComments)

      // 각 댓글의 대댓글 수 가져오기
      const newReplies: {[key: string]: Comment[]} = {}
      for (const comment of transformedComments) {
        const repliesData = await loadReplies(comment.id)
        if (repliesData.length > 0) {
          newReplies[comment.id] = repliesData
        }
      }
      setReplies(newReplies)
    }
  }

  // 대댓글 로드
  const loadReplies = async (parentCommentId: string): Promise<Comment[]> => {
    const { data: repliesData, error } = await supabase
      .from('comments')
      .select(`
        id,
        user_id,
        content,
        created_at,
        post_id,
        parent_comment_id,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .eq('parent_comment_id', parentCommentId)
      .order('created_at', { ascending: true })

    if (!error && repliesData) {
      return repliesData.map((reply: any) => ({
        id: reply.id,
        user_id: reply.user_id,
        post_id: reply.post_id,
        content: reply.content,
        created_at: reply.created_at,
        profiles: reply.profiles,
        author: reply.profiles?.nickname || '익명 사용자',
        authorImage: reply.profiles?.avatar_url || null
      }))
    }
    return []
  }

  // 댓글 작성
  const handleAddComment = async () => {
    if (!user) {
      toast('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    if (!newComment.trim()) {
      toast('댓글 내용을 입력해주세요.')
      return
    }

    setIsSubmittingComment(true)

    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          post_id: post.id,
          user_id: user.id,
          content: newComment.trim()
        }])

      if (error) {
        console.error('댓글 작성 실패:', error)
        toast.error('댓글 작성에 실패했습니다.')
      } else {
        setNewComment('')
        await refreshComments()
        toast.success('댓글이 작성되었습니다.')
      }
    } catch (error) {
      console.error('댓글 작성 중 오류:', error)
      toast.error('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // 댓글 수정
  const handleEditComment = async (commentId: string) => {
    if (!editCommentContent.trim()) {
      toast('댓글 내용을 입력해주세요.')
      return
    }

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editCommentContent.trim() })
        .eq('id', commentId)
        .eq('user_id', user?.id)

      if (error) {
        console.error('댓글 수정 실패:', error)
        toast.error('댓글 수정에 실패했습니다.')
      } else {
        setEditingCommentId(null)
        setEditCommentContent('')
        await refreshComments()
        toast.success('댓글이 수정되었습니다.')
      }
    } catch (error) {
      console.error('댓글 수정 중 오류:', error)
      toast.error('댓글 수정 중 오류가 발생했습니다.')
    }
  }

  // 댓글 삭제
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user?.id)

      if (error) {
        console.error('댓글 삭제 실패:', error)
        toast.error('댓글 삭제에 실패했습니다.')
      } else {
        await refreshComments()
        toast.success('댓글이 삭제되었습니다.')
      }
    } catch (error) {
      console.error('댓글 삭제 중 오류:', error)
      toast.error('댓글 삭제 중 오류가 발생했습니다.')
    }
  }

  // 대댓글 토글
  const toggleReplies = async (commentId: string) => {
    const isCurrentlyShown = showReplies[commentId]

    setShowReplies(prev => ({
      ...prev,
      [commentId]: !isCurrentlyShown
    }))

    // 대댓글을 처음 보여줄 때만 로드
    if (!isCurrentlyShown && !replies[commentId]) {
      const repliesData = await loadReplies(commentId)
      setReplies(prev => ({
        ...prev,
        [commentId]: repliesData
      }))
    }
  }

  // 대댓글 폼 토글
  const toggleReplyForm = (commentId: string) => {
    setReplyForms(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }))

    // 폼을 닫을 때 내용 초기화
    if (replyForms[commentId]) {
      setReplyContents(prev => ({
        ...prev,
        [commentId]: ''
      }))
    }
  }

  // 대댓글 작성
  const handleSubmitReply = async (parentCommentId: string) => {
    if (!user) {
      toast('대댓글을 작성하려면 로그인해주세요.')
      router.push('/login')
      return
    }

    const content = replyContents[parentCommentId]?.trim()
    if (!content) {
      toast('대댓글 내용을 입력해주세요.')
      return
    }

    setReplySubmitting(prev => ({ ...prev, [parentCommentId]: true }))

    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          post_id: post.id,
          user_id: user.id,
          content: content,
          parent_comment_id: parentCommentId
        }])

      if (error) {
        console.error('대댓글 작성 실패:', error)
        toast.error('대댓글 작성에 실패했습니다.')
      } else {
        // 대댓글 목록 새로고침
        const updatedReplies = await loadReplies(parentCommentId)
        setReplies(prev => ({
          ...prev,
          [parentCommentId]: updatedReplies
        }))

        // 대댓글 보기 상태 활성화
        setShowReplies(prev => ({
          ...prev,
          [parentCommentId]: true
        }))

        // 폼 초기화
        setReplyContents(prev => ({
          ...prev,
          [parentCommentId]: ''
        }))
        setReplyForms(prev => ({
          ...prev,
          [parentCommentId]: false
        }))

        toast.success('대댓글이 작성되었습니다.')
      }
    } catch (error) {
      console.error('대댓글 작성 중 오류:', error)
      toast.error('대댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setReplySubmitting(prev => ({ ...prev, [parentCommentId]: false }))
    }
  }

  // 대댓글 삭제
  const handleDeleteReply = async (replyId: string, parentCommentId: string) => {
    if (!confirm('정말로 이 대댓글을 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', replyId)
        .eq('user_id', user?.id)

      if (error) {
        console.error('대댓글 삭제 실패:', error)
        toast.error('대댓글 삭제에 실패했습니다.')
      } else {
        // 해당 댓글의 대댓글 목록 새로고침
        const updatedReplies = await loadReplies(parentCommentId)
        setReplies(prev => ({
          ...prev,
          [parentCommentId]: updatedReplies
        }))

        toast.success('대댓글이 삭제되었습니다.')
      }
    } catch (error) {
      console.error('대댓글 삭제 중 오류:', error)
      toast.error('대댓글 삭제 중 오류가 발생했습니다.')
    }
  }

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)
        .eq('user_id', user?.id)

      if (error) {
        console.error('게시글 삭제 실패:', error)
        toast.error('게시글 삭제에 실패했습니다.')
      } else {
        toast.success('게시글이 삭제되었습니다.')
        router.push('/community')
      }
    } catch (error) {
      console.error('게시글 삭제 중 오류:', error)
      toast.error('게시글 삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-rose-50 p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-16 flex items-center justify-center">
              <img
                src="/LOGO.png"
                alt="Maltlog Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-amber-800 font-[family-name:var(--font-jolly-lodger)]">Maltlog</h1>
            <span className="text-4xl font-bold text-blue-500 ml-2 font-[family-name:var(--font-jolly-lodger)]">Community</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/community')}
            className="text-xl font-bold text-gray-600 hover:text-blue-500 transition-all duration-200 hover:scale-110 transform font-[family-name:var(--font-jolly-lodger)]"
          >
            뒤로가기
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-xl font-bold text-gray-600 hover:text-red-500 transition-all duration-200 hover:scale-110 transform font-[family-name:var(--font-jolly-lodger)]"
          >
            HOME
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {/* 게시글 상세 */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
          {/* 게시글 헤더 */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{post.title}</h1>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-3">
                {post.authorImage ? (
                  <img
                    src={post.authorImage}
                    alt={post.author}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                    {post.author.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-medium text-lg text-gray-700">{post.author}</span>
                  <span className="text-xs">{formatDate(post.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePostLike}
                  className="flex items-center gap-1.5 group"
                  disabled={likesLoading}
                >
                  {/* 채워진 하트 (좋아요 누른 상태) */}
                  {isLiked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
                      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                    </svg>
                  ) : (
                    /* 텅 빈 하트 (기본 상태) */
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:text-red-500 transition-colors text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                  )}
                  <span className="text-sm font-medium text-gray-600">{likesCount}</span>
                </button>
                <span className="flex items-center gap-1">
                  <span className="text-gray-400">💬</span>
                  <span className="text-gray-600">{post.comments_count}</span>
                </span>
                {user && post.user_id === user.id && (
                  <button
                    onClick={handleDeletePost}
                    className="text-sm text-red-500 hover:text-red-600 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 게시글 이미지 */}
          {post.image_url && (
            <div className="mb-6">
              <img
                src={post.image_url}
                alt="게시글 이미지"
                className="w-full max-h-96 object-contain rounded-lg"
              />
            </div>
          )}

          {/* 게시글 내용 */}
          <div className="prose max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            댓글 ({comments.length})
          </h3>

          {/* 댓글 작성 */}
          {user && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-500">{newComment.length}/500</div>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? '작성 중...' : '댓글 작성'}
                </button>
              </div>
            </div>
          )}

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                아직 댓글이 없습니다.
                {!user && (
                  <div className="mt-2">
                    <button
                      onClick={() => router.push('/login')}
                      className="text-blue-500 hover:text-blue-600 underline"
                    >
                      로그인하고 첫 댓글을 작성해보세요!
                    </button>
                  </div>
                )}
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start gap-3 mb-2">
                    {comment.authorImage ? (
                      <img
                        src={comment.authorImage}
                        alt={comment.author}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {comment.author.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800">{comment.author}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                          {user && comment.user_id === user.id && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id)
                                  setEditCommentContent(comment.content)
                                }}
                                className="text-xs text-blue-500 hover:text-blue-600"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-xs text-red-500 hover:text-red-600"
                              >
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editCommentContent}
                            onChange={(e) => setEditCommentContent(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditComment(comment.id)}
                              className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => {
                                setEditingCommentId(null)
                                setEditCommentContent('')
                              }}
                              className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      )}

                      {/* 대댓글 버튼들 */}
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <button
                          onClick={() => toggleReplyForm(comment.id)}
                          className="text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          대댓글 달기
                        </button>
                        {replies[comment.id] && replies[comment.id].length > 0 && (
                          <button
                            onClick={() => toggleReplies(comment.id)}
                            className="text-gray-500 hover:text-gray-600 transition-colors"
                          >
                            {showReplies[comment.id] ? '대댓글 숨기기' : `대댓글 ${replies[comment.id].length}개 보기`}
                          </button>
                        )}
                      </div>

                      {/* 대댓글 작성 폼 */}
                      {replyForms[comment.id] && (
                        <div className="mt-3 ml-6 p-3 bg-gray-50 rounded-lg">
                          <textarea
                            value={replyContents[comment.id] || ''}
                            onChange={(e) => setReplyContents(prev => ({
                              ...prev,
                              [comment.id]: e.target.value
                            }))}
                            placeholder="대댓글을 입력하세요..."
                            className="w-full p-2 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            maxLength={300}
                            disabled={replySubmitting[comment.id]}
                          />
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-xs text-gray-500">
                              {(replyContents[comment.id] || '').length}/300
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleReplyForm(comment.id)}
                                className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors"
                              >
                                취소
                              </button>
                              <button
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={replySubmitting[comment.id] || !replyContents[comment.id]?.trim()}
                                className={`text-xs px-2 py-1 rounded transition-colors ${
                                  replySubmitting[comment.id] || !replyContents[comment.id]?.trim()
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                              >
                                {replySubmitting[comment.id] ? '작성 중...' : '대댓글 작성'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 대댓글 목록 */}
                      {showReplies[comment.id] && replies[comment.id] && (
                        <div className="mt-3 ml-6 space-y-3">
                          {replies[comment.id].map((reply) => (
                            <div key={reply.id} className="bg-gray-50 p-3 rounded-lg border-l-2 border-blue-200">
                              <div className="flex items-start gap-2">
                                {reply.authorImage ? (
                                  <img
                                    src={reply.authorImage}
                                    alt={reply.author}
                                    className="w-6 h-6 rounded-full object-cover border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                    {reply.author.charAt(0)}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">
                                      {reply.author}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500">
                                        {formatDate(reply.created_at)}
                                      </span>
                                      {user && reply.user_id === user.id && (
                                        <button
                                          onClick={() => handleDeleteReply(reply.id, comment.id)}
                                          className="text-xs text-red-500 hover:text-red-600 transition-colors"
                                        >
                                          삭제
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-700 leading-relaxed">{reply.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}