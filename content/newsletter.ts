/**
 * 몰트로그 신문 (홈 우측 신문 끈 → 펼침) 콘텐츠
 *
 * 새 호를 낼 때 이 파일만 수정하면 됩니다.
 *
 * 이미지 경로 규칙 (image 필드):
 *   - "/newsletter/xxx.jpg"  → public/newsletter/ 에 둔 정적 이미지 (신문 전용 사진 권장)
 *   - "xxx.png"              → Supabase Storage whiskies 버킷의 파일명
 *   - "https://..."          → 외부 URL 그대로
 */

export interface NewsFact {
  label: string
  value: string
}

/** 1면 톱 기사 (사진 + 헤드라인 + 본문 + 팩트) */
export interface LeadStory {
  kicker: string        // 카테고리/말머리 (예: "신규 출시 · 내셔널 버번 데이")
  headline: string
  dek: string           // 부제 한 줄
  image: string
  imageCaption?: string // 사진 아래 캡션
  body: string
  facts: NewsFact[]
  tasting?: string      // 테이스팅 노트 한 줄
  link?: string         // 있으면 "자세히" 버튼 (내부 /whisky/... 또는 외부 URL)
}

/** DB에 있는 위스키 한 잔 추천 (클릭 시 상세로 이동) */
export interface Spotlight {
  whiskyId: string
  name: string
  image: string
  tagline: string
  body: string
}

export interface NewsBrief {
  title: string
  body: string
  date?: string
}

export interface NewsletterContent {
  issueNo: number
  dateLabel: string
  lead: LeadStory
  spotlight?: Spotlight
  briefs: NewsBrief[]
  editorsNote?: string
}

export const newsletter: NewsletterContent = {
  issueNo: 1,
  dateLabel: '2026년 6월 14일 · 내셔널 버번 데이',
  lead: {
    kicker: '신규 출시 · 내셔널 버번 데이',
    headline: '엘라이자 크레이그 21년 싱글 배럴, 13년 만의 복귀',
    dek: '2013년 이후 처음 나오는 21년산. 헤븐 힐이 바즈타운 증류소에서 첫 공개합니다.',
    image: '/newsletter/elijah-craig-21.jpg',
    imageCaption: '엘라이자 크레이그 21년 싱글 배럴 — 우드 박스 한정 패키지',
    body: '6월 14일 내셔널 버번 데이에 맞춰 헤븐 힐 바즈타운 증류소에서 베일을 벗었습니다. 2013년 이후 처음 선보이는 21년산이라 출시 전부터 화제가 컸던 물건으로, 루이빌 번하임 증류소에서 21년을 채운 현재 엘라이자 크레이그 라인업 중 최고 에이지 스테이트먼트입니다.',
    facts: [
      { label: '도수', value: '94 proof (47% ABV)' },
      { label: '가격', value: 'MSRP $299.99' },
      { label: '한정 수량', value: '1,789병' },
      { label: '숙성', value: '번하임 증류소 21년' },
    ],
    tasting: '밀크 초콜릿 · 토스트 넛 · 번트 캐러멜 · 가죽 · 후추',
  },
  spotlight: {
    whiskyId: 'glendronach-12',
    name: '글렌드로낙 12년',
    image: 'glendronach-12.png',
    tagline: '셰리 입문의 정석',
    body: 'PX와 올로로소 셰리 캐스크에서 12년. 건포도와 다크 초콜릿, 은은한 오크 스파이스가 균형을 이루는 하이랜드의 클래식.',
  },
  briefs: [
    {
      title: '몰트로그 신문 창간',
      body: '매주 위스키 한 병을 조명하고, 새로 들어온 소식을 짧게 전합니다. 다루고 싶은 소식이 있다면 인스타그램 @malt.log로 제보해주세요.',
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
