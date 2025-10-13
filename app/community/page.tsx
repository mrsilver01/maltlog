import { getAllCommunityPosts, CommunityPostWithProfile } from '@/lib/communityPosts'
import CommunityClient from '@/components/CommunityClient'

export default async function CommunityPage() {
  // 서버에서 게시글 데이터를 미리 가져온다.
  const initialPosts = await getAllCommunityPosts();

  // 클라이언트 컴포넌트에 초기 데이터를 props로 전달한다.
  return <CommunityClient initialPosts={initialPosts} />
}