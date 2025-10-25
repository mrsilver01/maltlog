// components/SkeletonUI.tsx - 스켈레톤 UI 컴포넌트들
import React from 'react'

// 기본 스켈레톤 요소
export function SkeletonBox({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-gray-200 animate-pulse rounded ${className}`}
      {...props}
    />
  )
}

// 원형 스켈레톤 (프로필 이미지 등)
export function SkeletonCircle({ size = 'w-8 h-8', className = '' }: { size?: string, className?: string }) {
  return (
    <div className={`${size} bg-gray-200 animate-pulse rounded-full ${className}`} />
  )
}

// 텍스트 라인 스켈레톤
export function SkeletonText({ lines = 1, className = '' }: { lines?: number, className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 animate-pulse rounded ${
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  )
}

// 위스키 카드 스켈레톤
export function WhiskyCardSkeleton() {
  return (
    <div className="bg-white rounded border border-gray-200 p-2 sm:p-3 text-center">
      {/* 이미지 영역 스켈레톤 */}
      <div className="h-32 sm:h-40 mb-2 sm:mb-3 bg-gray-200 animate-pulse rounded flex items-center justify-center relative">
        <div className="w-20 h-32 bg-gray-300 animate-pulse rounded"></div>

        {/* 찜 버튼 스켈레톤 */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-300 animate-pulse flex items-center justify-between px-2">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-400 animate-pulse rounded"></div>
            <div className="w-6 h-3 bg-gray-400 animate-pulse rounded"></div>
          </div>
          <div className="w-4 h-3 bg-gray-400 animate-pulse rounded"></div>
        </div>
      </div>

      {/* 위스키 이름 스켈레톤 */}
      <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>

      {/* 별점 스켈레톤 */}
      <div className="flex items-center justify-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-3 h-3 bg-gray-200 animate-pulse rounded"></div>
        ))}
        <div className="w-6 h-3 bg-gray-200 animate-pulse rounded ml-1"></div>
      </div>
    </div>
  )
}

// 커뮤니티 게시글 스켈레톤
export function CommunityPostSkeleton() {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      {/* 제목 스켈레톤 */}
      <div className="h-5 bg-gray-200 animate-pulse rounded mb-3"></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 프로필 이미지 스켈레톤 */}
          <SkeletonCircle size="w-6 h-6" />
          {/* 작성자명 스켈레톤 */}
          <div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div>
          {/* 날짜 스켈레톤 */}
          <div className="w-12 h-4 bg-gray-200 animate-pulse rounded"></div>
        </div>

        <div className="flex items-center gap-3">
          {/* 좋아요 스켈레톤 */}
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-4 h-4 bg-gray-200 animate-pulse rounded"></div>
          </div>
          {/* 댓글 스켈레톤 */}
          <div className="w-8 h-4 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    </div>
  )
}

// 커뮤니티 프리뷰 섹션 스켈레톤
export function CommunityPreviewSkeleton() {
  return (
    <div className="bg-red-100 border border-gray-400 p-6 rounded-lg">
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CommunityPostSkeleton key={i} />
        ))}

        {/* 더보기 버튼 스켈레톤 */}
        <div className="text-center pt-2">
          <div className="w-32 h-5 bg-gray-200 animate-pulse rounded mx-auto"></div>
        </div>
      </div>
    </div>
  )
}

// 검색바 스켈레톤
export function SearchBarSkeleton() {
  return (
    <div className="relative mb-6 sm:mb-8">
      <div className="h-12 bg-gray-200 animate-pulse rounded-lg border border-gray-300"></div>
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <div className="w-5 h-5 bg-gray-300 animate-pulse rounded"></div>
      </div>
    </div>
  )
}

// 메인페이지 전체 스켈레톤
export function MainPageSkeleton() {
  return (
    <div className="min-h-screen bg-red-50">
      {/* 헤더 스켈레톤 */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* 로고 영역 스켈레톤 */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-24 h-8 bg-gray-200 animate-pulse rounded"></div>
          </div>

          {/* 네비게이션 스켈레톤 */}
          <div className="flex items-center gap-6">
            <div className="w-16 h-6 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-20 h-6 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-18 h-6 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* 메인 콘텐츠 영역 */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">

            {/* 제목 스켈레톤 */}
            <div className="text-center lg:text-left space-y-4">
              <div className="w-48 h-10 bg-gray-200 animate-pulse rounded mx-auto lg:mx-0"></div>
              <div className="w-64 h-5 bg-gray-200 animate-pulse rounded mx-auto lg:mx-0"></div>
            </div>

            {/* 검색바 스켈레톤 */}
            <SearchBarSkeleton />

            {/* 위스키 그리드 스켈레톤 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <WhiskyCardSkeleton key={i} />
              ))}
            </div>

            {/* 더보기 버튼 스켈레톤 */}
            <div className="text-center">
              <div className="w-24 h-10 bg-gray-200 animate-pulse rounded mx-auto"></div>
            </div>
          </div>

          {/* 사이드바 영역 */}
          <div className="space-y-6 sm:space-y-8">
            {/* 커뮤니티 프리뷰 스켈레톤 */}
            <div className="space-y-4">
              <div className="w-32 h-6 bg-gray-200 animate-pulse rounded"></div>
              <CommunityPreviewSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}