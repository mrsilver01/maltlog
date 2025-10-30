/**
 * 찜 수를 포맷팅하는 함수
 * 50개 이하: 실제 숫자 표시
 * 50개 초과: "50+" 표시
 */
export function formatLikeCount(count: number): string {
  if (count <= 50) {
    return count.toString()
  }
  return '50+'
}