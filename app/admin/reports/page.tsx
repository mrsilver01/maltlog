import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { updateReportStatus } from './actions'

type Status = 'open' | 'triage' | 'resolved' | 'rejected'
type Reason = 'spam' | 'abuse' | 'minor' | 'illegal' | 'privacy' | 'other'

export default async function ReportsPage({ searchParams }: any) {
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

  const status = (searchParams?.status as Status) || 'open'
  const reason = (searchParams?.reason as Reason) || undefined

  let query = supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  query = query.eq('status', status)
  if (reason) query = query.eq('reason_code', reason)

  const { data, error } = await query

  if (error) {
    console.error('Reports query error:', error)
  }

  const getReasonLabel = (code: string) => {
    const labels = {
      spam: '스팸',
      abuse: '악용/괴롭힘',
      minor: '미성년자 부적절',
      illegal: '불법 내용',
      privacy: '개인정보 침해',
      other: '기타',
    }
    return labels[code as keyof typeof labels] || code
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      open: '대기',
      triage: '검토중',
      resolved: '처리완료',
      rejected: '반려',
    }
    return labels[status as keyof typeof labels] || status
  }

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-gray-100 text-gray-800',
      triage: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">신고 관리</h1>

      <div className="bg-white border rounded-lg p-4">
        <form className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <select
              name="status"
              defaultValue={status}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="open">대기</option>
              <option value="triage">검토중</option>
              <option value="resolved">처리완료</option>
              <option value="rejected">반려</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">신고 사유</label>
            <select
              name="reason"
              defaultValue={reason}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="">전체 사유</option>
              <option value="spam">스팸</option>
              <option value="abuse">악용/괴롭힘</option>
              <option value="minor">미성년자 부적절</option>
              <option value="illegal">불법 내용</option>
              <option value="privacy">개인정보 침해</option>
              <option value="other">기타</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            필터 적용
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {(data ?? []).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {status} 상태의 신고가 없습니다.
          </div>
        ) : (
          (data ?? []).map((report: any) => (
            <div key={report.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-900">
                    {report.target_type} #{report.target_id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                    {getReasonLabel(report.reason_code)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(report.status)}`}>
                    {getStatusLabel(report.status)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(report.created_at).toLocaleString()}
                </span>
              </div>

              {report.details && (
                <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-2 rounded">
                  {report.details}
                </p>
              )}

              {report.handled_note && (
                <p className="text-sm text-blue-700 mb-3 bg-blue-50 p-2 rounded">
                  처리 메모: {report.handled_note}
                </p>
              )}

              {report.status === 'open' && (
                <div className="flex gap-2">
                  {(['triage', 'resolved', 'rejected'] as const).map((newStatus) => (
                    <form
                      key={newStatus}
                      action={async () => {
                        'use server'
                        await updateReportStatus(report.id, newStatus)
                      }}
                    >
                      <button
                        className={`px-3 py-1 text-xs border rounded hover:bg-gray-50 ${
                          newStatus === 'resolved'
                            ? 'border-green-300 text-green-700'
                            : newStatus === 'rejected'
                            ? 'border-red-300 text-red-700'
                            : 'border-yellow-300 text-yellow-700'
                        }`}
                        type="submit"
                      >
                        {getStatusLabel(newStatus)}로 변경
                      </button>
                    </form>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}