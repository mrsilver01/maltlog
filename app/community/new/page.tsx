'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import LoadingAnimation from '@/components/LoadingAnimation'
import { createCommunityPost } from '@/lib/communityPosts'
import toast from 'react-hot-toast'

export default function NewPostPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    image: null as string | null
  })
  const [uploading, setUploading] = useState(false)

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('제목과 내용을 모두 입력해주세요.')
      return
    }
    if (!user) {
      toast('게시글을 작성하려면 로그인해주세요.')
      return
    }
    if (uploading) {
      toast('이미지 업로드 중입니다. 잠시만 기다려주세요.')
      return
    }

    setUploading(true)
    try {
      const result = await createCommunityPost(
        newPost.title.trim(),
        newPost.content.trim(),
        newPost.image || undefined
      )
      if (result.success && result.id) {
        toast.success('게시글이 성공적으로 작성되었습니다!')
        router.push(`/community/post/${result.id}`)
      } else {
        toast.error('게시글 작성에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('게시글 작성 오류:', error)
      toast.error('게시글 작성 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
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
        let outputFormat = 'image/jpeg'
        if (['image/png', 'image/gif', 'image/webp'].includes(file.type)) {
          outputFormat = file.type
        }
        const compressedDataUrl = canvas.toDataURL(outputFormat, quality)
        resolve(compressedDataUrl)
      }
      img.onerror = () => reject(new Error('이미지 로드 실패'))
      img.src = URL.createObjectURL(file)
    })
  }

  const estimateMB = (dataUrl: string) => (dataUrl.length * 0.75) / 1024 / 1024

  // HEIC 변환 헬퍼 함수 (동적 import)
  const convertHeicIfNeeded = async (file: File): Promise<File> => {
    if (!/image\/(heic|heif)/i.test(file.type)) return file

    try {
      console.log('🔄 HEIC 파일 감지, JPEG로 변환 중...')
      const { default: heic2any } = await import('heic2any')
      const blob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9
      })
      const convertedFile = new File([blob as BlobPart], 'post.jpg', { type: 'image/jpeg' })
      console.log('✅ HEIC → JPEG 변환 완료')
      return convertedFile
    } catch (error) {
      console.error('❌ HEIC 변환 실패:', error)
      throw new Error('HEIC 파일 변환에 실패했습니다.')
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    let file = event.target.files?.[0]
    if (!file) return

    if (file.size > 20 * 1024 * 1024) {
      toast.error('이미지 파일 크기는 20MB 이하로 해주세요.')
      event.target.value = ''
      return
    }

    // HEIC 포맷 지원 추가
    const supported = ['image/jpeg','image/jpg','image/png','image/gif','image/webp','image/heic','image/heif']
    if (!supported.includes(file.type)) {
      toast('지원 포맷: JPEG, PNG, GIF, WebP, HEIC')
      event.target.value = ''
      return
    }

    setUploading(true)
    try {
      // HEIC 변환 (필요시)
      file = await convertHeicIfNeeded(file)

      let img = await compressImage(file, 600, 0.7)
      let size = estimateMB(img)
      if (size > 1.2) {
        img = await compressImage(file, 500, 0.6)
        size = estimateMB(img)
      }
      if (size > 0.8) {
        img = await compressImage(file, 400, 0.5)
        size = estimateMB(img)
      }
      setNewPost(prev => ({ ...prev, image: img }))
    } catch (error) {
      console.error('이미지 처리 오류:', error)
      toast.error(error instanceof Error ? error.message : '이미지 처리 중 오류가 발생했습니다.')
      event.target.value = ''
    } finally {
      setUploading(false)
    }
  }

  if (authLoading) {
    return <LoadingAnimation message="로딩 중..." />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-rose-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-4">게시글을 작성하려면 로그인해주세요.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            로그인하러 가기
          </button>
        </div>
      </div>
    )
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
            onClick={() => router.push('/community?ts=' + Date.now())}
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">새 게시글 작성</h2>

          <div className="space-y-6">
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
                rows={8}
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 mt-1">{newPost.content.length}/1000</div>
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이미지 (선택사항)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                {newPost.image ? (
                  <div className="relative">
                    <img src={newPost.image} alt="업로드된 이미지" className="max-h-64 mx-auto rounded-lg"/>
                    <button
                      onClick={() => setNewPost(prev => ({ ...prev, image: null }))}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*,.heic,.heif"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-lg"
                    >
                      {uploading ? '업로드 중...' : '📷 이미지 선택'}
                    </label>
                    <p className="text-sm text-gray-500 mt-2">JPEG, PNG, GIF, WebP, HEIC 등 (20MB 이하, 자동 압축)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push('/community?ts=' + Date.now())}
              className="flex-1 px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={handleCreatePost}
              disabled={!newPost.title.trim() || !newPost.content.trim() || uploading}
              className={`flex-1 px-6 py-3 rounded-lg transition-colors font-medium ${
                !newPost.title.trim() || !newPost.content.trim() || uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md'
              }`}
            >
              {uploading ? '작성 중...' : '게시글 작성'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}