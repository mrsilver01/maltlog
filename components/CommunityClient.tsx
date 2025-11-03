'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import type { CommunityPostWithProfile } from '@/lib/communityPosts';
import { likePost, unlikePost, checkMultiplePostsLiked, getPostLikesCount } from '@/lib/postActions';
import LoadingAnimation from '@/components/LoadingAnimation';
import AdminBadge from '@/components/AdminBadge';
import { ReportDialog } from '@/components/ReportDialog';
import { isAdmin } from '@/lib/isAdmin';
import toast from 'react-hot-toast';

interface CommunityClientProps {
  initialPosts: CommunityPostWithProfile[];
  initialSearch?: string;
  initialPage?: number;
  totalPages?: number;
  totalCount?: number;
}

export default function CommunityClient({
  initialPosts,
  initialSearch = '',
  initialPage = 1,
  totalPages = 1,
  totalCount = 0
}: CommunityClientProps) {
  const router = useRouter();
  const { user, profile, signOut, loading: authLoading } = useAuth();

  // 서버로부터 받은 초기 데이터를 state로 설정
  const [posts, setPosts] = useState<CommunityPostWithProfile[]>(initialPosts);

  // 검색 및 페이지네이션 상태
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [searchInput, setSearchInput] = useState<string>(initialSearch);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // 좋아요 상태 관리
  const [postLikes, setPostLikes] = useState<{ [key: string]: { isLiked: boolean; count: number } }>({});
  const [likesLoading, setLikesLoading] = useState<boolean>(true);

  // 신고 관련 상태
  const [reportDialog, setReportDialog] = useState<{ isOpen: boolean; targetType: 'post' | 'comment' | 'review'; targetId: string }>({ isOpen: false, targetType: 'post', targetId: '' });

  // 페이지 로드 시 좋아요 상태 초기화
  useEffect(() => {
    const initializeLikes = async () => {
      if (!user || posts.length === 0) {
        setLikesLoading(false);
        return;
      }

      try {
        const postIds = posts.map(post => post.id!).filter(id => id);

        // 좋아요 상태와 개수를 병렬로 가져오기
        const [likeStates, likeCounts] = await Promise.all([
          checkMultiplePostsLiked(postIds, user.id),
          Promise.all(postIds.map(async (postId) => ({
            postId,
            count: await getPostLikesCount(postId)
          })))
        ]);

        // 상태 초기화
        const initialLikes: { [key: string]: { isLiked: boolean; count: number } } = {};
        postIds.forEach(postId => {
          const countData = likeCounts.find(item => item.postId === postId);
          initialLikes[postId] = {
            isLiked: likeStates[postId] || false,
            count: countData?.count || 0
          };
        });

        setPostLikes(initialLikes);
      } catch (error) {
        console.error('좋아요 상태 초기화 실패:', error);
      } finally {
        setLikesLoading(false);
      }
    };

    initializeLikes();
  }, [user, posts]);

  // 좋아요 처리 함수 (옵티미스틱 업데이트)
  const handlePostLike = useCallback(async (postId: string) => {
    if (!user) {
      toast('로그인이 필요합니다.');
      return;
    }

    const currentState = postLikes[postId];
    if (!currentState) return;

    const newIsLiked = !currentState.isLiked;
    const newCount = newIsLiked ? currentState.count + 1 : currentState.count - 1;

    // 옵티미스틱 업데이트 (즉시 UI 변경)
    setPostLikes(prev => ({
      ...prev,
      [postId]: {
        isLiked: newIsLiked,
        count: Math.max(0, newCount) // 음수 방지
      }
    }));

    try {
      // 서버 상태 업데이트
      const success = newIsLiked
        ? await likePost(postId, user.id)
        : await unlikePost(postId, user.id);

      if (!success) {
        // 실패 시 롤백
        setPostLikes(prev => ({
          ...prev,
          [postId]: currentState
        }));
        toast.error('좋아요 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('좋아요 처리 오류:', error);
      // 에러 시 롤백
      setPostLikes(prev => ({
        ...prev,
        [postId]: currentState
      }));
      toast.error('좋아요 처리 중 오류가 발생했습니다.');
    }
  }, [user, postLikes]);

  // 검색 처리 함수
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchInput.trim();

    if (trimmedQuery.length >= 2 || trimmedQuery === '') {
      setIsSearching(true);

      // URL 업데이트
      const params = new URLSearchParams();
      if (trimmedQuery) {
        params.set('search', trimmedQuery);
      }
      params.set('page', '1');

      router.push(`/community?${params.toString()}`);
    } else if (trimmedQuery.length > 0) {
      toast.error('검색어는 2글자 이상 입력해주세요.');
    }
  }, [searchInput, router]);

  // 페이지 변경 처리 함수
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setIsSearching(true);

      // URL 업데이트
      const params = new URLSearchParams();
      if (searchQuery) {
        params.set('search', searchQuery);
      }
      params.set('page', newPage.toString());

      router.push(`/community?${params.toString()}`);
    }
  }, [searchQuery, totalPages, router]);

  // 새로운 데이터가 로드되면 검색 상태 리셋
  useEffect(() => {
    setIsSearching(false);
    setSearchQuery(initialSearch);
    setSearchInput(initialSearch);
    setCurrentPage(initialPage);
  }, [initialSearch, initialPage, initialPosts]);

  // 클라이언트 사이드 로딩은 이제 필요 없으므로, authLoading만 확인
  if (authLoading) {
    return <LoadingAnimation />;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('로그아웃되었습니다.');
      router.push('/');
    } catch (error: unknown) {
      toast.error('로그아웃 오류: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 p-3 sm:p-6">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors"
              title="메인으로 돌아가기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 sm:w-5 h-4 sm:h-5 text-amber-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div className="w-8 sm:w-12 h-12 sm:h-16 flex items-center justify-center">
              <img
                src="/LOGO.png"
                alt="Maltlog Logo"
                className="w-8 sm:w-12 h-8 sm:h-12 object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-800 font-[family-name:var(--font-jolly-lodger)]">Maltlog</h1>
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-700 ml-1 sm:ml-2 font-[family-name:var(--font-jolly-lodger)]">Community</span>
          </div>
          <div className="flex gap-2 sm:gap-4">
            {user ? (
              <>
                <span className="text-xs sm:text-sm text-gray-600">안녕하세요, {profile?.nickname || user.email}님!</span>
                <button
                  onClick={handleLogout}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-800"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="bg-amber-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-amber-700 text-sm"
              >
                로그인
              </button>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* 검색 UI */}
          <div className="mb-6 sm:mb-8">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="제목 또는 내용으로 검색... (2글자 이상)"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none text-sm sm:text-base"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="bg-purple-700 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-purple-800 disabled:opacity-50 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-3 sm:h-4 w-3 sm:w-4 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">검색중...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 sm:w-4 h-3 sm:h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    검색
                  </>
                )}
              </button>
            </form>

            {/* 검색 결과 정보 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs sm:text-sm text-gray-600 mb-4 gap-2 sm:gap-0">
              <div>
                {searchQuery ? (
                  <span>검색어 "{searchQuery}" 결과: 총 {totalCount}개</span>
                ) : (
                  <span>전체 게시글: {totalCount}개</span>
                )}
              </div>
              {totalPages > 1 && (
                <span>{currentPage} / {totalPages} 페이지</span>
              )}
            </div>
          </div>

          {user && (
            <div className="mb-6 sm:mb-8">
              <button
                onClick={() => router.push('/community/new')}
                className="bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-purple-800 font-medium text-sm sm:text-base w-full sm:w-auto"
              >
                새 게시글 작성
              </button>
            </div>
          )}

          {posts.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/community/post/${post.id}`)}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    {post.image_url && (
                      <div className="w-full sm:w-20 md:w-24 h-20 sm:h-20 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={post.image_url}
                          alt="게시글 이미지"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 w-full">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex-1 leading-tight">{post.title}</h3>
                        {user && post.user_id !== user.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReportDialog({ isOpen: true, targetType: 'post', targetId: post.id! });
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors ml-2 flex-shrink-0"
                            title="신고하기"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 sm:w-5 h-4 sm:h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 gap-3 sm:gap-0">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {post.authorImage ? (
                            <img
                              src={post.authorImage}
                              alt={post.author}
                              className="w-6 sm:w-8 h-6 sm:h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                              {(post.author || ' ').charAt(0)}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm">{post.author}</span>
                              {post.profiles && isAdmin(post.profiles) && <AdminBadge />}
                            </div>
                            <span className="text-xs">{formatDate(post.created_at)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 text-gray-500">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // 카드 클릭 이벤트 방지
                              handlePostLike(post.id!);
                            }}
                            className="flex items-center gap-1.5 group"
                            disabled={likesLoading}
                          >
                            {/* 채워진 하트 (좋아요 누른 상태) */}
                            {postLikes[post.id!]?.isLiked ? (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 sm:w-5 h-4 sm:h-5 text-red-500">
                                <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                              </svg>
                            ) : (
                              /* 텅 빈 하트 (기본 상태) */
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 sm:w-5 h-4 sm:h-5 group-hover:text-red-500 transition-colors">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                              </svg>
                            )}
                            <span className="text-xs sm:text-sm font-medium">{postLikes[post.id!]?.count ?? 0}</span>
                          </button>

                          {/* 댓글 아이콘 */}
                          <div className="flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 sm:w-5 h-4 sm:h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium">{post.comments_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <h3 className="text-lg text-gray-500">아직 게시글이 없습니다.</h3>
              <p className="text-sm text-gray-400 mt-2">첫 번째 게시글을 작성해보세요!</p>
            </div>
          )}

          {/* 페이지네이션 UI */}
          {totalPages > 1 && (
            <div className="mt-6 sm:mt-8 flex justify-center">
              <nav className="flex items-center gap-1 sm:gap-2">
                {/* 이전 페이지 버튼 */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs sm:text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 sm:w-4 h-3 sm:h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                  <span className="hidden sm:inline">이전</span>
                </button>

                {/* 페이지 번호들 */}
                {Array.from({ length: Math.min(totalPages <= 3 ? totalPages : 3, totalPages) }, (_, index) => {
                  let pageNum;
                  if (totalPages <= 3) {
                    pageNum = index + 1;
                  } else if (currentPage <= 2) {
                    pageNum = index + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - 2 + index;
                  } else {
                    pageNum = currentPage - 1 + index;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm ${
                        currentPage === pageNum
                          ? 'bg-purple-700 text-white border-purple-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* 다음 페이지 버튼 */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">다음</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 sm:w-4 h-3 sm:h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* 신고 다이얼로그 */}
      {reportDialog.isOpen && (
        <ReportDialog
          targetType={reportDialog.targetType}
          targetId={reportDialog.targetId}
          onClose={() => setReportDialog({ isOpen: false, targetType: 'post', targetId: '' })}
        />
      )}
    </div>
  );
}