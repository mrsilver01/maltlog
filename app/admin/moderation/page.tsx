import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { hardDelete, softHide } from './actions'

export default async function ModerationPage({ searchParams }: any) {
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

  const table = (searchParams?.table as 'posts' | 'comments' | 'reviews') || 'posts'
  const q = (searchParams?.q as string) || ''

  let query = supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  // 테이블별로 검색 필드를 다르게 설정
  if (q) {
    if (table === 'posts') {
      query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`)
    } else if (table === 'comments') {
      query = query.ilike('content', `%${q}%`)
    } else if (table === 'reviews') {
      query = query.or(`content.ilike.%${q}%,review_content.ilike.%${q}%`)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Moderation query error:', error)
  }

  const getTableLabel = (table: string) => {
    const labels = {
      posts: '게시글',
      comments: '댓글',
      reviews: '리뷰',
    }
    return labels[table as keyof typeof labels] || table
  }

  const getContent = (row: any, table: string) => {
    if (table === 'posts') {
      return row.title || row.content || '내용 없음'
    } else if (table === 'comments') {
      return row.content || '내용 없음'
    } else if (table === 'reviews') {
      return row.content || row.review_content || '내용 없음'
    }
    return '내용 없음'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">모더레이션</h1>

      <div className="bg-white border rounded-lg p-4">
        <form className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">테이블</label>
            <select
              name="table"
              defaultValue={table}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="posts">게시글</option>
              <option value="comments">댓글</option>
              <option value="reviews">리뷰</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">검색 키워드</label>
            <input
              name="q"
              defaultValue={q}
              placeholder="제목, 내용으로 검색..."
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            검색
          </button>
        </form>

        {q && (
          <div className="mt-2 text-sm text-gray-600">
            &quot;{q}&quot;로 {getTableLabel(table)} 검색 결과: {(data ?? []).length}건
          </div>
        )}
      </div>

      <div className="space-y-4">
        {(data ?? []).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {q ? '검색 결과가 없습니다.' : `${getTableLabel(table)}이 없습니다.`}
          </div>
        ) : (
          (data ?? []).map((row: any) => (
            <div key={row.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-blue-600">
                    {getTableLabel(table)} #{row.id}
                  </span>
                  {row.is_deleted && (
                    <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-800">
                      숨김 처리됨
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(row.created_at).toLocaleString()}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {getContent(row, table).substring(0, 200)}
                  {getContent(row, table).length > 200 && '...'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  작성자 ID: {row.user_id || row.author_id || '알 수 없음'}
                </div>

                <div className="flex gap-2">
                  <form
                    action={async () => {
                      'use server'
                      await softHide(table, row.id)
                    }}
                  >
                    <button
                      className="px-3 py-1 text-xs border border-yellow-300 text-yellow-700 rounded hover:bg-yellow-50"
                      type="submit"
                      disabled={row.is_deleted}
                    >
                      숨김(소프트)
                    </button>
                  </form>

                  <form
                    action={async () => {
                      'use server'
                      await hardDelete(table, row.id)
                    }}
                  >
                    <button
                      className="px-3 py-1 text-xs border border-red-300 text-red-700 rounded hover:bg-red-50"
                      type="submit"
                      onClick={(e) => {
                        if (!confirm('정말로 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                          e.preventDefault()
                        }
                      }}
                    >
                      하드 삭제
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {(data ?? []).length > 0 && (
        <div className="text-center text-sm text-gray-500 bg-yellow-50 p-3 rounded">
          ⚠️ 하드 삭제는 되돌릴 수 없습니다. 신중하게 사용하세요.
        </div>
      )}
    </div>
  )
}