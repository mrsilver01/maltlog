'use client'

import { useState, useRef } from 'react'
import { uploadWhiskyImage } from '../../../lib/whiskyImageStorage'
import { whiskeyDatabase } from '../../../lib/whiskyData'

export default function AdminImagesPage() {
  const [uploading, setUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<{[key: string]: {success: boolean, url?: string, error?: string}}>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 위스키 목록 (이미지가 있는 것만)
  const whiskiesWithImages = Object.values(whiskeyDatabase).filter(whisky =>
    whisky.image && !whisky.image.includes('no-pic') && !whisky.image.includes('supabase')
  ).slice(0, 20) // 처음 20개만

  const handleFileUpload = async (whiskyId: string, whiskyName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      console.log(`${whiskyName} 이미지 업로드 시작...`)
      const result = await uploadWhiskyImage(file, whiskyId)

      setUploadResults(prev => ({
        ...prev,
        [whiskyId]: result
      }))

      if (result.success) {
        console.log(`✅ ${whiskyName} 업로드 성공:`, result.url)
      } else {
        console.error(`❌ ${whiskyName} 업로드 실패:`, result.error)
      }
    } catch (error) {
      console.error(`${whiskyName} 업로드 중 오류:`, error)
      setUploadResults(prev => ({
        ...prev,
        [whiskyId]: { success: false, error: '업로드 중 오류가 발생했습니다.' }
      }))
    } finally {
      setUploading(false)
    }
  }

  const openFileSelector = (whiskyId: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => handleFileUpload(whiskyId, whiskeyDatabase[whiskyId].name, e as any)
    input.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">위스키 이미지 관리</h1>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">📋 업로드 안내</h2>
            <p className="text-blue-800">
              각 위스키의 "이미지 업로드" 버튼을 클릭하여 Supabase Storage에 이미지를 업로드하세요.
              업로드된 이미지는 자동으로 모든 환경에서 표시됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whiskiesWithImages.map((whisky) => {
              const result = uploadResults[whisky.id]

              return (
                <div key={whisky.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-center w-full h-48 bg-gray-100 rounded-lg mb-4">
                    {whisky.image && (
                      <img
                        src={result?.url || whisky.image}
                        alt={whisky.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/whiskies/no.pic whisky.png'
                        }}
                      />
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                    {whisky.name}
                  </h3>

                  <p className="text-xs text-gray-600 mb-3">
                    ID: {whisky.id}
                  </p>

                  {result?.success ? (
                    <div className="p-2 bg-green-50 rounded text-sm">
                      <span className="text-green-800">✅ 업로드 완료</span>
                      <p className="text-xs text-green-600 mt-1 break-all">
                        {result.url}
                      </p>
                    </div>
                  ) : result?.error ? (
                    <div className="p-2 bg-red-50 rounded text-sm">
                      <span className="text-red-800">❌ 업로드 실패</span>
                      <p className="text-xs text-red-600 mt-1">
                        {result.error}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => openFileSelector(whisky.id)}
                      disabled={uploading}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
                    >
                      {uploading ? '업로드 중...' : '이미지 업로드'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">📝 다음 단계</h3>
            <ol className="text-yellow-800 space-y-1 text-sm">
              <li>1. 위의 위스키들에 대해 이미지를 업로드합니다</li>
              <li>2. 업로드가 완료되면 위스키 데이터에서 이미지 URL을 업데이트합니다</li>
              <li>3. 배포하여 모든 환경에서 이미지가 정상 표시되는지 확인합니다</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}