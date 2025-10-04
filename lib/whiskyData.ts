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
  // 러셀 리저브 시리즈
  'russell-reserve-10': {
    id: 'russell-reserve-10',
    name: '러셀 리저브 10년',
    image: '/whiskies/러셀 리저브 10년.png',
    abv: '50.0%',
    region: '미국 (켄터키)',
    price: '4-6만원',
    cask: '버번 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'russell-reserve-15-bourbon': {
    id: 'russell-reserve-15-bourbon',
    name: '러셀 리저브 15년 버번',
    image: '/whiskies/러셀 리저브 15년 버번.png',
    abv: '50.0%',
    region: '미국 (켄터키)',
    price: '8-12만원',
    cask: '프리미엄 버번 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'russell-reserve-15': {
    id: 'russell-reserve-15',
    name: '러셀 리저브 15년',
    image: '/whiskies/러셀 리저브 15년.png',
    abv: '50.0%',
    region: '미국 (켄터키)',
    price: '8-12만원',
    cask: '프리미엄 버번 배럴',
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
    price: '6-9만원',
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
    price: '6-9만원',
    cask: '라이 위스키 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 메이커스 마크
  'makers-mark': {
    id: 'makers-mark',
    name: '메이커스 마크',
    image: '/whiskies/메이커스 마크 .png',
    abv: '45.0%',
    region: '미국 (켄터키)',
    price: '3-5만원',
    cask: '레드 윈터 위트 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 버팔로 트레이스
  'buffalo-trace': {
    id: 'buffalo-trace',
    name: '버팔로 트레이스',
    image: '/whiskies/버팔로 트레이스.png',
    abv: '40.0%',
    region: '미국 (켄터키)',
    price: '3-4만원',
    cask: '아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 에반 윌리엄스
  'evan-williams-black': {
    id: 'evan-williams-black',
    name: '에반 윌리엄스 블랙',
    image: '/whiskies/에반 윌리엄스 블랙.png',
    abv: '43.0%',
    region: '미국 (켄터키)',
    price: '2-3만원',
    cask: '아메리칸 오크',
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
    price: '4-6만원',
    cask: '아메리칸 오크',
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
    price: '4-6만원',
    cask: '라이 위스키 배럴',
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
    price: '3-5만원',
    cask: '라이 위스키 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 사가모어
  'sagamore-cs': {
    id: 'sagamore-cs',
    name: '사가모어 캐스크 스트렝스',
    image: '/whiskies/사가모어 cs.png',
    abv: '56.0%',
    region: '미국 (메릴랜드)',
    price: '8-12만원',
    cask: '라이 위스키 배럴',
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
    region: '스코틀랜드',
    price: '3-5만원',
    cask: '블렌디드 스카치',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'johnnie-walker-blue': {
    id: 'johnnie-walker-blue',
    name: '조니워커 블루 라벨',
    image: '/whiskies/조니워커 블루 라벨.png',
    abv: '40.0%',
    region: '스코틀랜드',
    price: '18-25만원',
    cask: '프리미엄 블렌디드',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 아드벡
  'ardbeg-10': {
    id: 'ardbeg-10',
    name: '아드벡 10년',
    image: '/whiskies/아드벡 10년.png',
    abv: '46.0%',
    region: '스코틀랜드 (아일라)',
    price: '8-12만원',
    cask: 'ex-버번 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 탈리스커
  'talisker-10': {
    id: 'talisker-10',
    name: '탈리스커 10년',
    image: '/whiskies/탈리스커 10년.png',
    abv: '45.8%',
    region: '스코틀랜드 (아일 오브 스카이)',
    price: '6-9만원',
    cask: 'ex-버번 & 셰리 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'talisker-storm': {
    id: 'talisker-storm',
    name: '탈리스커 스톰',
    image: '/whiskies/탈리스커 스톰.png',
    abv: '45.8%',
    region: '스코틀랜드 (아일 오브 스카이)',
    price: '5-8만원',
    cask: 'ex-버번 & 셰리 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 킬커란
  'kilkerran-12': {
    id: 'kilkerran-12',
    name: '킬커란 12년',
    image: '/whiskies/킬커란 12년.png',
    abv: '46.0%',
    region: '스코틀랜드 (캠벨타운)',
    price: '8-12만원',
    cask: 'ex-버번 & 셰리 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 라프로익
  'laphroaig-10': {
    id: 'laphroaig-10',
    name: '라프로익 10년',
    image: '/whiskies/라프로익 10년.png',
    abv: '40.0%',
    region: '스코틀랜드 (아일라)',
    price: '6-9만원',
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
    price: '12-18만원',
    cask: '다양한 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 일본 위스키
  'yamazaki-dr': {
    id: 'yamazaki-dr',
    name: '야마자키 디스틸러스 리저브',
    image: '/whiskies/야마자키 DR.png',
    abv: '43.0%',
    region: '일본',
    price: '10-15만원',
    cask: '미즈나라 & 아메리칸 오크',
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
    price: '15-25만원',
    cask: '아메리칸 & 스패니시 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'hakushu-dr': {
    id: 'hakushu-dr',
    name: '하쿠슈 디스틸러스 리저브',
    image: '/whiskies/하쿠슈 DR.png',
    abv: '43.0%',
    region: '일본',
    price: '8-12만원',
    cask: '아메리칸 & 스패니시 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'hibiki-harmony': {
    id: 'hibiki-harmony',
    name: '히비키 하모니',
    image: '/whiskies/히비키 하모니.png',
    abv: '43.0%',
    region: '일본',
    price: '12-18만원',
    cask: '일본산 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 기원 유니콘
  'kiwon-unicorn': {
    id: 'kiwon-unicorn',
    name: '기원 유니콘',
    image: '/whiskies/기원 유니콘.png',
    abv: '40.0%',
    region: '한국',
    price: '4-6만원',
    cask: '아메리칸 오크',
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
  },

  // === 추가 인기 위스키 300개 ===

  // 스코틀랜드 싱글몰트 - 스페이사이드
  'glenfiddich-15': {
    id: 'glenfiddich-15',
    name: '글렌피딕 15년',
    image: '/whiskies/글렌피딕 15년.png',
    abv: '40.0%',
    region: '스코틀랜드 (스페이사이드)',
    price: '6-8만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'glenfiddich-18': {
    id: 'glenfiddich-18',
    name: '글렌피딕 18년',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '스코틀랜드 (스페이사이드)',
    price: '18-22만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'glenfiddich-21': {
    id: 'glenfiddich-21',
    name: '글렌피딕 21년',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '스코틀랜드 (스페이사이드)',
    price: '35-45만원',
    cask: '카리비안 럼 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'glenlivet-12': {
    id: 'glenlivet-12',
    name: '글렌리벳 12년',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '스코틀랜드 (스페이사이드)',
    price: '6-8만원',
    cask: '아메리칸 오크 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'glenlivet-18': {
    id: 'glenlivet-18',
    name: '글렌리벳 18년',
    image: '/whiskies/no.pic whisky.png',
    abv: '43.0%',
    region: '스코틀랜드 (스페이사이드)',
    price: '18-25만원',
    cask: '셰리 & 버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'glendronach-15': {
    id: 'glendronach-15',
    name: '글렌드로낙 15년 리바이벌',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '스코틀랜드 (스페이사이드)',
    price: '15-20만원',
    cask: '올로로소 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'glendronach-21': {
    id: 'glendronach-21',
    name: '글렌드로낙 21년 의회',
    image: '/whiskies/no.pic whisky.png',
    abv: '48.0%',
    region: '스코틀랜드 (스페이사이드)',
    price: '45-55만원',
    cask: '올로로소 & PX 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'dalmore-12': {
    id: 'dalmore-12',
    name: '달모어 12년',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '스코틀랜드 (하이랜드)',
    price: '12-15만원',
    cask: '아메리칸 화이트 오크 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'dalmore-15': {
    id: 'dalmore-15',
    name: '달모어 15년',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '스코틀랜드 (하이랜드)',
    price: '20-25만원',
    cask: '3 캐스크 마츄레이션',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'dalmore-18': {
    id: 'dalmore-18',
    name: '달모어 18년',
    image: '/whiskies/no.pic whisky.png',
    abv: '43.0%',
    region: '스코틀랜드 (하이랜드)',
    price: '45-55만원',
    cask: '아메리칸 화이트 오크 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'oban-14': {
    id: 'oban-14',
    name: '오반 14년',
    image: '/whiskies/no.pic whisky.png',
    abv: '43.0%',
    region: '스코틀랜드 (하이랜드)',
    price: '12-15만원',
    cask: '아메리칸 & 유러피언 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'aberfeldy-12': {
    id: 'aberfeldy-12',
    name: '애버펠디 12년',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '스코틀랜드 (하이랜드)',
    price: '8-10만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'glenmorangie-10': {
    id: 'glenmorangie-10',
    name: '글렌모렌지 오리지널 10년',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '스코틀랜드 (하이랜드)',
    price: '7-9만원',
    cask: '버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'glenmorangie-18': {
    id: 'glenmorangie-18',
    name: '글렌모렌지 18년',
    image: '/whiskies/no.pic whisky.png',
    abv: '43.0%',
    region: '스코틀랜드 (하이랜드)',
    price: '28-35만원',
    cask: '셰리 캐스크 피니쉬',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'balvenie-12': {
    id: 'balvenie-12',
    name: '발베니 더블우드 12년',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '스코틀랜드 (스페이사이드)',
    price: '12-15만원',
    cask: '버번 캐스크 + 셰리 피니쉬',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'balvenie-14': {
    id: 'balvenie-14',
    name: '발베니 카리비안 캐스크 14년',
    image: '/whiskies/no.pic whisky.png',
    abv: '43.0%',
    region: '스코틀랜드 (스페이사이드)',
    price: '15-18만원',
    cask: '럼 캐스크 피니쉬',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'balvenie-21': {
    id: 'balvenie-21',
    name: '발베니 포트우드 21년',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '스코틀랜드 (스페이사이드)',
    price: '45-55만원',
    cask: '포트 와인 캐스크 피니쉬',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'cardhu-12': {
    id: 'cardhu-12',
    name: '카듀 12년',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '스코틀랜드 (스페이사이드)',
    price: '8-10만원',
    cask: '아메리칸 & 유러피언 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'craigellachie-13': {
    id: 'craigellachie-13',
    name: '크레이겔라히 13년',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '스코틀랜드 (스페이사이드)',
    price: '10-12만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 스코틀랜드 - 아일라
  'lagavulin-8': {
    id: 'lagavulin-8',
    name: '라가불린 8년',
    image: '/whiskies/no.pic whisky.png',
    abv: '48.0%',
    region: '스코틀랜드 (아일라)',
    price: '12-15만원',
    cask: 'ex-버번 배럴',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'bowmore-15': {
    id: 'bowmore-15',
    name: '보모어 15년 다키스트',
    image: '/whiskies/no.pic whisky.png',
    abv: '43.0%',
    region: '스코틀랜드 (아일라)',
    price: '18-22만원',
    cask: '셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'bowmore-25': {
    id: 'bowmore-25',
    name: '보모어 25년',
    image: '/whiskies/no.pic whisky.png',
    abv: '43.0%',
    region: '스코틀랜드 (아일라)',
    price: '80-100만원',
    cask: '셰리 & 버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'ardbeg-uigeadail': {
    id: 'ardbeg-uigeadail',
    name: '아드벡 우거다일',
    image: '/whiskies/no.pic whisky.png',
    abv: '54.2%',
    region: '스코틀랜드 (아일라)',
    price: '15-18만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'ardbeg-corryvreckan': {
    id: 'ardbeg-corryvreckan',
    name: '아드벡 코리브렉칸',
    image: '/whiskies/no.pic whisky.png',
    abv: '57.1%',
    region: '스코틀랜드 (아일라)',
    price: '15-18만원',
    cask: '버번 & 프렌치 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'bruichladdich-classic': {
    id: 'bruichladdich-classic',
    name: '브루이클라디 클래식 라디',
    image: '/whiskies/no.pic whisky.png',
    abv: '50.0%',
    region: '스코틀랜드 (아일라)',
    price: '10-12만원',
    cask: '아메리칸 오크 & 와인 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'bruichladdich-port': {
    id: 'bruichladdich-port',
    name: '브루이클라디 포트 샬롯',
    image: '/whiskies/no.pic whisky.png',
    abv: '50.0%',
    region: '스코틀랜드 (아일라)',
    price: '12-15만원',
    cask: '아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'caol-ila-12': {
    id: 'caol-ila-12',
    name: '카올 일라 12년',
    image: '/whiskies/no.pic whisky.png',
    abv: '43.0%',
    region: '스코틀랜드 (아일라)',
    price: '10-12만원',
    cask: 'ex-버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'bunnahabhain-12': {
    id: 'bunnahabhain-12',
    name: '부나하벤 12년',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.3%',
    region: '스코틀랜드 (아일라)',
    price: '12-15만원',
    cask: 'ex-버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'kilchoman-machir': {
    id: 'kilchoman-machir',
    name: '킬커맨 마키르 베이',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '스코틀랜드 (아일라)',
    price: '12-15만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 스코틀랜드 - 캠벨타운
  'glen-scotia-15': {
    id: 'glen-scotia-15',
    name: '글렌 스코시아 15년',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '스코틀랜드 (캠벨타운)',
    price: '15-18만원',
    cask: '버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'hazelburn-10': {
    id: 'hazelburn-10',
    name: '헤이즐번 10년',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '스코틀랜드 (캠벨타운)',
    price: '18-22만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'longrow-10': {
    id: 'longrow-10',
    name: '롱로우 10년',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '스코틀랜드 (캠벨타운)',
    price: '15-18만원',
    cask: 'ex-버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 스코틀랜드 - 로우랜드
  'auchentoshan-12': {
    id: 'auchentoshan-12',
    name: '오켄토산 12년',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '스코틀랜드 (로우랜드)',
    price: '8-10만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'auchentoshan-18': {
    id: 'auchentoshan-18',
    name: '오켄토산 18년',
    image: '/whiskies/no.pic whisky.png',
    abv: '43.0%',
    region: '스코틀랜드 (로우랜드)',
    price: '25-30만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'glenkinchie-12': {
    id: 'glenkinchie-12',
    name: '글렌킨치 12년',
    image: '/whiskies/no.pic whisky.png',
    abv: '43.0%',
    region: '스코틀랜드 (로우랜드)',
    price: '8-10만원',
    cask: 'ex-버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 아이리시 위스키
  'jameson-standard': {
    id: 'jameson-standard',
    name: '제임슨',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '아일랜드',
    price: '4-6만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'jameson-18': {
    id: 'jameson-18',
    name: '제임슨 18년',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '아일랜드',
    price: '35-45만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'tullamore-dew': {
    id: 'tullamore-dew',
    name: '털라모어 듀',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '아일랜드',
    price: '4-6만원',
    cask: '3 캐스크 블렌드',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'redbreast-12': {
    id: 'redbreast-12',
    name: '레드브레스트 12년',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '아일랜드',
    price: '12-15만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'redbreast-15': {
    id: 'redbreast-15',
    name: '레드브레스트 15년',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '아일랜드',
    price: '25-30만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'green-spot': {
    id: 'green-spot',
    name: '그린 스팟',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '아일랜드',
    price: '10-12만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'yellow-spot-12': {
    id: 'yellow-spot-12',
    name: '옐로우 스팟 12년',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '아일랜드',
    price: '18-22만원',
    cask: '버번, 셰리, 말라가 와인 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'writers-tears': {
    id: 'writers-tears',
    name: '라이터스 티어스',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '아일랜드',
    price: '8-10만원',
    cask: '버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 버번 위스키
  'woodford-reserve': {
    id: 'woodford-reserve',
    name: '우드포드 리저브',
    image: '/whiskies/no.pic whisky.png',
    abv: '45.2%',
    region: '미국 (켄터키)',
    price: '8-10만원',
    cask: '뉴 아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'four-roses': {
    id: 'four-roses',
    name: '포 로지스',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '미국 (켄터키)',
    price: '5-7만원',
    cask: '뉴 아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'four-roses-single': {
    id: 'four-roses-single',
    name: '포 로지스 싱글 배럴',
    image: '/whiskies/no.pic whisky.png',
    abv: '50.0%',
    region: '미국 (켄터키)',
    price: '12-15만원',
    cask: '뉴 아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'knob-creek': {
    id: 'knob-creek',
    name: '놉 크릭',
    image: '/whiskies/no.pic whisky.png',
    abv: '50.0%',
    region: '미국 (켄터키)',
    price: '8-10만원',
    cask: '뉴 아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'basil-haydens': {
    id: 'basil-haydens',
    name: '바질 헤이든스',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '미국 (켄터키)',
    price: '10-12만원',
    cask: '뉴 아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'bookers': {
    id: 'bookers',
    name: '부커스',
    image: '/whiskies/no.pic whisky.png',
    abv: '62.5%',
    region: '미국 (켄터키)',
    price: '18-22만원',
    cask: '뉴 아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'eagle-rare': {
    id: 'eagle-rare',
    name: '이글 레어 10년',
    image: '/whiskies/no.pic whisky.png',
    abv: '45.0%',
    region: '미국 (켄터키)',
    price: '12-15만원',
    cask: '뉴 아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'buffalo-trace-single': {
    id: 'buffalo-trace-single',
    name: '버팔로 트레이스 싱글 배럴',
    image: '/whiskies/no.pic whisky.png',
    abv: '45.0%',
    region: '미국 (켄터키)',
    price: '15-18만원',
    cask: '뉴 아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'blanton-single': {
    id: 'blanton-single',
    name: '블랜튼 싱글 배럴',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.5%',
    region: '미국 (켄터키)',
    price: '25-30만원',
    cask: '뉴 아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'elijah-craig': {
    id: 'elijah-craig',
    name: '일라이저 크레이그',
    image: '/whiskies/no.pic whisky.png',
    abv: '47.0%',
    region: '미국 (켄터키)',
    price: '8-10만원',
    cask: '뉴 아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'henry-mckenna': {
    id: 'henry-mckenna',
    name: '헨리 맥케나 10년',
    image: '/whiskies/no.pic whisky.png',
    abv: '50.0%',
    region: '미국 (켄터키)',
    price: '15-18만원',
    cask: '뉴 아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'old-forester-1920': {
    id: 'old-forester-1920',
    name: '올드 포레스터 1920',
    image: '/whiskies/no.pic whisky.png',
    abv: '57.5%',
    region: '미국 (켄터키)',
    price: '15-18만원',
    cask: '뉴 아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'angels-envy': {
    id: 'angels-envy',
    name: '엔젤스 엔비',
    image: '/whiskies/no.pic whisky.png',
    abv: '43.3%',
    region: '미국 (켄터키)',
    price: '15-18만원',
    cask: '포트 와인 캐스크 피니쉬',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'michters-us1': {
    id: 'michters-us1',
    name: '미치터스 US1',
    image: '/whiskies/no.pic whisky.png',
    abv: '45.7%',
    region: '미국 (켄터키)',
    price: '12-15만원',
    cask: '뉴 아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 라이 위스키
  'rittenhouse-rye': {
    id: 'rittenhouse-rye',
    name: '리튼하우스 라이',
    image: '/whiskies/no.pic whisky.png',
    abv: '50.0%',
    region: '미국 (켄터키)',
    price: '8-10만원',
    cask: '뉴 아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'sazerac-rye': {
    id: 'sazerac-rye',
    name: '사제라크 라이',
    image: '/whiskies/no.pic whisky.png',
    abv: '45.0%',
    region: '미국 (켄터키)',
    price: '10-12만원',
    cask: '뉴 아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'high-west-double': {
    id: 'high-west-double',
    name: '하이 웨스트 더블 라이',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '미국 (유타)',
    price: '12-15만원',
    cask: '뉴 아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'pikesville-rye': {
    id: 'pikesville-rye',
    name: '파이크스빌 라이',
    image: '/whiskies/no.pic whisky.png',
    abv: '55.0%',
    region: '미국 (켄터키)',
    price: '15-18만원',
    cask: '뉴 아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 테네시 위스키
  'jack-daniels': {
    id: 'jack-daniels',
    name: '잭 다니엘스 올드 No.7',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '미국 (테네시)',
    price: '5-7만원',
    cask: '뉴 아메리칸 오크 + 차콜 필터링',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'jack-daniels-single': {
    id: 'jack-daniels-single',
    name: '잭 다니엘스 싱글 배럴',
    image: '/whiskies/no.pic whisky.png',
    abv: '47.0%',
    region: '미국 (테네시)',
    price: '12-15만원',
    cask: '뉴 아메리칸 오크 + 차콜 필터링',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'george-dickel': {
    id: 'george-dickel',
    name: '조지 디켈 No.12',
    image: '/whiskies/no.pic whisky.png',
    abv: '45.0%',
    region: '미국 (테네시)',
    price: '8-10만원',
    cask: '뉴 아메리칸 오크 + 차콜 필터링',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 캐나디안 위스키
  'crown-royal': {
    id: 'crown-royal',
    name: '크라운 로얄',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '캐나다',
    price: '6-8만원',
    cask: '오크 캐스크 블렌드',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'crown-royal-northern': {
    id: 'crown-royal-northern',
    name: '크라운 로얄 노던 하베스트',
    image: '/whiskies/no.pic whisky.png',
    abv: '45.0%',
    region: '캐나다',
    price: '8-10만원',
    cask: '라이 곡물 블렌드',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'canadian-club': {
    id: 'canadian-club',
    name: '캐나디안 클럽',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '캐나다',
    price: '4-6만원',
    cask: '오크 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'forty-creek': {
    id: 'forty-creek',
    name: '포티 크릭',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '캐나다',
    price: '8-10만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 일본 위스키 추가
  'nikka-from-barrel': {
    id: 'nikka-from-barrel',
    name: '니카 프롬 더 배럴',
    image: '/whiskies/no.pic whisky.png',
    abv: '51.4%',
    region: '일본',
    price: '12-15만원',
    cask: '다양한 캐스크 블렌드',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'nikka-coffey-grain': {
    id: 'nikka-coffey-grain',
    name: '니카 커피 그레인',
    image: '/whiskies/no.pic whisky.png',
    abv: '45.0%',
    region: '일본',
    price: '15-18만원',
    cask: '커피 스틸 증류',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'nikka-coffey-malt': {
    id: 'nikka-coffey-malt',
    name: '니카 커피 몰트',
    image: '/whiskies/no.pic whisky.png',
    abv: '45.0%',
    region: '일본',
    price: '18-22만원',
    cask: '커피 스틸 증류',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'yoichi-15': {
    id: 'yoichi-15',
    name: '요이치 15년',
    image: '/whiskies/no.pic whisky.png',
    abv: '45.0%',
    region: '일본',
    price: '80-100만원',
    cask: '셰리 & 버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'miyagikyo-15': {
    id: 'miyagikyo-15',
    name: '미야기쿄 15년',
    image: '/whiskies/no.pic whisky.png',
    abv: '45.0%',
    region: '일본',
    price: '80-100만원',
    cask: '셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'mars-iwai': {
    id: 'mars-iwai',
    name: '마르스 이와이',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '일본',
    price: '8-10만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'mars-komagatake': {
    id: 'mars-komagatake',
    name: '마르스 코마가타케',
    image: '/whiskies/no.pic whisky.png',
    abv: '43.0%',
    region: '일본',
    price: '15-18만원',
    cask: '아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'white-oak-akashi': {
    id: 'white-oak-akashi',
    name: '화이트 오크 아카시',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '일본',
    price: '10-12만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'chichibu-malt': {
    id: 'chichibu-malt',
    name: '치치부 더 피티드',
    image: '/whiskies/no.pic whisky.png',
    abv: '50.5%',
    region: '일본',
    price: '35-45만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 대만 위스키 확장
  'kavalan-ex-bourbon': {
    id: 'kavalan-ex-bourbon',
    name: '카발란 ex-버번 오크',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '대만',
    price: '15-18만원',
    cask: 'ex-버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'kavalan-concertmaster': {
    id: 'kavalan-concertmaster',
    name: '카발란 콘서트마스터',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '대만',
    price: '12-15만원',
    cask: '포트 와인 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'kavalan-distillers': {
    id: 'kavalan-distillers',
    name: '카발란 디스틸러스 리저브',
    image: '/whiskies/no.pic whisky.png',
    abv: '40.0%',
    region: '대만',
    price: '10-12만원',
    cask: '아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'kavalan-podium': {
    id: 'kavalan-podium',
    name: '카발란 포디움',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '대만',
    price: '35-45만원',
    cask: '셰리 & 포트 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 인도 위스키
  'amrut-fusion': {
    id: 'amrut-fusion',
    name: '암룻 퓨전',
    image: '/whiskies/no.pic whisky.png',
    abv: '50.0%',
    region: '인도',
    price: '12-15만원',
    cask: 'ex-버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'amrut-peated': {
    id: 'amrut-peated',
    name: '암룻 피티드',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '인도',
    price: '15-18만원',
    cask: 'ex-버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'paul-john-classic': {
    id: 'paul-john-classic',
    name: '폴 존 클래식',
    image: '/whiskies/no.pic whisky.png',
    abv: '55.2%',
    region: '인도',
    price: '10-12만원',
    cask: 'ex-버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'paul-john-edited': {
    id: 'paul-john-edited',
    name: '폴 존 에디티드',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '인도',
    price: '12-15만원',
    cask: 'ex-버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 호주 위스키
  'sullivan-cove': {
    id: 'sullivan-cove',
    name: '설리반 코브',
    image: '/whiskies/no.pic whisky.png',
    abv: '47.5%',
    region: '호주',
    price: '45-55만원',
    cask: '프렌치 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'starward-nova': {
    id: 'starward-nova',
    name: '스타워드 노바',
    image: '/whiskies/no.pic whisky.png',
    abv: '41.0%',
    region: '호주',
    price: '15-18만원',
    cask: '레드 와인 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'lark-cask-strength': {
    id: 'lark-cask-strength',
    name: '라크 캐스크 스트렝스',
    image: '/whiskies/no.pic whisky.png',
    abv: '58.0%',
    region: '호주',
    price: '35-45만원',
    cask: '아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 프랑스 위스키
  'armorik-classic': {
    id: 'armorik-classic',
    name: '아르모릭 클래식',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '프랑스',
    price: '12-15만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'kornog-peated': {
    id: 'kornog-peated',
    name: '코르녹 피티드',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '프랑스',
    price: '15-18만원',
    cask: '버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'bastille-1789': {
    id: 'bastille-1789',
    name: '바스티유 1789',
    image: '/whiskies/no.pic whisky.png',
    abv: '43.0%',
    region: '프랑스',
    price: '10-12만원',
    cask: '프렌치 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 스웨덴 위스키
  'mackmyra-first-edition': {
    id: 'mackmyra-first-edition',
    name: '맥미라 퍼스트 에디션',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.1%',
    region: '스웨덴',
    price: '18-22만원',
    cask: '아메리칸 & 스웨디시 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'mackmyra-skorsten': {
    id: 'mackmyra-skorsten',
    name: '맥미라 스코르스텐',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.1%',
    region: '스웨덴',
    price: '22-25만원',
    cask: '스모키 스웨디시 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 독일 위스키
  'slyrs-bavarian': {
    id: 'slyrs-bavarian',
    name: '슬라이르스 바바리안',
    image: '/whiskies/no.pic whisky.png',
    abv: '43.0%',
    region: '독일',
    price: '15-18만원',
    cask: '아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'finch-schwäbischer': {
    id: 'finch-schwäbischer',
    name: '핀치 슈베비셔',
    image: '/whiskies/no.pic whisky.png',
    abv: '42.0%',
    region: '독일',
    price: '12-15만원',
    cask: '체리 & 체스트넛 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 네덜란드 위스키
  'millstone-100-rye': {
    id: 'millstone-100-rye',
    name: '밀스톤 100 라이',
    image: '/whiskies/no.pic whisky.png',
    abv: '50.0%',
    region: '네덜란드',
    price: '18-22만원',
    cask: '아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'millstone-peated': {
    id: 'millstone-peated',
    name: '밀스톤 피티드',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '네덜란드',
    price: '15-18만원',
    cask: '버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 벨기에 위스키
  'the-owl-distillery': {
    id: 'the-owl-distillery',
    name: '디 아울 디스틸러리',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '벨기에',
    price: '25-30만원',
    cask: '버번 & 셰리 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 스위스 위스키
  'santis-malt-edition': {
    id: 'santis-malt-edition',
    name: '산티스 몰트 에디션',
    image: '/whiskies/no.pic whisky.png',
    abv: '43.0%',
    region: '스위스',
    price: '20-25만원',
    cask: '셰리 & 버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 이스라엘 위스키
  'milk-honey-classic': {
    id: 'milk-honey-classic',
    name: '밀크 & 허니 클래식',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '이스라엘',
    price: '18-22만원',
    cask: '버번, 레드 와인, STR 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 뉴질랜드 위스키
  'thomson-manuka': {
    id: 'thomson-manuka',
    name: '톰슨 마누카 스모크',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '뉴질랜드',
    price: '25-30만원',
    cask: '버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 남아프리카 위스키
  'three-ships-10': {
    id: 'three-ships-10',
    name: '쓰리 쉽스 10년',
    image: '/whiskies/no.pic whisky.png',
    abv: '43.0%',
    region: '남아프리카',
    price: '15-18만원',
    cask: '아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 영국 잉글랜드 위스키
  'cotswolds-signature': {
    id: 'cotswolds-signature',
    name: '코츠월드 시그니처',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '영국 (잉글랜드)',
    price: '18-22만원',
    cask: 'ex-버번 & STR 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'english-whisky-smokey': {
    id: 'english-whisky-smokey',
    name: '잉글리시 위스키 스모키',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '영국 (잉글랜드)',
    price: '20-25만원',
    cask: '버번 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 웨일스 위스키
  'penderyn-madeira': {
    id: 'penderyn-madeira',
    name: '펜더린 마데이라',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '영국 (웨일스)',
    price: '15-18만원',
    cask: '마데이라 와인 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'penderyn-portwood': {
    id: 'penderyn-portwood',
    name: '펜더린 포트우드',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '영국 (웨일스)',
    price: '18-22만원',
    cask: '포트 와인 캐스크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },

  // 한국 위스키 추가
  'three-societies': {
    id: 'three-societies',
    name: '쓰리 소사이어티스',
    image: '/whiskies/no.pic whisky.png',
    abv: '43.0%',
    region: '한국',
    price: '25-30만원',
    cask: '아메리칸 오크',
    avgRating: 0,
    totalReviews: 0,
    likes: 0
  },
  'ki-one-signature': {
    id: 'ki-one-signature',
    name: '기원 시그니처',
    image: '/whiskies/no.pic whisky.png',
    abv: '46.0%',
    region: '한국',
    price: '15-18만원',
    cask: '아메리칸 오크',
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

// ============= 찜 관리 시스템 =============

// 사용자별 찜 데이터 저장 키 생성
function getLikedWhiskiesKey(userId?: string): string {
  if (!userId) {
    // 로그인하지 않은 사용자는 임시 찜 저장
    return 'tempLikedWhiskies'
  }
  return `likedWhiskies_${userId}`
}

// 사용자의 찜 목록 가져오기
export function getUserLikedWhiskies(userId?: string): Set<string> {
  if (typeof window === 'undefined') return new Set()

  const key = getLikedWhiskiesKey(userId)
  const stored = localStorage.getItem(key)
  return new Set(stored ? JSON.parse(stored) : [])
}

// 찜 상태 확인
export function isWhiskyLiked(whiskyId: string, userId?: string): boolean {
  const likedWhiskies = getUserLikedWhiskies(userId)
  return likedWhiskies.has(whiskyId)
}

// 찜 추가/제거 (중복 방지 및 동기화)
export function toggleLike(whiskyId: string, userId?: string): { success: boolean, isLiked: boolean, newLikeCount: number } {
  if (!whiskeyDatabase[whiskyId]) {
    return { success: false, isLiked: false, newLikeCount: 0 }
  }

  const key = getLikedWhiskiesKey(userId)
  const likedWhiskies = getUserLikedWhiskies(userId)

  if (likedWhiskies.has(whiskyId)) {
    // 찜 제거
    likedWhiskies.delete(whiskyId)
    if (whiskeyDatabase[whiskyId].likes > 0) {
      whiskeyDatabase[whiskyId].likes -= 1
    }
  } else {
    // 찜 추가
    likedWhiskies.add(whiskyId)
    whiskeyDatabase[whiskyId].likes += 1
  }

  // localStorage 업데이트
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify([...likedWhiskies]))
  }

  // 전역 데이터 저장
  saveWhiskyDataToStorage()

  return {
    success: true,
    isLiked: likedWhiskies.has(whiskyId),
    newLikeCount: whiskeyDatabase[whiskyId].likes
  }
}

// 사용자 로그아웃 시 찜 데이터 정리
export function clearUserLikes(userId?: string): void {
  if (typeof window === 'undefined') return

  if (userId) {
    // 특정 사용자 찜 데이터 삭제
    const key = getLikedWhiskiesKey(userId)
    localStorage.removeItem(key)
  } else {
    // 임시 찜 데이터 삭제
    localStorage.removeItem('tempLikedWhiskies')
  }
}

// 로그인 시 임시 찜을 사용자 찜으로 이동
export function migrateTempLikesToUser(userId: string): void {
  if (typeof window === 'undefined') return

  const tempLikes = getUserLikedWhiskies()
  const userLikes = getUserLikedWhiskies(userId)

  // 임시 찜과 사용자 찜 합치기
  const mergedLikes = new Set([...tempLikes, ...userLikes])

  // 사용자 찜으로 저장
  const userKey = getLikedWhiskiesKey(userId)
  localStorage.setItem(userKey, JSON.stringify([...mergedLikes]))

  // 임시 찜 삭제
  localStorage.removeItem('tempLikedWhiskies')
}

// 레거시 함수들 (기존 코드 호환성을 위해 유지)
export function addLike(whiskyId: string): void {
  const result = toggleLike(whiskyId)
  // 이미 찜한 상태라면 아무것도 하지 않음
}

export function removeLike(whiskyId: string): void {
  const result = toggleLike(whiskyId)
  // 이미 찜하지 않은 상태라면 아무것도 하지 않음
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