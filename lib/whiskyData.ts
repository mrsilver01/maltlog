// 위스키 데이터 타입 정의
export interface WhiskyData {
  id: string
  name: string
  image: string
  abv: string
  region: string
  price: string
  cask: string
  avgRating: number
  totalReviews: number
  likes: number
}

export interface Comment {
  id: string
  user: string
  content: string
  createdAt: string
  replies: Comment[]
}

export interface Review {
  id: string
  user: string
  rating: number
  comment: string
  likes: number
  comments: Comment[]
  createdAt: string
}

// 위스키 데이터 저장소 (이미지가 있는 위스키 우선 정렬)
export const whiskeyDatabase: Record<string, WhiskyData> = {
  // 유행 위스키 (이미지 있음)
  'glengrant-arboralis': {
    id: 'glengrant-arboralis',
    name: '글렌그란트 아보랄리스',
    image: '/whiskies/Glengrant.a.png',
    abv: '56.0%',
    region: '스코틀랜드',
    price: '3-4만원',
    cask: '버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'bowmore-18': {
    id: 'bowmore-18',
    name: '보모어 18년 딥앤컴플렉스',
    image: '/whiskies/보모어 18년 딥앤컴플렉스.png',
    abv: '43.0%',
    region: '스코틀랜드 (아일라)',
    price: '17-20만원',
    cask: 'ex-버번 & 셰리 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'kavalan-solist-vinho': {
    id: 'kavalan-solist-vinho',
    name: '카발란 솔리스트 비노바리끄',
    image: '/whiskies/카발란 솔리스트 비노바리끄.png',
    abv: '58.6%',
    region: '대만',
    price: '28-32만원',
    cask: '아메리칸 오크 와인 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'wild-turkey-rare-breed': {
    id: 'wild-turkey-rare-breed',
    name: '와일드 터키 레어브리드',
    image: '/whiskies/와일드 터키 레어브리드.png',
    abv: '51.1%',
    region: '미국 (켄터키)',
    price: '5-7만원',
    cask: '프리미엄 셀렉션',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  // 이미지가 있는 기타 위스키들
  'macallan-12': {
    id: 'macallan-12',
    name: '맥켈란 12년 셰리',
    image: '/whiskies/맥켈란 12년.png',
    abv: '40.0%',
    region: '스코틀랜드',
    price: '12-14만원',
    cask: '셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'lagavulin-16': {
    id: 'lagavulin-16',
    name: '라가불린 16년',
    image: '/whiskies/라가불린 16년.png',
    abv: '43.0%',
    region: '스코틀랜드 (아일라)',
    price: '12-15만원',
    cask: 'ex-버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'springbank-10': {
    id: 'springbank-10',
    name: '스프링뱅크 10년',
    image: '/whiskies/스프링뱅크 10년.png',
    abv: '46.0%',
    region: '스코틀랜드 (캠벨타운)',
    price: '12만원 내외',
    cask: 'ex-버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'springbank-12cs': {
    id: 'springbank-12cs',
    name: '스프링뱅크 12 CS',
    image: '/whiskies/스프링뱅크 12cs.png',
    abv: '56.5%',
    region: '스코틀랜드 (캠벨타운)',
    price: '18만원 내외',
    cask: 'ex-버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'kilkerran-12': {
    id: 'kilkerran-12',
    name: '킬커란 12년',
    image: '/whiskies/킬커란 12년.png',
    abv: '46.0%',
    region: '스코틀랜드 (캠벨타운)',
    price: '14만원 내외',
    cask: 'ex-버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  // 글렌드로낙 시리즈
  'glendronach-12': {
    id: 'glendronach-12',
    name: '글렌드로낙 12년',
    image: '/whiskies/글렌드로낙 12년.png',
    abv: '43.0%',
    region: '스코틀랜드 (하이랜드)',
    price: '12-15만원',
    cask: 'PX & 올로로소 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'glendronach-15': {
    id: 'glendronach-15',
    name: '글렌드로낙 15년',
    image: '/whiskies/글렌드로낙 15년.png',
    abv: '46.0%',
    region: '스코틀랜드 (하이랜드)',
    price: '18-22만원',
    cask: 'PX & 올로로소 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'glendronach-18': {
    id: 'glendronach-18',
    name: '글렌드로낙 18년',
    image: '/whiskies/글렌드로낙 18년.png',
    abv: '46.0%',
    region: '스코틀랜드 (하이랜드)',
    price: '25-30만원',
    cask: 'PX & 올로로소 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  // 라프로익 시리즈
  'laphroaig-10': {
    id: 'laphroaig-10',
    name: '라프로익 10년',
    image: '/whiskies/라프로익 10년.png',
    abv: '40.0%',
    region: '스코틀랜드 (아일라)',
    price: '11-13만원',
    cask: 'ex-버번 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'laphroaig-lore': {
    id: 'laphroaig-lore',
    name: '라프로익 로어',
    image: '/whiskies/라프로익 로어.png',
    abv: '48.0%',
    region: '스코틀랜드 (아일라)',
    price: '20-25만원',
    cask: '셰리 버트 & 쿼터 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  // 보모어 시리즈 (이미지 있는 것들 이미 위로 이동함, 여기는 남은 것들)
  'bowmore-12': {
    id: 'bowmore-12',
    name: '보모어 12년',
    image: '/whiskies/보모어 12년.png',
    abv: '40.0%',
    region: '스코틀랜드 (아일라)',
    price: '15-18만원',
    cask: 'ex-버번 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'bowmore-15': {
    id: 'bowmore-15',
    name: '보모어 15년',
    image: '/whiskies/보모어 15년.png',
    abv: '43.0%',
    region: '스코틀랜드 (아일라)',
    price: '24-28만원',
    cask: 'ex-버번 & 올로로소 셰리',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'bowmore-15-darkest': {
    id: 'bowmore-15-darkest',
    name: '보모어 15 다키스트',
    image: '/whiskies/보모어 15 다키스트.png',
    abv: '43.0%',
    region: '스코틀랜드 (아일라)',
    price: '24-28만원',
    cask: 'ex-버번 & 올로로소 셰리',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  // 아드벡
  'ardbeg-10-new': {
    id: 'ardbeg-10-new',
    name: '아드벡 10년',
    image: '/whiskies/아드벡 10년.png',
    abv: '46.0%',
    region: '스코틀랜드 (아일라)',
    price: '8-10만원',
    cask: 'ex-버번 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  // 탈리스커 시리즈
  'talisker-10': {
    id: 'talisker-10',
    name: '탈리스커 10년',
    image: '/whiskies/탈리스커 10년.png',
    abv: '45.8%',
    region: '스코틀랜드 (스카이섬)',
    price: '14-17만원',
    cask: 'ex-버번 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'talisker-storm': {
    id: 'talisker-storm',
    name: '탈리스커 스톰',
    image: '/whiskies/탈리스커 스톰.png',
    abv: '45.8%',
    region: '스코틀랜드 (스카이섬)',
    price: '12-15만원',
    cask: '재차링된 ex-버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  // 조니워커 시리즈
  'johnnie-walker-black': {
    id: 'johnnie-walker-black',
    name: '조니워커 블랙 라벨',
    image: '/whiskies/조니워커 블랙 라벨.png',
    abv: '40.0%',
    region: '스코틀랜드 (블렌디드)',
    price: '8-10만원',
    cask: '12년 숙성 블렌드',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'johnnie-walker-blue': {
    id: 'johnnie-walker-blue',
    name: '조니워커 블루 라벨',
    image: '/whiskies/조니워커 블루 라벨.png',
    abv: '40.0%',
    region: '스코틀랜드 (블렌디드)',
    price: '50-60만원',
    cask: '프리미엄 레어 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  // 일본 위스키
  'yamazaki-dr': {
    id: 'yamazaki-dr',
    name: '야마자키 DR',
    image: '/whiskies/야마자키 DR.png',
    abv: '43.0%',
    region: '일본',
    price: '18-22만원',
    cask: 'ex-버번, 셰리, 미즈나라 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'hakushu-12': {
    id: 'hakushu-12',
    name: '하쿠슈 12년',
    image: '/whiskies/하쿠슈 12년.png',
    abv: '43.0%',
    region: '일본',
    price: '28-35만원',
    cask: '다양한 오크 타입',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'hakushu-dr': {
    id: 'hakushu-dr',
    name: '하쿠슈 DR',
    image: '/whiskies/하쿠슈 DR.png',
    abv: '43.0%',
    region: '일본',
    price: '16-20만원',
    cask: '다양한 오크 타입',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'hibiki-harmony': {
    id: 'hibiki-harmony',
    name: '히비키 하모니',
    image: '/whiskies/히비키 하모니.png',
    abv: '43.0%',
    region: '일본 (블렌디드)',
    price: '20-25만원',
    cask: '10가지 위스키, 5가지 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  // 카발란 시리즈
  'kavalan-classic': {
    id: 'kavalan-classic',
    name: '카발란 클래식 싱글몰트',
    image: '/whiskies/카발란 클래식 싱글몰트.png',
    abv: '40.0%',
    region: '대만',
    price: '16-20만원',
    cask: 'ex-버번 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'kavalan-oloroso': {
    id: 'kavalan-oloroso',
    name: '카발란 올로로소 쉐리 오크',
    image: '/whiskies/카발란 올로로소 쉐리 오크.png',
    abv: '43.0%',
    region: '대만',
    price: '20-25만원',
    cask: '올로로소 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'kavalan-solist-bourbon': {
    id: 'kavalan-solist-bourbon',
    name: '카발란 솔리스트 버번',
    image: '/whiskies/카발란 솔리스트 버번.png',
    abv: '53.2%',
    region: '대만',
    price: '40-50만원',
    cask: 'ex-버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'kavalan-solist-oloroso': {
    id: 'kavalan-solist-oloroso',
    name: '카발란 솔리스트 올로로쏘 쉐리',
    image: '/whiskies/카발란 솔리스트 올로로쏘 쉐리.png',
    abv: '54.8%',
    region: '대만',
    price: '45-55만원',
    cask: '올로로소 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'kavalan-solist-port': {
    id: 'kavalan-solist-port',
    name: '카발란 솔리스트 포트 캐스크',
    image: '/whiskies/카발란 솔리스트 포트 캐스크.png',
    abv: '55.0%',
    region: '대만',
    price: '50-60만원',
    cask: '포트 와인 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'kavalan-solist-madeira': {
    id: 'kavalan-solist-madeira',
    name: '카발란 솔리스트 마데이라 캐스크',
    image: '/whiskies/카발란 솔리스트 마데이라 캐스크.png',
    abv: '56.0%',
    region: '대만',
    price: '50-60만원',
    cask: '마데이라 와인 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'kavalan-solist-brandy': {
    id: 'kavalan-solist-brandy',
    name: '카발란 솔리스트 브랜디 캐스크',
    image: '/whiskies/카발란 솔리스트 브랜디 캐스크.png',
    abv: '57.0%',
    region: '대만',
    price: '50-60만원',
    cask: 'ex-브랜디 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'kavalan-solist-french-wine': {
    id: 'kavalan-solist-french-wine',
    name: '카발란 솔리스트 프렌치 와인',
    image: '/whiskies/카발란 솔리스트 프렌치 와인.png',
    abv: '58.0%',
    region: '대만',
    price: '55-65만원',
    cask: '프렌치 와인 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'kavalan-solist-fino': {
    id: 'kavalan-solist-fino',
    name: '카발란 솔리스트 피노 쉐리',
    image: '/whiskies/카발란 솔리스트 피노 쉐리.png',
    abv: '56.0%',
    region: '대만',
    price: '50-60만원',
    cask: '피노 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  // 미국 위스키 - 러셀 리저브 시리즈
  'russell-reserve-10': {
    id: 'russell-reserve-10',
    name: '러셀 리저브 10년',
    image: '/whiskies/러셀 리저브 10년.png',
    abv: '45.0%',
    region: '미국 (켄터키)',
    price: '10-13만원',
    cask: 'ex-버번 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'russell-reserve-15': {
    id: 'russell-reserve-15',
    name: '러셀 리저브 15년',
    image: '/whiskies/러셀 리저브 15년.png',
    abv: '58.6%',
    region: '미국 (켄터키)',
    price: '35-45만원',
    cask: 'ex-버번 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'russell-reserve-single-barrel': {
    id: 'russell-reserve-single-barrel',
    name: '러셀 리저브 싱글배럴',
    image: '/whiskies/러셀 리저브 싱글배럴 .png',
    abv: '55.0%',
    region: '미국 (켄터키)',
    price: '15-20만원',
    cask: '싱글 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'russell-reserve-single-barrel-rye': {
    id: 'russell-reserve-single-barrel-rye',
    name: '러셀 리저브 싱글배럴 라이',
    image: '/whiskies/러셀 리저브 싱글배럴 라이.png',
    abv: '52.0%',
    region: '미국 (켄터키)',
    price: '18-23만원',
    cask: '라이 위스키 싱글 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  // 기타 미국 위스키
  'sagamore-cs': {
    id: 'sagamore-cs',
    name: '사가모어 CS',
    image: '/whiskies/사가모어 cs.png',
    abv: '56.1%',
    region: '미국 (메릴랜드)',
    price: '20-25만원',
    cask: '하이 라이 & 로우 라이 블렌드',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'makers-mark': {
    id: 'makers-mark',
    name: '메이커스 마크',
    image: '/whiskies/메이커스 마크 .png',
    abv: '45.0%',
    region: '미국 (켄터키)',
    price: '8-10만원',
    cask: '위트 레시피',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'buffalo-trace': {
    id: 'buffalo-trace',
    name: '버팔로 트레이스',
    image: '/whiskies/버팔로 트레이스.png',
    abv: '45.0%',
    region: '미국 (켄터키)',
    price: '7-9만원',
    cask: '10% 라이 매시빌',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'evan-williams-black': {
    id: 'evan-williams-black',
    name: '에반 윌리엄스 블랙',
    image: '/whiskies/에반 윌리엄스 블랙.png',
    abv: '43.0%',
    region: '미국 (켄터키)',
    price: '6-8만원',
    cask: '75% 옥수수, 13% 라이',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  // 와일드 터키 시리즈
  'wild-turkey-101': {
    id: 'wild-turkey-101',
    name: '와일드 터키 101',
    image: '/whiskies/와일드 터키 101.png',
    abv: '50.5%',
    region: '미국 (켄터키)',
    price: '8-10만원',
    cask: '전통 버번 매시빌',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'wild-turkey-101-rye': {
    id: 'wild-turkey-101-rye',
    name: '와일드 터키 101 라이',
    image: '/whiskies/와일드 터키 101 라이.png',
    abv: '50.5%',
    region: '미국 (켄터키)',
    price: '9-11만원',
    cask: '라이 위스키',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'wild-turkey-rye': {
    id: 'wild-turkey-rye',
    name: '와일드 터키 라이',
    image: '/whiskies/와일드 터키 라이.png',
    abv: '40.5%',
    region: '미국 (켄터키)',
    price: '8-10만원',
    cask: '라이 위스키',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  // 한국 위스키
  'ki-one-unicorn': {
    id: 'ki-one-unicorn',
    name: '기원 유니콘',
    image: '/whiskies/기원 유니콘.png',
    abv: '46.0%',
    region: '한국',
    price: '95-120만원',
    cask: '뉴 아메리칸 오크 & 피티드 몰트',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  }
}

// 리뷰 데이터 저장소 (위스키 ID별로 구분)
export const reviewsDatabase: Record<string, Review[]> = {
  'glengrant-arboralis': [],
  'macallan-12': [],
  'ardbeg-10': [],
  'lagavulin-16': [],
  'balvenie-12': [],
  'glenmorangie-18': [],
  'highland-park-12': [],
  'springbank-10': [],
  'springbank-12cs': [],
  'kilkerran-12': [],
  // 새로 추가된 위스키들
  'glendronach-12': [],
  'glendronach-15': [],
  'glendronach-18': [],
  'laphroaig-10': [],
  'laphroaig-lore': [],
  'bowmore-12': [],
  'bowmore-15': [],
  'bowmore-15-darkest': [],
  'bowmore-18': [],
  'ardbeg-10-new': [],
  'talisker-10': [],
  'talisker-storm': [],
  'johnnie-walker-black': [],
  'johnnie-walker-blue': [],
  'yamazaki-dr': [],
  'hakushu-12': [],
  'hakushu-dr': [],
  'hibiki-harmony': [],
  'kavalan-classic': [],
  'kavalan-oloroso': [],
  'kavalan-solist-bourbon': [],
  'kavalan-solist-oloroso': [],
  'kavalan-solist-port': [],
  'kavalan-solist-madeira': [],
  'kavalan-solist-brandy': [],
  'kavalan-solist-vinho': [],
  'kavalan-solist-french-wine': [],
  'kavalan-solist-fino': [],
  'russell-reserve-10': [],
  'russell-reserve-15': [],
  'russell-reserve-single-barrel': [],
  'russell-reserve-single-barrel-rye': [],
  'sagamore-cs': [],
  'makers-mark': [],
  'buffalo-trace': [],
  'evan-williams-black': [],
  'wild-turkey-101': [],
  'wild-turkey-101-rye': [],
  'wild-turkey-rye': [],
  'wild-turkey-rare-breed': [],
  'ki-one-unicorn': []
}

// 위스키 데이터 가져오기
export function getWhiskyData(id: string): WhiskyData | null {
  return whiskeyDatabase[id] || null
}

// 리뷰 데이터 가져오기
export function getReviews(whiskyId: string): Review[] {
  return reviewsDatabase[whiskyId] || []
}

// 리뷰 추가하기 (같은 사용자의 기존 리뷰와 병합)
export function addReview(whiskyId: string, review: Omit<Review, 'id' | 'createdAt' | 'likes' | 'comments'>): Review {
  if (!reviewsDatabase[whiskyId]) {
    reviewsDatabase[whiskyId] = []
  }

  // 같은 사용자의 기존 리뷰 찾기
  const existingReviewIndex = reviewsDatabase[whiskyId].findIndex(
    existingReview => existingReview.user === review.user
  )

  if (existingReviewIndex !== -1) {
    // 기존 리뷰가 있으면 업데이트
    const existingReview = reviewsDatabase[whiskyId][existingReviewIndex]

    // 별점과 노트를 병합하는 로직 - 마지막 평점이 우선
    let updatedComment = review.comment
    let updatedRating = review.rating // 마지막으로 입력한 평점이 항상 우선

    // 기존 리뷰가 별점만 남긴 것인지 확인
    const existingIsRatingOnly = existingReview.comment.includes('별점') && existingReview.comment.includes('점을 남겼습니다')
    // 새 리뷰가 별점만 남긴 것인지 확인
    const newIsRatingOnly = review.comment.includes('별점') && review.comment.includes('점을 남겼습니다')

    if (existingIsRatingOnly && !newIsRatingOnly) {
      // 기존에 별점만 있고, 새로 실제 노트를 작성한 경우
      updatedComment = review.comment
      // 새로 입력한 평점이 있으면 사용, 없으면 기존 평점 유지
      updatedRating = review.rating || existingReview.rating
    } else if (!existingIsRatingOnly && newIsRatingOnly) {
      // 기존에 실제 노트가 있고, 새로 별점만 남긴 경우
      // 기존 노트 유지하되, 새로운 별점으로 업데이트
      updatedComment = existingReview.comment
      updatedRating = review.rating
    } else if (existingIsRatingOnly && newIsRatingOnly) {
      // 둘 다 별점만인 경우 (새 별점으로 업데이트)
      updatedComment = `별점 ${review.rating}점을 남겼습니다.`
      updatedRating = review.rating
    } else {
      // 둘 다 실제 노트인 경우 (새 노트와 새 별점으로 교체)
      updatedComment = review.comment
      updatedRating = review.rating
    }

    const updatedReview: Review = {
      ...existingReview,
      rating: updatedRating,
      comment: updatedComment,
      createdAt: new Date().toISOString()
    }

    reviewsDatabase[whiskyId][existingReviewIndex] = updatedReview

    // 평균 별점 업데이트
    updateAverageRating(whiskyId)

    // 로컬 스토리지에 저장
    saveWhiskyDataToStorage()

    return updatedReview
  } else {
    // 새 리뷰 생성
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: []
    }

    reviewsDatabase[whiskyId].push(newReview)

    // 평균 별점 업데이트
    updateAverageRating(whiskyId)

    // 로컬 스토리지에 저장
    saveWhiskyDataToStorage()

    return newReview
  }
}

// 댓글 추가하기
export function addComment(whiskyId: string, reviewId: string, commentData: Omit<Comment, 'id' | 'createdAt' | 'replies'>): Comment {
  const newComment: Comment = {
    ...commentData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    replies: []
  }

  const reviews = reviewsDatabase[whiskyId] || []
  const reviewIndex = reviews.findIndex(review => review.id === reviewId)

  if (reviewIndex !== -1) {
    reviews[reviewIndex].comments.push(newComment)
    saveWhiskyDataToStorage()
  }

  return newComment
}

// 답글 추가하기
export function addReply(whiskyId: string, reviewId: string, commentId: string, replyData: Omit<Comment, 'id' | 'createdAt' | 'replies'>): Comment {
  const newReply: Comment = {
    ...replyData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    replies: []
  }

  const reviews = reviewsDatabase[whiskyId] || []
  const reviewIndex = reviews.findIndex(review => review.id === reviewId)

  if (reviewIndex !== -1) {
    const commentIndex = reviews[reviewIndex].comments.findIndex(comment => comment.id === commentId)
    if (commentIndex !== -1) {
      reviews[reviewIndex].comments[commentIndex].replies.push(newReply)
      saveWhiskyDataToStorage()
    }
  }

  return newReply
}

// 로컬 스토리지에서 데이터 로드
export function loadWhiskyDataFromStorage(): void {
  if (typeof window !== 'undefined') {
    const savedData = localStorage.getItem('whiskyData')
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      Object.keys(parsedData).forEach(key => {
        if (whiskeyDatabase[key]) {
          // 가격 정보는 코드의 최신 데이터를 유지하고, 사용자 활동 데이터만 로드
          const { price: _, ...userActivityData } = parsedData[key]
          whiskeyDatabase[key] = { ...whiskeyDatabase[key], ...userActivityData }
        }
      })
    }
  }
}

// 로컬 스토리지에 데이터 저장
export function saveWhiskyDataToStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('whiskyData', JSON.stringify(whiskeyDatabase))
    localStorage.setItem('reviewsData', JSON.stringify(reviewsDatabase))
  }
}

// 로컬 스토리지에서 리뷰 데이터 로드
export function loadReviewsFromStorage(): void {
  if (typeof window !== 'undefined') {
    const savedReviews = localStorage.getItem('reviewsData')
    if (savedReviews) {
      const parsedReviews = JSON.parse(savedReviews)
      Object.keys(parsedReviews).forEach(key => {
        if (reviewsDatabase[key]) {
          reviewsDatabase[key] = parsedReviews[key]
        }
      })
    }
  }
}

// 위스키에 추천 추가하기
export function addLike(whiskyId: string): void {
  if (whiskeyDatabase[whiskyId]) {
    whiskeyDatabase[whiskyId].likes += 1
    saveWhiskyDataToStorage()
  }
}

// 위스키에 추천 제거하기
export function removeLike(whiskyId: string): void {
  if (whiskeyDatabase[whiskyId] && whiskeyDatabase[whiskyId].likes > 0) {
    whiskeyDatabase[whiskyId].likes -= 1
    saveWhiskyDataToStorage()
  }
}

// 평균 별점 업데이트하기
export function updateAverageRating(whiskyId: string): void {
  const reviews = reviewsDatabase[whiskyId] || []
  const whisky = whiskeyDatabase[whiskyId]

  if (whisky && reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    whisky.avgRating = Math.round((totalRating / reviews.length) * 10) / 10
    whisky.totalReviews = reviews.length
  }
}