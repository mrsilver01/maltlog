// components/WhiskyCard.tsx - Next.js Image 컴포넌트 적용 예시
import Image from 'next/image'
import { useState } from 'react'

interface WhiskyData {
  id: string
  name: string
  image: string
  abv?: number
  region?: string
  price?: number
  avg_rating?: number
  likes?: number
}

interface WhiskyCardProps {
  whisky: WhiskyData
  onClick?: (whisky: WhiskyData) => void
}

export default function WhiskyCard({ whisky, onClick }: WhiskyCardProps) {
  const [imageError, setImageError] = useState(false)

  // Supabase Storage URL인지 확인
  const isSupabaseImage = whisky.image && whisky.image.includes('supabase.co')

  // 기본 이미지 경로
  const fallbackImage = '/whiskies/no.pic whisky.png'

  // 이미지 소스 결정
  const imageSrc = imageError ? fallbackImage : (isSupabaseImage ? whisky.image : `/whiskies/${whisky.image}`)

  return (
    <div
      className="bg-white rounded border border-gray-200 p-2 sm:p-3 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      onClick={() => onClick?.(whisky)}
    >
      {/* 위스키 이미지 - Next.js Image 컴포넌트 적용 */}
      <div className="h-32 sm:h-40 mb-2 sm:mb-3 bg-gray-100 rounded flex items-center justify-center relative overflow-hidden">
        <Image
          src={imageSrc}
          alt={whisky.name}
          width={160}  // 적절한 최대 가로 크기
          height={160} // 적절한 최대 세로 크기
          className="object-contain"
          priority={false} // 위스키 이미지는 lazy loading 적용
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyeAPrNfFWjVIzDAhkq+bvCovh2n1Ew8W/EJC0VHcOVRclYjUAKn3gUn6htCqX5VYCJlwCaQSMo30+ACc8BJ6ZBOeSaQYH2oJLG7bPmhRF2dwqvhqBVHjQKttvO9l4AhJsKoMDFJnCx9u4jOJ4CxU5BNXL+YnmlFVOi2gOJ8/8A/9k="
          sizes="(max-width: 640px) 128px, 160px"
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
      </div>

      {/* 위스키 정보 */}
      <div className="space-y-1">
        <h3 className="font-medium text-gray-800 text-xs sm:text-sm line-clamp-2 min-h-[2.5rem]">
          {whisky.name}
        </h3>

        {/* 부가 정보 */}
        <div className="text-xs text-gray-600 space-y-1">
          {whisky.region && (
            <div className="font-medium text-amber-700">{whisky.region}</div>
          )}

          {whisky.abv && (
            <div>ABV: {whisky.abv}%</div>
          )}

          {whisky.avg_rating && (
            <div className="flex items-center justify-center gap-1">
              <span className="text-yellow-500">★</span>
              <span>{whisky.avg_rating.toFixed(1)}</span>
            </div>
          )}

          {whisky.price && (
            <div className="text-green-600 font-medium">
              ₩{whisky.price.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}