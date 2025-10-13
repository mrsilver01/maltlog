import ProfilePageClient from '@/components/ProfilePageClient'

export default function ProfilePage() {
  // 빈 초기 데이터로 ProfilePageClient를 렌더링
  const initialReviews: any[] = []
  const initialWhiskies: any[] = []
  const initialStats = {
    reviewCount: 0,
    noteCount: 0,
    wishlistCount: 0
  }

  return (
    <ProfilePageClient
      initialReviews={initialReviews}
      initialWhiskies={initialWhiskies}
      initialStats={initialStats}
    />
  )
}