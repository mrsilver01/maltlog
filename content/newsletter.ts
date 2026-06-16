/**
 * 몰트로그 신문 (홈 우측 신문 끈 → 펼침) 콘텐츠
 *
 * 새 호를 낼 때 이 파일만 수정하면 됩니다.
 * - spotlight.whiskyId : /whisky/<id> 링크로 연결되는 슬러그
 * - spotlight.image    : Storage whiskies 버킷의 파일명 (예: "glendronach-12.png")
 * - briefs             : 단신 뉴스 목록 (위에서부터 순서대로 표시)
 */

export interface NewsBrief {
  title: string
  body: string
  date?: string
}

export interface NewsletterContent {
  issueNo: number
  dateLabel: string
  spotlight: {
    whiskyId: string
    name: string
    image: string
    tagline: string
    body: string
  }
  briefs: NewsBrief[]
  editorsNote?: string
}

export const newsletter: NewsletterContent = {
  issueNo: 1,
  dateLabel: '2026년 6월 둘째 주',
  spotlight: {
    whiskyId: 'glendronach-12',
    name: '글렌드로낙 12년',
    image: 'glendronach-12.png',
    tagline: '셰리 입문의 정석',
    body: 'PX와 올로로소 셰리 캐스크에서 12년. 건포도와 다크 초콜릿, 은은한 오크 스파이스가 균형을 이루는 하이랜드의 클래식. 셰리 위스키가 처음이라면 여기서 시작해도 좋습니다.',
  },
  briefs: [
    {
      title: '몰트로그 신문 창간',
      body: '매주 위스키 한 병을 조명하고, 새로 들어온 소식을 짧게 전합니다. 추천하고 싶은 위스키가 있다면 인스타그램 @malt.log로 제보해주세요.',
      date: '6월',
    },
    {
      title: '취향 분석 기능 오픈',
      body: '프로필에서 내 별점 분포와 지역별 선호를 한눈에 볼 수 있습니다. 시음 노트를 남길수록 분석이 깊어집니다.',
      date: '6월',
    },
  ],
  editorsNote: '한 주에 한 잔, 천천히. — 몰트로그',
}
