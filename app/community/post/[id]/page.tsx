'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { authHelpers } from '../../../../lib/supabase'

interface Post {
  id: string
  title: string
  content: string
  author: string
  authorImage?: string
  image?: string
  createdAt: string
  likes: number
  comments: number
}

interface Comment {
  id: string
  postId: string
  content: string
  author: string
  authorImage?: string
  createdAt: string
}

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editPost, setEditPost] = useState({ title: '', content: '', image: null as string | null })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loginStatus = localStorage.getItem('isLoggedIn') === 'true'
      setIsLoggedIn(loginStatus)
      loadPost()
      loadComments()
      setLoading(false)
    }
  }, [params.id])

  const loadPost = () => {
    const savedPosts = localStorage.getItem('communityPosts')
    if (savedPosts) {
      const posts: Post[] = JSON.parse(savedPosts)
      const foundPost = posts.find(p => p.id === params.id)
      setPost(foundPost || null)

      // 좋아요 상태 확인
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
      setIsLiked(likedPosts.includes(params.id))
    }
  }

  const currentUser = typeof window !== 'undefined' ? localStorage.getItem('userNickname') : ''
  const isAuthor = post?.author === currentUser

  const loadComments = () => {
    const savedComments = localStorage.getItem('postComments')
    if (savedComments) {
      const allComments: Comment[] = JSON.parse(savedComments)
      const postComments = allComments.filter(c => c.postId === params.id)
      setComments(postComments)
    }
  }

  const handleLogout = async () => {
    try {
      await authHelpers.signOut()
      setIsLoggedIn(false)
      alert('로그아웃되었습니다.')
      router.push('/')
    } catch (error: any) {
      alert('로그아웃 오류: ' + error.message)
    }
  }

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

  const handleLike = () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.')
      return
    }

    if (!post) return

    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
    let updatedLikedPosts: string[]
    let newLikeCount: number

    if (isLiked) {
      updatedLikedPosts = likedPosts.filter((id: string) => id !== params.id)
      newLikeCount = post.likes - 1
    } else {
      updatedLikedPosts = [...likedPosts, params.id]
      newLikeCount = post.likes + 1
    }

    localStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts))
    setIsLiked(!isLiked)

    // 게시글 좋아요 수 업데이트
    const savedPosts = localStorage.getItem('communityPosts')
    if (savedPosts) {
      const posts: Post[] = JSON.parse(savedPosts)
      const updatedPosts = posts.map(p =>
        p.id === params.id ? { ...p, likes: newLikeCount } : p
      )
      localStorage.setItem('communityPosts', JSON.stringify(updatedPosts))
      setPost(prev => prev ? { ...prev, likes: newLikeCount } : null)
    }
  }

  const handleEditPost = () => {
    if (!post) return
    setEditPost({
      title: post.title,
      content: post.content,
      image: post.image || null
    })
    setIsEditing(true)
  }

  const handleDeletePost = () => {
    if (!post) return
    if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      const savedPosts = localStorage.getItem('communityPosts')
      if (savedPosts) {
        const posts: Post[] = JSON.parse(savedPosts)
        const updatedPosts = posts.filter(p => p.id !== params.id)
        localStorage.setItem('communityPosts', JSON.stringify(updatedPosts))
      }

      // 댓글도 삭제
      const savedComments = localStorage.getItem('postComments')
      if (savedComments) {
        const allComments: Comment[] = JSON.parse(savedComments)
        const updatedComments = allComments.filter(c => c.postId !== params.id)
        localStorage.setItem('postComments', JSON.stringify(updatedComments))
      }

      alert('게시글이 삭제되었습니다.')
      router.push('/community')
    }
  }

  const handleSaveEdit = () => {
    if (!editPost.title.trim() || !editPost.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    const savedPosts = localStorage.getItem('communityPosts')
    if (savedPosts && post) {
      const posts: Post[] = JSON.parse(savedPosts)
      const updatedPosts = posts.map(p =>
        p.id === params.id
          ? {
              ...p,
              title: editPost.title.trim(),
              content: editPost.content.trim(),
              image: editPost.image || undefined
            }
          : p
      )
      localStorage.setItem('communityPosts', JSON.stringify(updatedPosts))

      setPost(prev => prev ? {
        ...prev,
        title: editPost.title.trim(),
        content: editPost.content.trim(),
        image: editPost.image || undefined
      } : null)
    }

    setIsEditing(false)
    alert('게시글이 수정되었습니다.')
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditPost({ title: '', content: '', image: null })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploading(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        setEditPost(prev => ({
          ...prev,
          image: e.target?.result as string
        }))
        setUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddComment = () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.')
      return
    }

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    const userNickname = localStorage.getItem('userNickname') || '익명'
    const userProfileImage = localStorage.getItem('userProfileImage')

    const comment: Comment = {
      id: Date.now().toString(),
      postId: params.id as string,
      content: newComment.trim(),
      author: userNickname,
      authorImage: userProfileImage || undefined,
      createdAt: new Date().toISOString()
    }

    const savedComments = localStorage.getItem('postComments') || '[]'
    const allComments: Comment[] = JSON.parse(savedComments)
    const updatedComments = [...allComments, comment]

    localStorage.setItem('postComments', JSON.stringify(updatedComments))
    setComments(prev => [...prev, comment])
    setNewComment('')

    // 게시글 댓글 수 업데이트
    const savedPosts = localStorage.getItem('communityPosts')
    if (savedPosts && post) {
      const posts: Post[] = JSON.parse(savedPosts)
      const updatedPosts = posts.map(p =>
        p.id === params.id ? { ...p, comments: p.comments + 1 } : p
      )
      localStorage.setItem('communityPosts', JSON.stringify(updatedPosts))
      setPost(prev => prev ? { ...prev, comments: prev.comments + 1 } : null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-gray-600 mb-4">로딩 중...</div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-gray-600 mb-4">게시글을 찾을 수 없습니다.</div>
          <button
            onClick={() => router.push('/community')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            커뮤니티로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50 p-6">
      {/* 헤더 */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-16 flex items-center justify-center">
              <img
                src="/whiskies/LOGO.png"
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
            onClick={() => router.push('/')}
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

      {/* 뒤로가기 버튼 */}
      <div className="mb-8 ml-8">
        <button
          onClick={() => router.push('/')}
          className="bg-rose-100 border border-rose-200 rounded-lg px-3 py-2 hover:bg-rose-150 transition-all duration-200 shadow-sm text-gray-700 hover:text-gray-800 text-sm font-medium hover:scale-105 transform hover:shadow-md hover:border-rose-300"
        >
          ← 메인으로
        </button>
      </div>

      {/* 메인 컨텐츠 */}
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

              {isLoggedIn && isAuthor && (
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
                        onClick={handleCancelEdit}
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
                {/* 프로필 이미지 */}
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
                  <span className="text-xs">{formatDate(post.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                    isLiked
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                  }`}
                >
                  <span>{isLiked ? '❤️' : '🤍'}</span>
                  <span>{post.likes}</span>
                </button>
                <span className="flex items-center gap-1">
                  <span>💬</span>
                  <span>{post.comments}</span>
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
                    <img
                      src={editPost.image}
                      alt="업로드된 이미지"
                      className="max-h-48 mx-auto rounded-lg"
                    />
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
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                      {uploading ? '업로드 중...' : '이미지 선택'}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF 파일을 업로드하세요</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            post.image && (
              <div className="mb-6">
                <img
                  src={post.image}
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
          {isLoggedIn && (
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
                  disabled={!newComment.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  댓글 작성
                </button>
              </div>
            </div>
          )}

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                아직 댓글이 없습니다.
                {!isLoggedIn && (
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
                    {/* 댓글 프로필 이미지 */}
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
                        <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
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