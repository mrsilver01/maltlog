import { getCommunityPosts, getPostsCount } from '@/lib/communityPosts'
import CommunityClient from '@/components/CommunityClient'
import { noStore } from 'next/cache'

// 라우트 캐시 해제 (Next 14/15)
export const dynamic = 'force-dynamic'
// ISR/정적 재검증 비활성
export const revalidate = 0

interface CommunityPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  // RSC 단에서 캐시 힌트 제거
  noStore()
  // URL 파라미터에서 검색어와 페이지 추출 (Next.js 15 requires await)
  const params = await searchParams
  const searchQuery = typeof params.search === 'string' ? params.search : ''
  const page = typeof params.page === 'string' ? Math.max(0, parseInt(params.page) - 1) : 0

  // 게시글 데이터와 전체 개수를 병렬로 가져오기
  const [posts, totalCount] = await Promise.all([
    getCommunityPosts(page, 4, searchQuery),
    getPostsCount(searchQuery)
  ])

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalCount / 4)

  return (
    <CommunityClient
      initialPosts={posts}
      initialSearch={searchQuery}
      initialPage={page + 1}
      totalPages={totalPages}
      totalCount={totalCount}
    />
  )
}