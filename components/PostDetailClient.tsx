'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    return date.toLocaleDateString('ko-KR')
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
            댓글 ({initialComments.length})
          </h3>

          {initialComments.length === 0 ? (
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
            <div className="space-y-4">
              {initialComments.map((comment) => (
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
                        <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {user && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-center">
                댓글 기능은 현재 개발 중입니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}