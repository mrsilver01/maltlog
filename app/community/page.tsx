'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext' // ✅ 1. 중앙 AuthContext를 사용합니다.
import LoadingAnimation from '@/components/LoadingAnimation' // ✅ 2. 모든 경로를 @/로 통일합니다.
import { getAllCommunityPosts, createCommunityPost, CommunityPostWithProfile } from '@/lib/communityPosts'

type Post = CommunityPostWithProfile

export default function CommunityPage() {
  const router = useRouter()
  // ✅ 3. AuthContext에서 user, profile, signOut 함수 등을 모두 가져옵니다.
  const { user, profile, signOut, loading: authLoading } = useAuth()

  const [posts, setPosts] = useState<Post[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    image: null as string | null
  })
  const [uploading, setUploading] = useState(false)

  // ✅ 4. 게시글 로드 함수를 useCallback으로 최적화합니다.
  const loadSupabasePosts = useCallback(async () => {
    setIsLoadingPosts(true)
    try {
      const supabasePosts = await getAllCommunityPosts()
      setPosts(supabasePosts)
    } catch (error) {
      console.error('Supabase 게시글 로드 실패:', error)
      setPosts([])
    } finally {
      setIsLoadingPosts(false)
    }
  }, [])

  // ✅ 5. 페이지가 로드될 때 게시글을 불러옵니다. 인증 상태는 AuthContext가 관리합니다.
  useEffect(() => {
    loadSupabasePosts()
  }, [loadSupabasePosts])

  // 로그아웃 함수 (AuthContext의 signOut 사용)
  const handleLogout = async () => {
    try {
      await signOut()
      alert('로그아웃되었습니다.')
      router.push('/')
    } catch (error: unknown) {
      alert('로그아웃 오류: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  // 게시글 작성 - Supabase 사용
  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }
    if (!user) { // 'isLoggedIn' 대신 'user' 객체의 존재 여부로 확인
      alert('게시글을 작성하려면 로그인해주세요.')
      return
    }
    if (uploading) {
      alert('이미지 업로드 중입니다. 잠시만 기다려주세요.')
      return
    }

    setUploading(true)
    try {
      const result = await createCommunityPost(
        newPost.title.trim(),
        newPost.content.trim(),
        newPost.image || undefined
      )
      if (result.success) {
        setNewPost({ title: '', content: '', image: null })
        setShowCreateForm(false)
        await loadSupabasePosts()
        alert('게시글이 성공적으로 작성되었습니다!')
      } else {
        alert('게시글 작성에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('게시글 작성 오류:', error)
      alert('게시글 작성 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  // --------------------------------------------------------------
  // 아래 함수들은 기존 기능 유지를 위해 그대로 둡니다. (수정 없음)
  // --------------------------------------------------------------

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    return date.toLocaleDateString('ko-KR')
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 20 * 1024 * 1024) {
      alert('이미지 파일 크기는 20MB 이하로 해주세요.')
      event.target.value = ''
      return
    }
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml']
    if (!supportedFormats.includes(file.type)) {
      alert('지원하는 이미지 포맷: JPEG, PNG, GIF, WebP, BMP, TIFF, SVG')
      event.target.value = ''
      return
    }

    setUploading(true)
    try {
      let compressedImage = await compressImage(file, 600, 0.7)
      let estimatedSize = (compressedImage.length * 0.75) / 1024 / 1024
      if (estimatedSize > 1.2) {
        compressedImage = await compressImage(file, 500, 0.6)
      }
      if (estimatedSize > 0.8) {
        compressedImage = await compressImage(file, 400, 0.5)
      }
      setNewPost(prev => ({ ...prev, image: compressedImage }))
    } catch (error) {
      alert('이미지 처리 중 오류가 발생했습니다.')
      event.target.value = ''
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setNewPost({ title: '', content: '', image: null })
    setShowCreateForm(false)
  }

  if (authLoading || isLoadingPosts) {
    return <LoadingAnimation message="커뮤니티를 불러오는 중..." />
  }

  return (
    <div className="min-h-screen bg-rose-50 p-6">
      {/* 헤더 */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-16 flex items-center justify-center">
              <img src="/whiskies/LOGO.png" alt="Maltlog Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-4xl font-bold text-amber-800 font-[family-name:var(--font-jolly-lodger)]">Maltlog</h1>
            <span className="text-4xl font-bold text-blue-500 ml-2 font-[family-name:var(--font-jolly-lodger)]">Community</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/')} className="text-xl font-bold text-gray-600 hover:text-red-500 transition-all duration-200 hover:scale-110 transform font-[family-name:var(--font-jolly-lodger)]">HOME</button>
          {user ? ( // ✅ 'isLoggedIn' 대신 'user' 객체로 확인
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{profile?.nickname || '사용자'}님</span> {/* ✅ 'userNickname' 대신 'profile' 객체 사용 */}
              <button onClick={handleLogout} className="bg-gray-600 text-white px-5 py-2 rounded-full text-sm hover:bg-gray-500 transition-all duration-200 hover:scale-110 transform shadow-md hover:shadow-lg">로그아웃</button>
            </div>
          ) : (
            <button onClick={() => router.push('/login')} className="bg-amber-900 text-white px-5 py-2 rounded-full text-sm hover:bg-amber-800 transition-all duration-200 hover:scale-110 transform shadow-md hover:shadow-lg">로그인</button>
          )}
        </div>
      </header>
      
      {/* (중략) JSX 부분은 기존과 거의 동일합니다.  */}
      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto">
        {/* 게시글 작성 버튼 */}
        {user && (
          <div className="mb-8">
            <button onClick={() => setShowCreateForm(true)} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md hover:shadow-lg">새 게시글 작성</button>
          </div>
        )}

        {/* 게시글 목록 */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => router.push(`/community/post/${post.id}`)}>
              <div className="flex items-start gap-4">
                {post.image_url && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={post.image_url} alt="게시글 이미지" className="w-full h-full object-cover"/>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors">{post.title}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      {post.profiles?.avatar_url ? (
                        <img src={post.profiles.avatar_url} alt={post.profiles.nickname} className="w-8 h-8 rounded-full object-cover border border-gray-200"/>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">{post.profiles?.nickname.charAt(0)}</div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">{post.profiles?.nickname || '알 수 없는 사용자'}</span>
                        <span className="text-xs">{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 게시글 작성 모달 등 나머지 JSX는 기존과 동일하게 유지 */}
        {showCreateForm && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold text-gray-800">새 게시글 작성</h3>
               <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
             </div>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                 <input type="text" value={newPost.title} onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))} placeholder="게시글 제목을 입력하세요..." className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" maxLength={100} />
                 <div className="text-xs text-gray-500 mt-1">{newPost.title.length}/100</div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                 <textarea value={newPost.content} onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))} placeholder="게시글 내용을 입력하세요..." className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-black" rows={6} maxLength={1000} />
                 <div className="text-xs text-gray-500 mt-1">{newPost.content.length}/1000</div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">이미지 (선택사항)</label>
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                   {newPost.image ? (
                     <div className="relative">
                       <img src={newPost.image} alt="업로드된 이미지" className="max-h-48 mx-auto rounded-lg"/>
                       <button onClick={() => setNewPost(prev => ({ ...prev, image: null }))} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600">✕</button>
                     </div>
                   ) : (
                     <div>
                       <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" disabled={uploading} />
                       <label htmlFor="image-upload" className="cursor-pointer inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                         {uploading ? '업로드 중...' : '이미지 선택'}
                       </label>
                       <p className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF 등 (20MB 이하, 자동 압축)</p>
                     </div>
                   )}
                 </div>
               </div>
             </div>
             <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
               <button onClick={resetForm} className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">취소</button>
               <button onClick={handleCreatePost} disabled={!newPost.title.trim() || !newPost.content.trim() || uploading} className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${!newPost.title.trim() || !newPost.content.trim() || uploading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md'}`}>{uploading ? '업로드 중...' : '게시글 작성'}</button>
             </div>
           </div>
         </div>
        )}
      </div>
    </div>
  )
}