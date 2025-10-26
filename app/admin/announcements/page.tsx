import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAnnouncement, deleteAnnouncement } from './actions'

export default async function AnnouncementsPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data } = await supabase
    .from('announcements')
    .select('*')
    .order('start_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">공지사항 관리</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">공지 목록</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(data ?? []).map((row) => (
              <div key={row.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-900">{row.title}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      row.level === 'critical' ? 'bg-red-100 text-red-800' :
                      row.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {row.level}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                      {row.display}
                    </span>
                    {row.dismissible && (
                      <span className="text-xs text-green-600">닫기 허용</span>
                    )}
                  </div>
                  <form
                    action={async () => {
                      'use server'
                      await deleteAnnouncement(row.id)
                    }}
                  >
                    <button
                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                      type="submit"
                    >
                      삭제
                    </button>
                  </form>
                </div>
                <p className="text-sm text-gray-700 mb-2">{row.body}</p>
                <div className="text-xs text-gray-500">
                  <div>시작: {new Date(row.start_at).toLocaleString()}</div>
                  {row.end_at && (
                    <div>종료: {new Date(row.end_at).toLocaleString()}</div>
                  )}
                  <div>대상: {row.audience}</div>
                </div>
              </div>
            ))}
            {(data ?? []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                아직 공지사항이 없습니다.
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">새 공지 만들기</h2>
          <form action={createAnnouncement} className="space-y-4 bg-white border rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
              <input
                name="title"
                required
                placeholder="공지사항 제목"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">본문</label>
              <textarea
                name="body"
                required
                placeholder="공지사항 내용"
                className="w-full border border-gray-300 rounded-md p-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">중요도</label>
                <select name="level" className="w-full border border-gray-300 rounded-md p-2">
                  <option value="info">정보 (파란색)</option>
                  <option value="warning">주의 (노란색)</option>
                  <option value="critical">긴급 (빨간색)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">표시 방식</label>
                <select name="display" className="w-full border border-gray-300 rounded-md p-2">
                  <option value="banner">배너</option>
                  <option value="modal">모달</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">대상 사용자</label>
              <select name="audience" className="w-full border border-gray-300 rounded-md p-2">
                <option value="all">모든 사용자</option>
                <option value="auth">로그인 사용자</option>
                <option value="guest">미로그인 사용자</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
                <input
                  type="datetime-local"
                  name="start_at"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
                <input
                  type="datetime-local"
                  name="end_at"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="dismissible" defaultChecked />
              사용자가 닫기 버튼으로 해제할 수 있음
            </label>

            <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              type="submit"
            >
              공지사항 저장
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}