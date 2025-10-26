'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/app/context/AuthContext'

interface ReportDialogProps {
  targetType: 'post' | 'comment' | 'review'
  targetId: string
  onClose: () => void
}

export function ReportDialog({ targetType, targetId, onClose }: ReportDialogProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const reasonOptions = [
    { value: 'spam', label: '스팸 또는 중복 게시물' },
    { value: 'abuse', label: '괴롭힘 또는 악용' },
    { value: 'minor', label: '미성년자에게 부적절한 내용' },
    { value: 'illegal', label: '불법적인 내용' },
    { value: 'privacy', label: '개인정보 침해' },
    { value: 'other', label: '기타' },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const reasonCode = formData.get('reason_code') as string
      const details = formData.get('details') as string

      const { error } = await supabase.from('reports').insert({
        target_type: targetType,
        target_id: targetId,
        reason_code: reasonCode,
        details: details.trim() || null,
        reported_by: user.id,
        status: 'open',
      })

      if (error) {
        console.error('Report submission error:', error)
        alert('신고 접수에 실패했습니다. 다시 시도해주세요.')
        return
      }

      setSubmitted(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Report submission error:', error)
      alert('신고 접수에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTargetLabel = () => {
    const labels = {
      post: '게시글',
      comment: '댓글',
      review: '리뷰',
    }
    return labels[targetType]
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {getTargetLabel()} 신고하기
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="text-green-600 mb-2">✓</div>
              <p className="text-sm text-gray-700">신고가 접수되었습니다.</p>
              <p className="text-xs text-gray-500 mt-1">
                관리자가 검토 후 적절한 조치를 취하겠습니다.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  신고 사유
                </label>
                <div className="space-y-2">
                  {reasonOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="reason_code"
                        value={option.value}
                        required
                        className="text-red-600"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  추가 설명 (선택사항)
                </label>
                <textarea
                  name="details"
                  placeholder="신고 사유에 대한 자세한 설명을 입력해주세요."
                  className="w-full border border-gray-300 rounded-md p-2 text-sm h-20 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">최대 500자</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-xs text-yellow-800">
                  허위 신고나 악의적인 신고는 제재 대상이 될 수 있습니다.
                  신중하게 신고해주세요.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '접수 중...' : '신고하기'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}