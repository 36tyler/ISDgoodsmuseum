import { NewsItem } from '../types';

export const STORAGE_KEY_NEWS = 'isegye_goods_archive_news_v2';

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'news-001',
    title: '📢 [공지] 이세계아이돌 공식 굿즈 아카이브 박물관 정식 오픈 & 실시간 업데이트 안내',
    content:
      '이세계아이돌 여섯 공주님들의 소중한 보물들을 기록하는 팬 아카이브 도감이 새롭게 오픈되었습니다!\n\n데뷔곡 RE:WIND부터 KIDDING, 솔로 콘서트 MD까지 모든 굿즈를 소장함에 체크하고 위시리스트를 작성해보세요. 신규 굿즈 출시 정보 및 예판 일정이 수시로 업데이트됩니다.',
    imageUrl: '/bg-isegye.jpg',
    linkLabel: '왁물원 공식 공지 확인하기',
    linkUrl: 'https://cafe.naver.com/steamindiegame',
    date: '2024.11.07',
    tag: '공지',
    isPinned: true,
  },
  {
    id: 'news-002',
    title: '✨ [신규 굿즈] 2024 이세돌 단체 앨범 & 6인 멤버별 솔로 MD 도감 등록 완료',
    content:
      '최근 출시된 한정판 LP 패키지, 아크릴 스탠드 키트, 공식 응원봉 V2 및 콘서트 한정 굿즈들이 도감에 모두 등록되었습니다. 검색창에서 원하는 멤버나 카테고리를 검색하여 상세 정보와 구성품을 확인해보세요.',
    imageUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    linkLabel: '신규 굿즈 보러가기',
    linkUrl: 'https://cafe.naver.com/steamindiegame',
    date: '2024.11.05',
    tag: '신규 굿즈',
    isPinned: false,
  },
  {
    id: 'news-003',
    title: '👑 [이벤트] 나만의 컬렉션 수집률 달성 & 위시리스트 공유 이벤트 안내',
    content:
      '내가 소장한 이세돌 굿즈에 [소장함] 체크를 누르고 수집률을 채워보세요! 상단의 [위시] 기능을 이용해 다음 목표 굿즈를 저장해둘 수도 있습니다.',
    imageUrl:
      'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80',
    linkLabel: '이벤트 자세히 보기',
    linkUrl: 'https://cafe.naver.com/steamindiegame',
    date: '2024.11.01',
    tag: '이벤트',
    isPinned: false,
  },
];
