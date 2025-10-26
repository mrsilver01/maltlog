export default function AdminHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">관리자 대시보드</h1>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">관리 기능</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>좌측/상단 네비게이션으로 공지·신고·모더레이션에 진입하세요.</li>
          <li>본 페이지는 추후 통계/요약 카드로 대체 예정.</li>
          <li>관리자 권한으로 시스템을 안전하게 관리할 수 있습니다.</li>
        </ul>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800">공지사항 관리</h3>
          <p className="text-sm text-blue-600 mt-1">배너 및 모달 공지를 생성하고 관리합니다.</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800">신고 관리</h3>
          <p className="text-sm text-yellow-600 mt-1">사용자 신고를 검토하고 처리합니다.</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800">모더레이션</h3>
          <p className="text-sm text-red-600 mt-1">게시물과 댓글을 검토하고 관리합니다.</p>
        </div>
      </div>
    </div>
  )
}