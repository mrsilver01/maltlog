'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authHelpers } from '../../lib/supabase'

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

export default function CommunityPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    image: null as string | null
  })
  const [uploading, setUploading] = useState(false)

  // 로그인 상태 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loginStatus = localStorage.getItem('isLoggedIn') === 'true'
      setIsLoggedIn(loginStatus)

      // 임시 커뮤니티 데이터 정리
      const existingPosts = localStorage.getItem('communityPosts')
      if (existingPosts) {
        try {
          const posts = JSON.parse(existingPosts)
          const filteredPosts = posts.filter((post: Post) =>
            post.author !== 'MaltExpert' && post.author !== 'WhiskyLover'
          )
          localStorage.setItem('communityPosts', JSON.stringify(filteredPosts))
          console.log('Temporary community posts cleaned up')
        } catch (e) {
          console.log('Error cleaning community posts:', e)
        }
      }

      // 페이지 로드 시 자동 정리
      try {
        const usage = JSON.stringify(localStorage).length
        console.log('Current localStorage usage:', usage, 'bytes')

        // 5MB 이상이면 정리
        if (usage > 5 * 1024 * 1024) {
          console.log('Storage too large, cleaning up...')
          cleanupStorage()
        }
      } catch (e) {
        console.log('Storage check failed, cleaning up anyway...')
        cleanupStorage()
      }

      loadPosts()
      setLoading(false)
    }
  }, [])

  // 게시글 로드
  const loadPosts = () => {
    const savedPosts = localStorage.getItem('communityPosts')
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts))
    } else {
      // 빈 초기 상태
      setPosts([])
    }
  }

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      await authHelpers.signOut()
      setIsLoggedIn(false)
      alert('로그아웃되었습니다.')
      router.push('/')
    } catch (error: unknown) {
      alert('로그아웃 오류: ' + (error instanceof Error ? error.message : 'Unknown error'))
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

  // 개선된 이미지 압축 함수 (화질 vs 용량 균형)
  const compressImage = (file: File, maxWidth: number = 600, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // 적절한 크기로 조정 (최대 600px로 증가)
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        const newWidth = Math.floor(img.width * ratio)
        const newHeight = Math.floor(img.height * ratio)

        canvas.width = newWidth
        canvas.height = newHeight

        // 이미지 품질 향상을 위한 설정
        if (ctx) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, newWidth, newHeight)
        }

        // SVG와 GIF 파일 처리
        let outputFormat = 'image/jpeg'
        if (file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/webp') {
          outputFormat = file.type
        }

        // 개선된 품질로 압축 (70%)
        const compressedDataUrl = canvas.toDataURL(outputFormat, quality)
        resolve(compressedDataUrl)
      }

      img.onerror = () => reject(new Error('이미지 로드 실패'))
      img.src = URL.createObjectURL(file)
    })
  }

  // 이미지 업로드 처리
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 파일 크기 체크 (20MB 제한으로 확대)
      if (file.size > 20 * 1024 * 1024) {
        alert('이미지 파일 크기는 20MB 이하로 해주세요.')
        event.target.value = ''
        return
      }

      // 지원하는 이미지 포맷 확인
      const supportedFormats = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml'
      ]

      if (!supportedFormats.includes(file.type)) {
        alert('지원하는 이미지 포맷: JPEG, PNG, GIF, WebP, BMP, TIFF, SVG')
        event.target.value = ''
        return
      }

      setUploading(true)

      try {
        // 1단계: 개선된 압축 (600px, 70% 품질)
        let compressedImage = await compressImage(file, 600, 0.7)

        // 압축된 이미지 크기 체크
        let estimatedSize = (compressedImage.length * 0.75) / 1024 / 1024 // MB 단위

        // 2단계: 크면 더 압축 (500px, 60% 품질)
        if (estimatedSize > 1.2) {
          compressedImage = await compressImage(file, 500, 0.6)
          estimatedSize = (compressedImage.length * 0.75) / 1024 / 1024
        }

        // 3단계: 여전히 크면 더 압축 (400px, 50% 품질)
        if (estimatedSize > 0.8) {
          compressedImage = await compressImage(file, 400, 0.5)
        }

        setNewPost(prev => ({
          ...prev,
          image: compressedImage
        }))

        setUploading(false)
      } catch (error) {
        alert('이미지 처리 중 오류가 발생했습니다.')
        setUploading(false)
        event.target.value = ''
      }
    }
  }

  // 게시글 작성
  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    if (uploading) {
      alert('이미지 업로드 중입니다. 잠시만 기다려주세요.')
      return
    }

    // 게시글 작성 전 강제로 저장공간 정리
    try {
      console.log('Cleaning up storage before post creation...')
      cleanupStorage()
    } catch (cleanupError) {
      console.log('Pre-cleanup failed, continuing...', cleanupError)
    }

    try {
      const userNickname = localStorage.getItem('userNickname') || '익명'

      // 이미지 없는 최소한의 게시글 생성
      const post: Post = {
        id: Date.now().toString(),
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        author: userNickname,
        image: newPost.image || undefined, // 이미지가 있으면 포함
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0
      }

      // 기존 게시글을 최대 3개만 유지
      const limitedPosts = posts.slice(0, 3)
      const updatedPosts = [post, ...limitedPosts]

      // localStorage 저장 시도
      let saveSuccess = false
      let attempts = 0
      const maxAttempts = 3

      while (!saveSuccess && attempts < maxAttempts) {
        attempts++
        try {
          const postsToSave = attempts === 1 ? updatedPosts :
                             attempts === 2 ? updatedPosts.map(p => ({ ...p, image: undefined })) :
                             [post] // 마지막 시도는 새 게시글만

          localStorage.setItem('communityPosts', JSON.stringify(postsToSave))
          setPosts(postsToSave)
          saveSuccess = true

          if (attempts > 1) {
            alert(`게시글이 작성되었습니다. (시도 ${attempts}회 후 성공)`)
          }
        } catch (storageError) {
          console.log(`Storage attempt ${attempts} failed:`, storageError)

          if (attempts < maxAttempts) {
            // 더 많은 데이터 정리
            try {
              if (attempts === 1) {
                // 2번째 시도: 모든 이미지 제거
                cleanupStorage()
              } else if (attempts === 2) {
                // 3번째 시도: localStorage 완전 초기화
                localStorage.clear()
                setPosts([])
              }
            } catch (e) {
              console.log('Cleanup during retry failed:', e)
            }
          }
        }
      }

      if (!saveSuccess) {
        alert('저장에 실패했습니다. 브라우저의 저장 공간을 정리해주세요.')
        return
      }

      // 폼 초기화
      setNewPost({ title: '', content: '', image: null })
      setShowCreateForm(false)

      // 작성 완료 메시지 및 페이지 새로고침
      alert('작성 완료되었습니다.')
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      alert('게시글 작성 중 오류가 발생했습니다.')
      console.error('Post creation error:', error)
    }
  }

  // 강력한 localStorage 공간 정리 함수
  const cleanupStorage = () => {
    try {
      // 1. 모든 이미지 제거하고 최근 게시글만 유지
      const savedPosts = localStorage.getItem('communityPosts')
      if (savedPosts) {
        const posts: Post[] = JSON.parse(savedPosts)
        // 최근 5개 게시글만 유지하고 모든 이미지 제거
        const cleanedPosts = posts.slice(0, 5).map(post => ({
          ...post,
          image: undefined // 모든 이미지 제거
        }))
        localStorage.setItem('communityPosts', JSON.stringify(cleanedPosts))
        setPosts(cleanedPosts)
      }

      // 2. 다른 불필요한 데이터 완전 삭제
      const keysToRemove = [
        'reviewsData',
        'userNotes',
        'expandedComments',
        'postComments',
        'likedPosts',
        'likedWhiskies',
        'userProfileImage'
      ]

      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key)
        } catch (e) {
          console.log(`Failed to remove ${key}`)
        }
      })

      return true
    } catch (error) {
      console.error('Storage cleanup error:', error)
      // 완전 초기화 시도
      try {
        localStorage.clear()
        setPosts([])
        return true
      } catch (clearError) {
        console.error('Failed to clear storage:', clearError)
        return false
      }
    }
  }

  // 강제 저장공간 정리 함수
  const forceCleanupStorage = () => {
    if (confirm('저장 공간을 정리하시겠습니까? 오래된 게시글의 이미지가 삭제됩니다.')) {
      try {
        // 커뮤니티 게시글 정리
        const savedPosts = localStorage.getItem('communityPosts')
        if (savedPosts) {
          const posts: Post[] = JSON.parse(savedPosts)
          // 최근 5개만 이미지 유지하고 나머지는 이미지 제거
          const cleanedPosts = posts.map((post, index) => {
            if (index >= 5 && post.image) {
              return { ...post, image: undefined }
            }
            return post
          })
          localStorage.setItem('communityPosts', JSON.stringify(cleanedPosts))
          setPosts(cleanedPosts)
        }

        // 기타 불필요한 데이터 정리
        const keysToClean = ['userNotes', 'expandedComments', 'likedPosts', 'postComments']
        keysToClean.forEach(key => {
          const data = localStorage.getItem(key)
          if (data && data.length > 10000) { // 10KB 이상인 경우만 정리
            localStorage.removeItem(key)
          }
        })

        alert('저장 공간이 정리되었습니다.')
        window.location.reload()
      } catch (error) {
        alert('정리 중 오류가 발생했습니다.')
        console.error('Force cleanup error:', error)
      }
    }
  }

  // 폼 초기화
  const resetForm = () => {
    setNewPost({ title: '', content: '', image: null })
    setShowCreateForm(false)
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

  return (
    <div className="min-h-screen bg-rose-50 p-6">
      {/* 헤더 */}
      <header className="flex items-center justify-between mb-8">
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
        {/* 게시글 작성 버튼 */}
        {isLoggedIn && (
          <div className="mb-8">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              새 게시글 작성
            </button>
          </div>
        )}

        {/* 게시글 목록 */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => router.push(`/community/post/${post.id}`)}
            >
              <div className="flex items-start gap-4">
                {/* 게시글 이미지 (있는 경우) */}
                {post.image && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={post.image}
                      alt="게시글 이미지"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 게시글 내용 */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{post.author}</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 게시글이 없을 때 */}
        {posts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-500 text-lg mb-4">아직 게시글이 없습니다.</div>
            {isLoggedIn && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                첫 번째 게시글을 작성해보세요!
              </button>
            )}
          </div>
        )}
      </div>

      {/* 게시글 작성 모달 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">새 게시글 작성</h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* 제목 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="게시글 제목을 입력하세요..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  maxLength={100}
                />
                <div className="text-xs text-gray-500 mt-1">{newPost.title.length}/100</div>
              </div>

              {/* 내용 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="게시글 내용을 입력하세요..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-black"
                  rows={6}
                  maxLength={1000}
                />
                <div className="text-xs text-gray-500 mt-1">{newPost.content.length}/1000</div>
              </div>

              {/* 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이미지 (선택사항)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  {newPost.image ? (
                    <div className="relative">
                      <img
                        src={newPost.image}
                        alt="업로드된 이미지"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        onClick={() => setNewPost(prev => ({ ...prev, image: null }))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/tiff,image/svg+xml"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        {uploading ? '업로드 중...' : '이미지 선택'}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF, WebP, BMP, TIFF, SVG 파일 (20MB 이하, 자동 압축)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 버튼들 */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!newPost.title.trim() || !newPost.content.trim() || uploading}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
                  !newPost.title.trim() || !newPost.content.trim() || uploading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md'
                }`}
              >
                {uploading ? '업로드 중...' : '게시글 작성'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}