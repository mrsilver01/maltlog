'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { whiskyManager, CreateWhiskyRequest } from '../../lib/whiskyManager'

export default function AdminPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateWhiskyRequest>({
    name: '',
    name_en: '',
    abv: '',
    region: '',
    price: '',
    cask: '',
    description: '',
    distillery: '',
    age: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { whisky, error } = await whiskyManager.createWhisky({
        ...formData,
        image: imageFile || undefined
      })

      if (error) {
        setMessage(`에러: ${error}`)
      } else {
        setMessage(`✅ 위스키 "${whisky?.name}" 추가 완료!`)
        // 폼 리셋
        setFormData({
          name: '',
          name_en: '',
          abv: '',
          region: '',
          price: '',
          cask: '',
          description: '',
          distillery: '',
          age: ''
        })
        setImageFile(null)
      }
    } catch (error) {
      setMessage(`에러: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-rose-50 p-6">
      {/* 뒤로가기 버튼 */}
      <div className="mb-8 ml-8">
        <button
          onClick={() => router.push('/')}
          className="bg-rose-100 border border-rose-200 rounded-lg px-3 py-2 hover:bg-rose-150 transition-all duration-200 shadow-sm text-gray-700 hover:text-gray-800 text-sm font-medium hover:scale-105 transform hover:shadow-md hover:border-rose-300"
        >
          ← 메인으로
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-8 text-center">
            위스키 추가 관리자
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  위스키 이름 (한글) *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="예: 글렌그란트 아보랄리스"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  영문명 (선택)
                </label>
                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="예: Glengrant Arboralis"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  도수 *
                </label>
                <input
                  type="text"
                  name="abv"
                  value={formData.abv}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="예: 56.0%"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  지역 *
                </label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  <option value="">지역 선택</option>
                  <option value="스코틀랜드">스코틀랜드</option>
                  <option value="스코틀랜드 (아일레이)">스코틀랜드 (아일레이)</option>
                  <option value="스코틀랜드 (스페이사이드)">스코틀랜드 (스페이사이드)</option>
                  <option value="스코틀랜드 (하이랜드)">스코틀랜드 (하이랜드)</option>
                  <option value="아일랜드">아일랜드</option>
                  <option value="미국">미국</option>
                  <option value="일본">일본</option>
                  <option value="한국">한국</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  가격 *
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="예: 10만원 내외"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  캐스크 *
                </label>
                <input
                  type="text"
                  name="cask"
                  value={formData.cask}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="예: 버번 캐스크"
                  required
                />
              </div>
            </div>

            {/* 추가 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  증류소 (선택)
                </label>
                <input
                  type="text"
                  name="distillery"
                  value={formData.distillery}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="예: Glen Grant Distillery"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  숙성년수 (선택)
                </label>
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="예: 12년"
                />
              </div>
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                설명 (선택)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="위스키에 대한 설명을 입력하세요..."
              />
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                위스키 이미지
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {imageFile && (
                <p className="text-sm text-amber-600 mt-2">
                  선택된 파일: {imageFile.name}
                </p>
              )}
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '추가 중...' : '위스키 추가'}
            </button>

            {/* 메시지 */}
            {message && (
              <div className={`p-4 rounded-lg text-center ${
                message.includes('에러')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}