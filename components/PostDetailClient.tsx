'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import LoadingAnimation from '@/components/LoadingAnimation'
import { updateCommunityPost, deleteCommunityPost } from '@/lib/communityPosts'
import { likePost, unlikePost, checkIfPostLiked, getPostLikesCount } from '@/lib/postActions'
import { getPostComments, getReplies, addComment, updateComment, deleteComment, ReviewComment } from '@/lib/commentActions'
import { supabase } from '@/lib/supabase'

interface Post {
  id: string
  user_id: string
  title: string
  content: string
  image_url?: string
  likes_count: number
  comments_count: number
  created_at: string
  updated_at?: string
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
  updated_at?: string
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

export default function PostDetailClient({ post: initialPost, initialComments }: PostDetailClientProps) {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()

  const [post, setPost] = useState<Post>(initialPost)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editPost, setEditPost] = useState({ title: '', content: '', image: null as string | null })
  const [uploading, setUploading] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentContent, setEditCommentContent] = useState('')
  const [postLike, setPostLike] = useState<{isLiked: boolean, count: number}>({isLiked: false, count: initialPost.likes_count})
  const [likeLoading, setLikeLoading] = useState(false)
  const [replies, setReplies] = useState<{[key: string]: ReviewComment[]}>({})
  const [showReplies, setShowReplies] = useState<{[key: string]: boolean}>({})
  const [replyForms, setReplyForms] = useState<{[key: string]: boolean}>({})
  const [replyContents, setReplyContents] = useState<{[key: string]: string}>({})
  const [replySubmitting, setReplySubmitting] = useState<{[key: string]: boolean}>({})
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null)
  const [editReplyContent, setEditReplyContent] = useState('')

  const isAuthor = user && post.user_id === user.id

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    return date.toLocaleDateString('ko-KR')
  }

  // 댓글 새로고침
  // 게시글 좋아요 상태 로딩
  useEffect(() => {
    const loadPostLike = async () => {
      if (!user) {
        setPostLike({isLiked: false, count: initialPost.likes_count})
        return
      }

      const count = await getPostLikesCount(post.id)
      const isLiked = await checkIfPostLiked(post.id, user.id)
      setPostLike({isLiked, count})
    }

    loadPostLike()
  }, [user, post.id, initialPost.likes_count])

  // 게시글 좋아요/취소 핸들러
  const handlePostLike = async () => {
    if (!user) {
      alert('좋아요를 누르려면 로그인해주세요.')
      router.push('/login')
      return
    }

    if (likeLoading) return

    setLikeLoading(true)

    const isCurrentlyLiked = postLike.isLiked
    const currentCount = postLike.count

    // 옵티미스틱 업데이트
    setPostLike({
      isLiked: !isCurrentlyLiked,
      count: isCurrentlyLiked ? currentCount - 1 : currentCount + 1
    })

    try {
      let success = false
      if (isCurrentlyLiked) {
        success = await unlikePost(post.id, user.id)
      } else {
        success = await likePost(post.id, user.id)
      }

      if (!success) {
        // 실패시 롤백
        setPostLike({
          isLiked: isCurrentlyLiked,
          count: currentCount
        })
        alert('좋아요 처리에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error)
      // 실패시 롤백
      setPostLike({
        isLiked: isCurrentlyLiked,
        count: currentCount
      })
      alert('좋아요 처리 중 오류가 발생했습니다.')
    } finally {
      setLikeLoading(false)
    }
  }

  const refreshComments = async () => {
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })

    if (!error && comments) {
      const transformedComments = comments.map(comment => ({
        id: comment.id,
        user_id: comment.user_id,
        post_id: comment.post_id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        profiles: comment.profiles,
        author: comment.profiles?.nickname || '익명 사용자',
        authorImage: comment.profiles?.avatar_url || null
      }))
      setComments(transformedComments)
    }
  }

  // 답글 토글
  const toggleReplies = async (commentId: string) => {
    const isCurrentlyShown = showReplies[commentId]

    setShowReplies(prev => ({
      ...prev,
      [commentId]: !isCurrentlyShown
    }))

    // 답글을 처음 볼 때만 로드
    if (!isCurrentlyShown && !replies[commentId]) {
      const repliesData = await getReplies(parseInt(commentId))
      setReplies(prev => ({
        ...prev,
        [commentId]: repliesData
      }))
    }
  }

  // 답글 폼 토글
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

  // 답글 수정
  const handleEditReply = async (replyId: string) => {
    if (!editReplyContent.trim()) {
      alert('답글 내용을 입력해주세요.')
      return
    }

    try {
      const success = await updateComment(replyId, user!.id, editReplyContent.trim())

      if (success) {
        setEditingReplyId(null)
        setEditReplyContent('')

        // 모든 답글 목록 새로고침
        const newReplies: {[key: string]: ReviewComment[]} = {}
        for (const commentId of Object.keys(replies)) {
          if (replies[commentId] && replies[commentId].length > 0) {
            newReplies[commentId] = await getReplies(parseInt(commentId))
          }
        }
        setReplies(newReplies)

        alert('답글이 수정되었습니다!')
      } else {
        alert('답글 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('답글 수정 중 오류:', error)
      alert('답글 수정 중 오류가 발생했습니다.')
    }
  }

  // 답글 삭제
  const handleDeleteReply = async (replyId: string, parentCommentId: string) => {
    if (!confirm('정말로 이 답글을 삭제하시겠습니까?')) return

    try {
      const success = await deleteComment(replyId, user!.id)

      if (success) {
        // 해당 댓글의 답글 목록 새로고침
        const updatedReplies = await getReplies(parseInt(parentCommentId))
        setReplies(prev => ({
          ...prev,
          [parentCommentId]: updatedReplies
        }))

        // 전체 댓글 목록도 새로고침 (댓글 수 업데이트용)
        await refreshComments()

        alert('답글이 삭제되었습니다!')
      } else {
        alert('답글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('답글 삭제 중 오류:', error)
      alert('답글 삭제 중 오류가 발생했습니다.')
    }
  }

  // 답글 작성
  const handleSubmitReply = async (parentCommentId: string) => {
    if (!user) {
      alert('답글을 작성하려면 로그인해주세요.')
      return
    }

    const content = replyContents[parentCommentId]?.trim()
    if (!content) {
      alert('답글 내용을 입력해주세요.')
      return
    }

    setReplySubmitting(prev => ({ ...prev, [parentCommentId]: true }))

    try {
      const success = await addComment(post.id, user.id, content, 'post', parseInt(parentCommentId))

      if (success) {
        // 답글 목록 새로고침
        const updatedReplies = await getReplies(parseInt(parentCommentId))
        setReplies(prev => ({
          ...prev,
          [parentCommentId]: updatedReplies
        }))

        // 답글 보기 상태 활성화
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

        // 전체 댓글 목록도 새로고침
        await refreshComments()

        alert('답글이 작성되었습니다!')
      } else {
        alert('답글 작성에 실패했습니다.')
      }
    } catch (error) {
      console.error('답글 작성 중 오류:', error)
      alert('답글 작성 중 오류가 발생했습니다.')
    } finally {
      setReplySubmitting(prev => ({ ...prev, [parentCommentId]: false }))
    }
  }

  // 댓글 작성
  const handleAddComment = async () => {
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    setIsSubmittingComment(true)

    try {
      const success = await addComment(post.id, user.id, newComment.trim(), 'post')

      if (success) {
        setNewComment('')
        await refreshComments()

        // 게시글 댓글 수 업데이트
        const { data: commentCount } = await supabase
          .from('comments')
          .select('id', { count: 'exact' })
          .eq('post_id', post.id)

        if (commentCount) {
          await supabase
            .from('posts')
            .update({ comments_count: commentCount.length })
            .eq('id', post.id)

          setPost(prev => ({ ...prev, comments_count: commentCount.length }))
        }
      }
    } catch (error) {
      console.error('댓글 작성 중 오류:', error)
      alert('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // 댓글 수정
  const handleEditComment = async (commentId: string) => {
    if (!editCommentContent.trim()) {
      alert('댓글 내용을 입력해주세요.')
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
        alert('댓글 수정에 실패했습니다.')
      } else {
        setEditingCommentId(null)
        setEditCommentContent('')
        await refreshComments()
      }
    } catch (error) {
      console.error('댓글 수정 중 오류:', error)
      alert('댓글 수정 중 오류가 발생했습니다.')
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
        alert('댓글 삭제에 실패했습니다.')
      } else {
        await refreshComments()

        // 게시글 댓글 수 업데이트
        const { data: commentCount } = await supabase
          .from('comments')
          .select('id', { count: 'exact' })
          .eq('post_id', post.id)

        if (commentCount) {
          await supabase
            .from('posts')
            .update({ comments_count: commentCount.length })
            .eq('id', post.id)

          setPost(prev => ({ ...prev, comments_count: commentCount.length }))
        }
      }
    } catch (error) {
      console.error('댓글 삭제 중 오류:', error)
      alert('댓글 삭제 중 오류가 발생했습니다.')
    }
  }

  // 게시글 수정
  const handleEditPost = () => {
    setEditPost({
      title: post.title,
      content: post.content,
      image: post.image_url || null
    })
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!editPost.title.trim() || !editPost.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    setUploading(true)
    try {
      const success = await updateCommunityPost(
        post.id,
        editPost.title.trim(),
        editPost.content.trim(),
        editPost.image || undefined
      )

      if (success) {
        setPost(prev => ({
          ...prev,
          title: editPost.title.trim(),
          content: editPost.content.trim(),
          image_url: editPost.image || undefined
        }))
        setIsEditing(false)
        alert('게시글이 수정되었습니다.')
      } else {
        alert('게시글 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('게시글 수정 오류:', error)
      alert('게시글 수정 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return

    try {
      const success = await deleteCommunityPost(post.id)
      if (success) {
        alert('게시글이 삭제되었습니다.')
        router.push('/community')
      } else {
        alert('게시글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('게시글 삭제 오류:', error)
      alert('게시글 삭제 중 오류가 발생했습니다.')
    }
  }

  const compressImage = (file: File, maxWidth: number = 600, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        const newWidth = Math.floor(img.width * ratio)
        const newHeight = Math.floor(img.height * ratio)
        canvas.width = newWidth
        canvas.height = newHeight
        if (ctx) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, newWidth, newHeight)
        }
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      img.onerror = () => reject(new Error('이미지 로드 실패'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const compressedImage = await compressImage(file, 600, 0.7)
      setEditPost(prev => ({ ...prev, image: compressedImage }))
    } catch (error) {
      alert('이미지 처리 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  if (authLoading) {
    return <LoadingAnimation message="로딩 중..." />
  }

  return (
    <div className="min-h-screen bg-rose-50 p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-16 flex items-center justify-center">
              <img
                src="/whiskies/logo.png"
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
            <div className="flex items-start justify-between mb-4">
              {isEditing ? (
                <input
                  type="text"
                  value={editPost.title}
                  onChange={(e) => setEditPost(prev => ({ ...prev, title: e.target.value }))}
                  className="text-3xl font-bold text-gray-800 border-b-2 border-blue-500 focus:outline-none bg-transparent flex-1 mr-4"
                  maxLength={100}
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-800">{post.title}</h1>
              )}

              {user && isAuthor && (
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editPost.title.trim() || !editPost.content.trim() || uploading}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleEditPost}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={handleDeletePost}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-3">
                {post.profiles?.avatar_url ? (
                  <img
                    src={post.profiles.avatar_url}
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
                  disabled={likeLoading}
                  className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded-md transition-colors group disabled:opacity-50"
                >
                  <span className={`transition-colors ${
                    postLike.isLiked
                      ? 'text-red-500'
                      : 'text-gray-400 group-hover:text-red-400'
                  }`}>
                    {postLike.isLiked ? '❤️' : '🤍'}
                  </span>
                  <span className="text-gray-600">
                    {postLike.count}
                  </span>
                </button>
                <span className="flex items-center gap-1">
                  <span className="text-gray-400">💬</span>
                  <span className="text-gray-600">{post.comments_count}</span>
                </span>
              </div>
            </div>
          </div>

          {/* 게시글 이미지 */}
          {isEditing ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">이미지 (선택사항)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                {editPost.image ? (
                  <div className="relative">
                    <img src={editPost.image} alt="업로드된 이미지" className="max-h-48 mx-auto rounded-lg"/>
                    <button
                      onClick={() => setEditPost(prev => ({ ...prev, image: null }))}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="edit-image-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="edit-image-upload"
                      className="cursor-pointer inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      {uploading ? '업로드 중...' : '📷 이미지 선택'}
                    </label>
                  </div>
                )}
              </div>
            </div>
          ) : (
            post.image_url && (
              <div className="mb-6">
                <img
                  src={post.image_url}
                  alt="게시글 이미지"
                  className="w-full max-h-96 object-contain rounded-lg"
                />
              </div>
            )
          )}

          {/* 게시글 내용 */}
          <div className="prose max-w-none">
            {isEditing ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                <textarea
                  value={editPost.content}
                  onChange={(e) => setEditPost(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={8}
                  maxLength={1000}
                />
                <div className="text-xs text-gray-500 mt-1">{editPost.content.length}/1000</div>
              </div>
            ) : (
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            )}
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
                    {comment.profiles?.avatar_url ? (
                      <img
                        src={comment.profiles.avatar_url}
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

                      {/* 답글 버튼 */}
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => toggleReplyForm(comment.id)}
                          className="text-xs text-blue-500 hover:text-blue-600"
                        >
                          답글 달기
                        </button>
                        {replies[comment.id] && replies[comment.id].length > 0 && (
                          <button
                            onClick={() => toggleReplies(comment.id)}
                            className="text-xs text-gray-500 hover:text-gray-600"
                          >
                            {showReplies[comment.id] ? '답글 숨기기' : `답글 ${replies[comment.id].length}개 보기`}
                          </button>
                        )}
                      </div>

                      {/* 답글 작성 폼 */}
                      {replyForms[comment.id] && (
                        <div className="mt-3 ml-6 p-3 bg-gray-50 rounded-lg">
                          <textarea
                            value={replyContents[comment.id] || ''}
                            onChange={(e) => setReplyContents(prev => ({
                              ...prev,
                              [comment.id]: e.target.value
                            }))}
                            placeholder="답글을 입력하세요..."
                            className="w-full p-2 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            disabled={replySubmitting[comment.id]}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => toggleReplyForm(comment.id)}
                              className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                            >
                              취소
                            </button>
                            <button
                              onClick={() => handleSubmitReply(comment.id)}
                              disabled={replySubmitting[comment.id] || !replyContents[comment.id]?.trim()}
                              className={`text-xs px-2 py-1 rounded ${
                                replySubmitting[comment.id] || !replyContents[comment.id]?.trim()
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-500 text-white hover:bg-blue-600'
                              }`}
                            >
                              {replySubmitting[comment.id] ? '작성 중...' : '답글 작성'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 답글 목록 */}
                      {showReplies[comment.id] && replies[comment.id] && (
                        <div className="mt-3 ml-6 space-y-3">
                          {replies[comment.id].map((reply) => (
                            <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-start gap-2">
                                {reply.profiles?.avatar_url ? (
                                  <img
                                    src={reply.profiles.avatar_url}
                                    alt={reply.profiles.nickname || ''}
                                    className="w-6 h-6 rounded-full object-cover border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                    {(reply.profiles?.nickname || '').charAt(0)}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">
                                      {reply.profiles?.nickname || '익명'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500">
                                        {formatDate(reply.created_at)}
                                      </span>
                                      {user && reply.user_id === user.id && (
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() => {
                                              setEditingReplyId(reply.id)
                                              setEditReplyContent(reply.content)
                                            }}
                                            className="text-xs text-blue-500 hover:text-blue-600"
                                          >
                                            수정
                                          </button>
                                          <button
                                            onClick={() => handleDeleteReply(reply.id, comment.id)}
                                            className="text-xs text-red-500 hover:text-red-600"
                                          >
                                            삭제
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {editingReplyId === reply.id ? (
                                    <div className="space-y-2">
                                      <textarea
                                        value={editReplyContent}
                                        onChange={(e) => setEditReplyContent(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                                        rows={2}
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleEditReply(reply.id)}
                                          className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                        >
                                          저장
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingReplyId(null)
                                            setEditReplyContent('')
                                          }}
                                          className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                                        >
                                          취소
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-700">{reply.content}</p>
                                  )}
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