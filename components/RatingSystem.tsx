'use client'

// 이 컴포넌트는 이제 'useAuth'나 Supabase를 직접 호출하지 않습니다.
// 오직 화면을 그리는 역할만 담당합니다.

// 이 컴포넌트가 어떤 정보를 받아야 하는지 정의하는 '설계도'입니다.
export interface RatingSystemProps {
  currentRating: number;
  onRatingChange?: (newRating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function RatingSystem({
  currentRating = 0,
  onRatingChange,
  readOnly = false,
  size = 'md',
}: RatingSystemProps) {

  const handleStarClick = (newRating: number) => {
    // onRatingChange 함수가 전달된 경우에만 (즉, 수정 가능할 때만) 실행됩니다.
    if (!readOnly && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  // 사이즈에 따른 별 크기 클래스를 정의합니다.
  const starSizeClass = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          disabled={readOnly}
          className={`
            transition-colors duration-200 
            ${starSizeClass}
            ${currentRating >= star ? 'text-amber-500' : 'text-gray-300'}
            ${!readOnly ? 'hover:text-amber-400 hover:scale-110 transform' : 'cursor-default'}
          `}
        >
          ★
        </button>
      ))}
    </div>
  );
}

