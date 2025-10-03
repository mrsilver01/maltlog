'use client'

import React from 'react'

// 기본 스켈레톤 컴포넌트
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-rose-200 via-rose-100 to-rose-200 bg-[length:200%_100%] rounded ${className}`}
      style={{
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    >
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}

// 위스키 카드 스켈레톤
export function WhiskyCardSkeleton() {
  return (
    <div className="bg-white rounded border border-gray-200 p-3">
      {/* 이미지 영역 */}
      <div className="h-40 mb-3 bg-gray-100 rounded flex items-center justify-center relative">
        <Skeleton className="w-16 h-32 rounded-sm" />
        {/* 추천해요 버튼 스켈레톤 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-300 py-1 px-2">
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* 위스키 이름 */}
      <Skeleton className="h-5 w-32 mb-2 mx-auto" />

      {/* 평점 */}
      <div className="flex items-center justify-center gap-1">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-4" />
        <Skeleton className="h-3 w-4" />
      </div>
    </div>
  )
}

// 헤더 스켈레톤
export function HeaderSkeleton() {
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-16" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-4 w-48 ml-4" />
      </div>

      <div className="flex items-center gap-6">
        <Skeleton className="h-6 w-16" />
        <div className="text-center">
          <Skeleton className="h-5 w-20 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-16 rounded-full" />
        <div className="flex flex-col gap-1">
          <Skeleton className="w-5 h-0.5" />
          <Skeleton className="w-5 h-0.5" />
          <Skeleton className="w-5 h-0.5" />
        </div>
      </div>
    </header>
  )
}

// 위스키 상세 페이지 스켈레톤
export function WhiskyDetailSkeleton() {
  return (
    <div className="min-h-screen bg-rose-50 p-6">
      <HeaderSkeleton />

      {/* 뒤로가기 버튼 */}
      <Skeleton className="mb-6 w-10 h-10" />

      <div className="flex gap-12">
        {/* 왼쪽: 위스키 이미지 */}
        <div className="flex-shrink-0">
          <div className="w-80 h-[600px] bg-white border border-gray-200 rounded-lg p-8 flex items-center justify-center">
            <Skeleton className="w-32 h-80" />
          </div>
        </div>

        {/* 오른쪽: 위스키 정보 */}
        <div className="flex-1">
          {/* 위스키 이름 */}
          <Skeleton className="h-12 w-64 mb-4" />

          {/* 안내 문구 */}
          <Skeleton className="h-4 w-48 mb-12 mx-auto" />

          {/* 위스키 상세 정보 */}
          <div className="grid grid-cols-2 gap-y-8 gap-x-16 mb-16">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-6 w-16 mr-4" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>

          {/* 평점 섹션 */}
          <div className="mb-12">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="flex items-center gap-8">
              {/* 별점 차트 */}
              <div className="flex-1">
                <div className="flex items-end gap-1 h-32">
                  {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} className={`w-8 h-${4 + i * 2}`} />
                  ))}
                </div>
                <Skeleton className="h-3 w-12 mt-2 mx-auto" />
              </div>

              {/* 평균 별점 */}
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="w-8 h-8" />
                  <Skeleton className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          {/* 노트 작성 버튼 */}
          <Skeleton className="h-12 w-40 mb-8 rounded-lg" />

          {/* 위스키 노트/리뷰 섹션 */}
          <div>
            <div className="flex items-center gap-8 mb-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-red-100 border border-gray-300 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <Skeleton className="h-4 w-20" />
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-6" />
                    </div>
                  </div>

                  <Skeleton className="h-16 w-full mb-4" />

                  <div className="flex items-center justify-between text-xs mb-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6" />
                      <Skeleton className="h-6 w-6" />
                    </div>
                    <Skeleton className="h-6 w-6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}