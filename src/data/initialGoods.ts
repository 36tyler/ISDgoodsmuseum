import { GoodsItem } from '../types';
import { DEFAULT_ABOUT_ISEGYE } from './aboutIsegyeData';
import { DEFAULT_CUSTOM_GRADIENT } from '../utils/gradientUtils';

export const INITIAL_GOODS: GoodsItem[] = [
  {
    id: 'goods-001',
    title: "'KIDDING' 1st Full Album Special Limited LP",
    memberId: 'group',
    category: 'album',
    rarity: 'Legendary',
    releaseDate: '2023.08.18',
    releaseYear: 2023,
    originalPrice: 68000,
    currentMarketPrice: 145000,
    imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544785349-c4a5301826fd?auto=format&fit=crop&w=1200&q=80'
    ],
    description: "이세계아이돌의 폭발적인 에너지를 담은 첫 정규앨범 'KIDDING'의 한정판 12인치 바이닐 LP. 마블 바이올렛 프레싱으로 영롱한 색채감을 자랑하며, 멤버 6인의 친필 사인 인쇄 슬리브와 리릭 북이 동봉되어 있습니다.",
    components: [
      '12인치 마블 바이올렛 컬러 바이닐 (180g 헤비웨이트)',
      '디럭스 게이트폴드 아우터 자켓',
      '24페이지 올컬러 화보 및 가사집 북클릿',
      '미공개 홀로그램 스페셜 포토카드 6종 세트',
      '넘버링 한정판 보증서'
    ],
    officialUrl: 'https://cafe.naver.com/steamindiegame',
    tags: ['KIDDING', 'LP', '바이닐', '정규앨범', '한정판', '단체'],
    specs: {
      size: '315 x 315 mm',
      material: 'Vinyl, Deluxe Art Paper 350g',
      publisher: 'WAK ENTERTAINMENT',
      serialNo: 'ISEGYE-LP-001'
    },
    isOwned: true,
    isWishlist: false,
    userNote: '초판 1차 예판으로 소장 성공! 바이닐 마블 색감이 실물 깡패임.',
    favoriteCount: 384,
    isStaffPick: true,
  },
  {
    id: 'goods-002',
    title: "데뷔 1주년 'RE:WIND' 기념 프리미엄 디오라마 아크릴 스탠드",
    memberId: 'group',
    category: 'figure',
    rarity: 'Official',
    releaseDate: '2022.12.17',
    releaseYear: 2022,
    originalPrice: 38000,
    currentMarketPrice: 75000,
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80'
    ],
    description: "이세계아이돌의 기적 같은 첫 시작을 알린 데뷔곡 'RE:WIND'의 1주년을 기념하는 6인 입체 디오라마 스탠드. 계단형 3단 레이어 아크릴로 멤버들의 역동적인 포즈와 신비로운 무대 배경을 완벽히 재현했습니다.",
    components: [
      '멤버 6인 고투명 아크릴 캐릭터 플레이트 (각 120mm)',
      'RE:WIND 무대 백월 배경 플레이트 (180 x 140mm)',
      '로고 인쇄 조립형 베이스 발판',
      '데뷔 1주년 기념 골드 엠보싱 인증 카드'
    ],
    officialUrl: 'https://cafe.naver.com/steamindiegame',
    tags: ['RE:WIND', '아크릴스탠드', '디오라마', '데뷔1주년', '공식굿즈'],
    specs: {
      size: '200 x 150 x 80 mm (조립 시)',
      material: 'Cast Acrylic 3T / 5T',
      publisher: 'WAK GOODS LAB',
      serialNo: 'ISG-FIG-2212'
    },
    isOwned: true,
    isWishlist: false,
    userNote: '책상 중앙에 두고 매일 보는 최애 굿즈. 아크릴 투명도가 엄청 높음.',
    favoriteCount: 512,
    isStaffPick: true,
  },
  {
    id: 'goods-003',
    title: "아이네(INE) 시크릿 보이스 오르골 키링 & 만년필 패키지",
    memberId: 'ine',
    category: 'digital',
    rarity: 'Official',
    releaseDate: '2023.05.20',
    releaseYear: 2023,
    originalPrice: 45000,
    currentMarketPrice: 88000,
    imageUrl: 'https://images.unsplash.com/photo-1585336261026-70807b5ec090?auto=format&fit=crop&w=1200&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80'
    ],
    description: "아이네의 청아하고 깊이 있는 음색을 담은 보이스 칩이 내장된 엔틱 메탈 오르골 키링. 버튼을 누르면 아이네의 다정한 감사 인사와 감미로운 허밍 3종이 흘러나옵니다. 고급 바이올렛 만년필과 세트로 구성된 시그니처 굿즈.",
    components: [
      '앤틱 앤티크 브라스 보이스 오르골 키링 (충전식 Type-C)',
      '아이네 퍼플 각인 슬림 만년필 & 잉크 카트리지 2입',
      '친필 감사 메시지 레터지 (실링 왁스 봉인)',
      '하드커버 기프트 케이스'
    ],
    officialUrl: 'https://cafe.naver.com/steamindiegame',
    tags: ['아이네', '보이스키링', '만년필', '오르골', '둘기', '시그니처'],
    specs: {
      size: '키링: 45 x 65mm / 만년필: 138mm',
      material: '황동, 아연 합금, 래커 도장',
      publisher: 'INE ARCHIVE STUDIO',
      serialNo: 'INE-2023-SP01'
    },
    isOwned: true,
    isWishlist: false,
    userNote: '둘기 필청 아이템! 자기 전에 목소리 들으면 하루 피로가 싹 풀림.',
    favoriteCount: 420,
    isStaffPick: true,
  },
  {
    id: 'goods-004',
    title: "징버거 '달콤바삭 버거앤칩스' 극세사 모찌 쿠션 & 골드 포카",
    memberId: 'jingburger',
    category: 'apparel',
    rarity: 'Official',
    releaseDate: '2023.10.08',
    releaseYear: 2023,
    originalPrice: 32000,
    currentMarketPrice: 58000,
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80'
    ],
    description: "징버거의 귀여운 시그니처 버거 캐릭터를 입체화한 말랑말랑 쫀득한 극세사 모찌 쿠션입니다. 껴안기 딱 좋은 40cm 볼륨감과 포근한 옐로우 톤으로 일상에 힐링을 선사합니다.",
    components: [
      '버거앤칩스 모찌 모달 극세사 쿠션 (400 x 380mm)',
      '시크릿 골드박 포토카드 2종',
      '똥강아지 인증 미니 핀뱃지',
      '전용 패브릭 더스트백'
    ],
    officialUrl: 'https://cafe.naver.com/steamindiegame',
    tags: ['징버거', '쿠션', '인형', '모찌', '똥강아지', '골드포카'],
    specs: {
      size: '400 x 380 x 220 mm',
      material: '폴리에스터 95%, 스판덱스 5% (마이크로화이버 솜)',
      publisher: 'BURGER CAFE STUDIO',
      serialNo: 'JBG-CUSHION-09'
    },
    isOwned: false,
    isWishlist: true,
    userNote: '품절이라 재입고 알림 켜두고 기다리는 중 ㅠㅠ',
    favoriteCount: 295,
    isStaffPick: false,
  },
  {
    id: 'goods-005',
    title: "릴파 1st Solo Concert 'Going Out' 슬로건 타월 & 응원봉",
    memberId: 'lilpa',
    category: 'apparel',
    rarity: 'Limited',
    releaseDate: '2024.01.12',
    releaseYear: 2024,
    originalPrice: 42000,
    currentMarketPrice: 110000,
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80'
    ],
    description: "릴파의 역대급 솔로 단독 콘서트 현장을 뜨겁게 달군 공식 슬로건 타월과 무선 중앙제어 응원봉 세트. 딥 네이비와 고발색 반사 리플렉티브 소재로 콘서트장의 열기를 그대로 간직할 수 있습니다.",
    components: [
      '양면 자카드 고밀도 슬로건 스포츠 타월 (1000 x 200mm)',
      'LILPA 시그니처 엠블럼 블루투스 싱크 응원봉',
      '스트랩 및 배터리 팩',
      '콘서트 현장 미공개 라이브 포토북 (32p)'
    ],
    officialUrl: 'https://cafe.naver.com/steamindiegame',
    tags: ['릴파', '콘서트', '슬로건', '응원봉', 'GoingOut', '박쥐단'],
    specs: {
      size: '타월: 1000 x 200 mm / 응원봉: 95 x 240 mm',
      material: 'Cotton 100%, ABS, PC',
      publisher: 'LILPA THE ENTERTAINMENT',
      serialNo: 'LLP-CONCERT-2401'
    },
    isOwned: true,
    isWishlist: false,
    userNote: '콘서트 당일 눈물 펑펑 흘리면서 흔들었던 인생 굿즈. 박쥐단 영원하자!',
    favoriteCount: 630,
    isStaffPick: true,
  },
  {
    id: 'goods-006',
    title: "주르르 'Ju.Ruru No.6' 시그니처 오 드 퍼퓸 & 핑크 로즈 팬던트",
    memberId: 'jururu',
    category: 'apparel',
    rarity: 'Limited',
    releaseDate: '2023.11.24',
    releaseYear: 2023,
    originalPrice: 65000,
    currentMarketPrice: 130000,
    imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80'
    ],
    description: "주르르가 직접 향수 조향 과정에 참여하여 탄생한 플로럴 프루티 시그니처 향수. 달콤한 복숭아와 은은한 다마스크 로즈, 포근한 화이트 머스크의 잔향이 로맨틱한 분위기를 완성합니다. 한정 로즈골드 팬던트 목걸이 동봉.",
    components: [
      'Ju.Ruru No.6 오 드 퍼퓸 50ml (프랑스산 프리미엄 향료)',
      '주폭도 심볼 로즈골드 실버925 목걸이',
      '주르르 수기 조향 노트 및 향기 엽서 3종',
      '핑크 벨벳 기프트 하드박스'
    ],
    officialUrl: 'https://cafe.naver.com/steamindiegame',
    tags: ['주르르', '향수', '목걸이', '퍼퓸', '주폭도', '한정판'],
    specs: {
      size: '향수 용량 50ml / 체인 길이 45cm',
      material: '유리 보틀, 실버 925 도금',
      publisher: 'JURURU PERFUME LAB',
      serialNo: 'JRR-PERFUME-06'
    },
    isOwned: false,
    isWishlist: true,
    userNote: '향수 잔향이 진짜 너무 좋다고 후기가 자자함. 위시 1순위.',
    favoriteCount: 388,
    isStaffPick: false,
  },
  {
    id: 'goods-007',
    title: "고세구 '킹받는 세균단' 모찌 인형 & 메탈 핀뱃지 컬렉션",
    memberId: 'gosegu',
    category: 'figure',
    rarity: 'Official',
    releaseDate: '2023.09.15',
    releaseYear: 2023,
    originalPrice: 28000,
    currentMarketPrice: 49000,
    imageUrl: 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=1200&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80'
    ],
    description: "보기만 해도 킹받는 미소를 짓고 있는 고세구와 세균단 대표 캐릭터 봉제인형. 머리 위 왕관과 세균단 특유의 말랑한 바디 라인이 매력적이며, 가방에 달 수 있는 볼체인과 3종 메탈 뱃지가 함께 제공됩니다.",
    components: [
      '세균단 봉제 키링 인형 (130mm)',
      '왕관 쓴 고세구 메탈 핀뱃지 3종',
      '킹받는 대사 렌티큘러 포토카드 2종',
      '세균단 입단 증명서'
    ],
    officialUrl: 'https://cafe.naver.com/steamindiegame',
    tags: ['고세구', '세균단', '봉제인형', '키링', '핀뱃지', '천재아이돌'],
    specs: {
      size: '인형: 130 x 110 mm / 뱃지: 35 x 35 mm',
      material: 'Soft Velboa, Zinc Alloy',
      publisher: 'GOSEGU CUTE WORKS',
      serialNo: 'GSG-DOLL-2309'
    },
    isOwned: true,
    isWishlist: false,
    userNote: '백팩에 매달고 다니는데 친구들이 귀엽다고 만져봄 ㅋㅋㅋ 킹받아서 최고!',
    favoriteCount: 476,
    isStaffPick: true,
  },
  {
    id: 'goods-008',
    title: "비챤 레트로 감성 'Butterflies' 한정판 카세트 테이프 & 플레이어",
    memberId: 'viichan',
    category: 'album',
    rarity: 'Limited',
    releaseDate: '2023.07.07',
    releaseYear: 2023,
    originalPrice: 52000,
    currentMarketPrice: 95000,
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1544785349-c4a5301826fd?auto=format&fit=crop&w=1200&q=80'
    ],
    description: "비챤의 청량하고 따뜻한 어쿠스틱 솔로 음원을 아날로그 카세트 테이프로 만나는 스페셜 팩. 레트로 반투명 라임 그린 카세트 바디와 휴대용 미니 카세트 플레이어, 나비 일러스트 스티커 팩이 동봉되어 있습니다.",
    components: [
      '고음질 마스터링 아날로그 카세트 테이프 (라임 클리어 바디)',
      '비챤 커스텀 로고 포터블 테이프 플레이어 (이어폰 포함)',
      '어쿠스틱 감성 폴라로이드 사진 5종',
      '나비 홀로그램 스티커 시트'
    ],
    officialUrl: 'https://cafe.naver.com/steamindiegame',
    tags: ['비챤', '카세트', '테이프', '플레이어', 'Butterflies', '라니', '레트로'],
    specs: {
      size: '테이프: 100 x 64mm / 플레이어: 115 x 85mm',
      material: 'ABS, Magnetic Tape C-40',
      publisher: 'VIICHAN MUSIC',
      serialNo: 'VCN-TAPE-2307'
    },
    isOwned: true,
    isWishlist: false,
    userNote: '카세트 특유의 지지직거리는 아날로그 노이즈가 비챤 음색이랑 찰떡.',
    favoriteCount: 360,
    isStaffPick: false,
  },
  {
    id: 'goods-009',
    title: "이세계 페스티벌(ISEGYE FESTIVAL) 공식 파크 후드집업 & 머플러",
    memberId: 'group',
    category: 'apparel',
    rarity: 'Official',
    releaseDate: '2023.09.23',
    releaseYear: 2023,
    originalPrice: 79000,
    currentMarketPrice: 120000,
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=1200&q=80'
    ],
    description: "수많은 이파리들과 함께한 역대급 축제 '이세계 페스티벌' 공식 MD. 고중량 헤비 코튼 원단과 등판의 메탈릭 엠보 자수, 6개 멤버 컬러가 섬세하게 조화된 스트라이프 니트 머플러로 실용성과 상징성을 모두 잡았습니다.",
    components: [
      '헤비웨이트 750g 오버핏 기모 후드집업',
      '이세계 6색 블렌딩 아크릴 울 머플러 (180cm)',
      '페스티벌 VIP 리스트밴드 레플리카',
      '기념 티켓 마그넷'
    ],
    officialUrl: 'https://cafe.naver.com/steamindiegame',
    tags: ['이세계페스티벌', '후드집업', '머플러', 'MD', '의류', '단체'],
    specs: {
      size: 'FREE (오버사이즈핏) / 머플러: 1800 x 280 mm',
      material: 'Cotton 100%, Acrylic 80%, Wool 20%',
      publisher: 'WAKTA FESTIVAL MD',
      serialNo: 'FEST-23-HOOD'
    },
    isOwned: false,
    isWishlist: false,
    userNote: '겨울에 입기 딱 좋음. 재질이 짱짱함.',
    favoriteCount: 280,
    isStaffPick: false,
  },
  {
    id: 'goods-010',
    title: "이세돌 '공주 구출 작전' 공식 설정 비주얼 양장본 아트북",
    memberId: 'group',
    category: 'stationery',
    rarity: 'Legendary',
    releaseDate: '2024.03.01',
    releaseYear: 2024,
    originalPrice: 48000,
    currentMarketPrice: 85000,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80'
    ],
    description: "여섯 공주들의 세계관 비하인드 스토리, 미공개 원화, 3D 모델링 와이어프레임 및 애니메이션 콘티를 총망라한 180페이지 분량의 하드커버 양장본 아트북. 금박 타이포그래피와 책끈 책갈피가 고급스러움을 더합니다.",
    components: [
      '180페이지 올컬러 하드커버 양장본 아트북',
      '공주 구출 지도 일러스트 패브릭 포스터',
      '금박 엠보싱 책갈피 6종 세트',
      '비하인드 인터뷰 북클릿 (별책부록)'
    ],
    officialUrl: 'https://cafe.naver.com/steamindiegame',
    tags: ['아트북', '양장본', '공주구출작전', '설정집', '일러스트', '단체'],
    specs: {
      size: '220 x 300 mm (A4 변형)',
      material: 'Hardcover, 사탕수수 친환경지 160g',
      publisher: 'WAKTA ARCHIVE',
      serialNo: 'ISG-BOOK-2403'
    },
    isOwned: true,
    isWishlist: false,
    userNote: '이세돌 팬이라면 무조건 소장해야 할 마스터피스! 종이 냄새부터 고급스러움.',
    favoriteCount: 440,
    isStaffPick: true,
  },
  {
    id: 'goods-011',
    title: "주르르 '주폭도 1기' 멤버십 웰컴 키트 & 핑크 가죽 다이어리",
    memberId: 'jururu',
    category: 'stationery',
    rarity: 'Fanmade',
    releaseDate: '2023.03.14',
    releaseYear: 2023,
    originalPrice: 35000,
    currentMarketPrice: 60000,
    imageUrl: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=1200&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80'
    ],
    description: "주폭도 팬클럽을 위해 제작된 사랑스러운 베이비 핑크 인조가죽 6공 바인더 다이어리와 웰컴 기프트 팩. 주르르의 손글씨 폰트 스티커와 주폭 카드 케이스가 동봉되어 있습니다.",
    components: [
      'A6 사이즈 핑크 비건레더 6공 다이어리 커버',
      '주르르 일러스트 만년형 먼슬리/위클리 속지 120매',
      '홀로그램 PVC 카드 홀더',
      '다이어리 데코 스티커 6장 세트'
    ],
    officialUrl: 'https://cafe.naver.com/steamindiegame',
    tags: ['주르르', '다이어리', '주폭도', '문구', '웰컴키트'],
    specs: {
      size: '135 x 190 mm (A6 바인더)',
      material: 'PU Vegan Leather, 모조지 120g',
      publisher: 'JURURU FAN CLUB',
      serialNo: 'JRR-FC-01'
    },
    isOwned: false,
    isWishlist: true,
    userNote: '팬메이드인데도 공식 퀄리티 뺨침. 디자인이 너무 예뻐서 소장하고 싶음.',
    favoriteCount: 215,
    isStaffPick: false,
  },
  {
    id: 'goods-012',
    title: "아이네 & 고세구 유닛 '그랜드 부다페스트' 한정 렌티큘러 엽서북",
    memberId: 'ine',
    category: 'stationery',
    rarity: 'Collab',
    releaseDate: '2024.02.14',
    releaseYear: 2024,
    originalPrice: 24000,
    currentMarketPrice: 42000,
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80'
    ],
    description: "아이네의 우아함과 고세구의 상큼함이 만난 스페셜 유닛 프로젝트 기념 렌티큘러 엽서 세트. 각도에 따라 표정과 배경이 살아 움직이는 3D 모션 효과가 적용된 10장의 프리미엄 엽서북입니다.",
    components: [
      '각도 변환 3D 렌티큘러 엽서 10매 (바인더형)',
      '시크릿 페어 유닛 셀카 포토카드 2매',
      '골드 리본 선물용 패키지 케이스'
    ],
    officialUrl: 'https://cafe.naver.com/steamindiegame',
    tags: ['아이네', '고세구', '유닛', '렌티큘러', '엽서북', '콜라보'],
    specs: {
      size: '105 x 150 mm (4 x 6 inch)',
      material: 'PET Lenticular Lens 75lpi',
      publisher: 'DUO PROJECT',
      serialNo: 'INE-GSG-2402'
    },
    isOwned: false,
    isWishlist: false,
    userNote: '각도 돌릴 때마다 표정 바뀌는 게 신기함!',
    favoriteCount: 310,
    isStaffPick: false,
  }
];

export const DEFAULT_SITE_TEXTS: import('../types').SiteTexts = {
  headerBadge: 'ARCHIVE V2.5',
  tabAllLabel: '도감',
  tabOwnedLabel: '소장함',
  tabWishlistLabel: '위시',
  aboutButtonLabel: '이세계아이돌이란?',
  searchPlaceholder: "굿즈 이름, 멤버, 태그 검색... ('KIDDING', 'LP')",
  statsTotalGoodsLabel: '전체 굿즈',
  statsTotalUnit: '품목',
  statsCollectionRateLabel: '나의 수집률',
  statsWishlistLabel: '위시리스트',
  statsWishlistUnit: '소장희망',
  emptySearchTitle: '조건에 맞는 굿즈를 찾지 못했습니다',
  emptySearchDesc: '검색어를 변경하거나 필터를 초기화해보세요. 관리자 모드에서 새로운 굿즈를 도감에 등록할 수도 있습니다.',
  footerDesc: '이세계아이돌(아이네, 징버거, 릴파, 주르르, 고세구, 비챤)의 모든 소중한 순간들을 기록합니다.',
  footerDisclaimer: '본 아카이빙 웹사이트는 이세계아이돌의 팬 큐레이션 목적으로 제작된 비공식 아카이브입니다.',
  footerCopyright: '© 2024 ISEGYE IDOL GOODS ARCHIVE PROJECT. All Rights Reserved.',
  wakzooLinkLabel: '왁물원 팬카페',
  youtubeLinkLabel: '공식 유튜브',
  tagFilterActiveText: '태그 필터 활성화',
  ownedTabAnnouncement: '소장 완료 도감',
  wishlistTabAnnouncement: '위시리스트 보관함',
};

export const DEFAULT_SITE_CONFIG: import('../types').SiteConfig = {
  siteTitle: "이세계아이돌 공주들 소장품 박물관",
  siteSubtitle: "ISEGYE IDOL GOODS MUSEUM",
  heroHeadline: "여섯 공주들의 소중한 보물들을 기록하는 박물관",
  heroDescription: "이세계에서 온 여섯 명의 아이돌(아이네, 징버거, 릴파, 주르르, 고세구, 비챤)의 공식 앨범, 콘서트 기념품, 한정판 굿즈를 한곳에 모아 감상하고 나의 소장품을 기록하세요.",
  storyTitle: "🏛️ '공주들 소장품 박물관'이란 어떤 곳인가요?",
  storySubtitle: '👑 "이세계에서 온 여섯 명의 공주님들이 우리에게 남겨준 보물들"',
  storyContent: "'이세계아이돌 공주들 소장품 박물관'은 데뷔곡 'RE:WIND'부터 'KIDDING', 솔로 콘서트와 페스티벌에 이르기까지, 이세계아이돌이 걸어온 기적 같은 여정을 담은 공식 음반, 의류, 피규어, 응원봉, 한정판 굿즈를 하나도 빠짐없이 아카이빙하기 위해 제작된 팬 큐레이션 도감입니다.",
  storyNotice: "* 소장 중인 굿즈를 체크하여 나의 수집률을 실시간으로 확인하고, 위시리스트를 작성하여 나만의 소장 도감을 완성해보세요.",
  accentTheme: 'default',
  fontFamily: 'pretendard',
  cardDensity: 'normal',
  showHeroBanner: true,
  metaTitle: "이세계아이돌 공주들 소장품 박물관 | 이세돌 굿즈 아카이브",
  metaDescription: "이세계아이돌(ISEGYE IDOL) 공식 및 팬 굿즈, 앨범, 콘서트 기념품을 체계적으로 기록하고 감상하는 고품격 소장품 박물관",
  ogImageUrl: "/bg-isegye.jpg",
  officialLinks: {
    wakzoo: "https://cafe.naver.com/steamindiegame",
    youtube: "https://www.youtube.com/@isegyeidol",
    twitter: "https://twitter.com/isegye_idol",
    weverse: "https://weverse.io",
  },
  aboutIsegye: DEFAULT_ABOUT_ISEGYE,
  siteTexts: DEFAULT_SITE_TEXTS,
  customGradient: DEFAULT_CUSTOM_GRADIENT,
};
