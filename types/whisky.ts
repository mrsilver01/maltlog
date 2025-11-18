/**
 * 위스키 통계 포함 통합 타입
 * 홈, 카드, 프로필, 리스트 모든 곳에서 사용
 */
export type WhiskyWithStats = {
  /** 정렬/커서용 고유 번호 */
  oid: number
  /** 위스키 고유 ID */
  id: string
  /** 위스키 영문명 */
  name: string
  /** 위스키 한글명 */
  name_ko: string | null
  /** 위스키 이미지 URL */
  image: string | null

  // 실제 DB 필드들
  /** 도수 */
  abv: number | null
  /** 가격 */
  price: number | null
  /** 캐스크 */
  cask: string | null
  /** 지역 */
  region: string | null
  /** 증류소 */
  distillery: string | null
  /** 추천 여부 */
  is_featured: boolean
  /** 정렬 순서 */
  display_order: number

  // 통계 필드
  /** 평균 평점 */
  avg_rating: number
  /** 리뷰 개수 */
  reviews_count: number
  /** 좋아요 개수 */
  likes_count: number

  // 기존 필드명 호환성을 위한 별칭들
  /** 평균 평점 (호환성) */
  avgRating?: number
  /** 리뷰 개수 (호환성) */
  totalReviews?: number
  /** 좋아요 개수 (호환성) */
  likes?: number

  // 선택적 타임스탬프
  created_at?: string
  updated_at?: string
}

/**
 * 위스키 목록 API 응답 타입
 */
export type WhiskyListResponse = {
  /** 위스키 목록 */
  items: WhiskyWithStats[]
  /** 다음 페이지 커서 (없으면 null) */
  nextCursor: number | null
}

/**
 * 프로필 기본 정보 타입
 */
export type Profile = {
  /** 사용자 ID */
  id: string
  /** 사용자 핸들(@handle) */
  handle: string
  /** 표시 이름 */
  display_name: string
  /** 아바타 URL */
  avatar_url: string | null
  /** 한 줄 소개 */
  bio: string | null
  /** 가입일 */
  created_at: string
  /** 통계 정보 */
  stats: {
    /** 작성한 리뷰 수 */
    reviews_count: number
    /** 받은 좋아요 수 */
    likes_received: number
    /** 내 평균 평점 */
    my_avg_rating: number
  }
}

/**
 * 프로필 페이지 리뷰 타입
 */
export type ProfileReview = {
  /** 리뷰 ID */
  id: string
  /** 평점 */
  rating: number
  /** 노트 내용 */
  note: string
  /** 작성일 */
  created_at: string
  /** 연관된 위스키 정보 */
  whisky: {
    /** 위스키 ID */
    id: string
    /** 한글명 */
    name_ko: string | null
    /** 이미지 URL */
    image: string | null
  }
}

/**
 * 프로필 API 응답 타입
 */
export type ProfileResponse = {
  /** 프로필 기본 정보 */
  profile: Profile
  /** 최근 리뷰 목록 */
  reviews: ProfileReview[]
  /** 다음 페이지 커서 */
  nextCursor: string | null
}

/**
 * 새로운 프로필 요약 타입
 */
export type ProfileSummary = {
  /** 사용자 ID */
  user_id: string
  /** 사용자 핸들 */
  handle: string
  /** 표시 이름 */
  display_name: string | null
  /** 아바타 URL */
  avatar_url: string | null
  /** 좌측 카드에 쓰일 값들 */
  notes_count: number
  /** 게시글 수 */
  posts_count: number
  /** 내 리뷰가 받은 총 좋아요 수 */
  likes_received: number
  /** 내가 준 별점 평균 (소수 2자리) */
  my_avg_rating: number
}

/**
 * 새로운 프로필 리뷰 타입 (우측 리스트용)
 */
export type NewProfileReview = {
  /** 리뷰 ID */
  review_id: string
  /** 이 값을 별로 렌더 (평균 X) */
  rating: number
  /** 노트 내용 */
  note: string | null
  /** 작성일 */
  created_at: string
  /** 연관된 위스키 정보 */
  whisky: {
    id: string
    name: string
    name_ko: string | null
    /** 원본 경로; API에서 풀 URL로 변환 권장 */
    image: string | null
  }
}

/**
 * 프로필 리뷰 응답 타입
 */
export type ProfileReviewsResponse = {
  /** 리뷰 목록 */
  items: NewProfileReview[]
  /** 다음 커서 */
  nextCursor: { createdAt: string, id: string } | null
}

/**
 * 첫 리뷰한 위스키 타입
 */
export type FirstReviewedItem = {
  /** 위스키 ID */
  whisky_id: string
  /** 첫 리뷰 작성일 */
  first_reviewed_at: string
  /** 위스키 이름 */
  name: string
  /** 위스키 한글명 */
  name_ko: string | null
  /** API에서 toPublicImageUrl 적용하여 string 보장 */
  image: string | null
}

/**
 * 첫 리뷰한 위스키 응답 타입
 */
export type FirstReviewedResponse = {
  /** 최대 3개 */
  items: FirstReviewedItem[]
}