'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    return date.toLocaleDateString('ko-KR')
  }

  // 댓글 새로고침
  const refreshComments = async () => {
    const { data: commentsData, error } = await supabase
      .from('comments')
      .select(`
        id,
        user_id,
        content,
        created_at,
        post_id,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .eq('post_id', post.id)
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
    }
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
                <span className="flex items-center gap-1">
                  <span className="text-gray-400">❤️</span>
                  <span className="text-gray-600">{post.likes_count}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-gray-400">💬</span>
                  <span className="text-gray-600">{post.comments_count}</span>
                </span>
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