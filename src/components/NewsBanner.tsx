import { isNewsImageUrl } from '../utils/newsUrls';
import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  ExternalLink,
  Plus,
  Edit3,
  Trash2,
  X,
  Camera,
  Image as ImageIcon,
  Pin,
  Sparkles,
  Link as LinkIcon,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { NewsItem } from '../types';
import { STORAGE_KEY_NEWS } from '../data/initialNews';
import { NewsAttachmentsEditor, getNewsImages, getNewsLinks } from './NewsAttachmentsEditor';
import { renderCustomText } from '../utils/textFormatter';

interface NewsBannerProps {
  newsList: NewsItem[];
  onUpdateNewsList: (newList: NewsItem[]) => void;
  isAdmin: boolean;
  onOpenLogin?: () => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'heart' | 'bookmark') => void;
  isDarkMode?: boolean;
}

export const NewsBanner: React.FC<NewsBannerProps> = ({
  newsList,
  onUpdateNewsList,
  isAdmin,
  onOpenLogin,
  onShowToast,
  isDarkMode = false,
}) => {
  const [selectedDetailNews, setSelectedDetailNews] = useState<NewsItem | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [showAllNews, setShowAllNews] = useState(false);
  useEffect(() => {
    setSelectedDetailNews(previous => previous ? newsList.find(item => item.id === previous.id) || null : null);
  }, [newsList]);

  // Form states for adding / editing news
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTag, setFormTag] = useState<'공지' | '신규 굿즈' | '이벤트' | '업데이트' | string>('공지');
  const tagOptions = Array.from(new Set(['공지', '신규 굿즈', '이벤트', '업데이트', '콘서트', ...newsList.map(item => item.tag?.trim()).filter((tag): tag is string => Boolean(tag))]));
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formLinks, setFormLinks] = useState<{ url: string; label: string }[]>([]);
  const [formIsPinned, setFormIsPinned] = useState(false);

  const handleStartCreate = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormContent('');
    setFormTag('공지');
    setFormImages([]);
    setFormLinks([]);
    setFormIsPinned(false);
    setIsAdminModalOpen(true);
  };

  const handleStartEdit = (item: NewsItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingItem(item);
    setFormTitle(item.title);
    setFormContent(item.content);
    setFormTag(item.tag || '공지');
    setFormImages(getNewsImages(item));
    setFormLinks(getNewsLinks(item));
    setFormIsPinned(Boolean(item.isPinned));
    setIsAdminModalOpen(true);
  };

  const handleSaveNewsForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingPhotos) { onShowToast("사진 처리가 끝난 후 저장해주세요.", "info"); return; }
    if (!formTitle.trim()) {
      alert('소식 제목을 입력해주세요.');
      return;
    }

    const imageUrls = formImages.map(url => url.trim()).filter(Boolean);
    const links = formLinks.filter(link => link.url.trim()).map(link => ({ url: link.url.trim(), label: link.label.trim() }));
    if (imageUrls.some(url => !isNewsImageUrl(url)) || links.some(link => !/^https?:\/\//i.test(link.url))) {
      onShowToast('이미지와 링크 주소는 http:// 또는 https://로 입력해주세요.', 'info');
      return;
    }
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

    if (editingItem) {
      // Update existing
      const updatedList = newsList.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              title: formTitle.trim(),
              content: formContent.trim(),
              tag: formTag.trim() || '공지',
              imageUrls,
              imageUrl: imageUrls[0],
              links,
              linkUrl: links[0]?.url,
              linkLabel: links[0]?.label,
              isPinned: formIsPinned,
            }
          : item
      );
      try { localStorage.setItem(STORAGE_KEY_NEWS, JSON.stringify(updatedList)); } catch { onShowToast('저장 공간이 부족합니다. 사진 수를 줄이거나 이미지 URL을 사용해주세요.', 'info'); return; }
      onUpdateNewsList(updatedList);
      if (selectedDetailNews?.id === editingItem.id) setSelectedDetailNews(updatedList.find(item => item.id === editingItem.id) || null);
      onShowToast(`'${formTitle}' 소식이 수정되었습니다.`, 'success');
    } else {
      // Create new
      const newItem: NewsItem = {
        id: `news-${Date.now()}`,
        title: formTitle.trim(),
        content: formContent.trim(),
        tag: formTag.trim() || '공지',
        imageUrls,
        imageUrl: imageUrls[0],
        links,
        linkUrl: links[0]?.url,
        linkLabel: links[0]?.label,
        date: todayStr,
        isPinned: formIsPinned,
      };
      // If pinned, add to top
      const newList = formIsPinned ? [newItem, ...newsList] : [...newsList, newItem];
      try { localStorage.setItem(STORAGE_KEY_NEWS, JSON.stringify(newList)); } catch { onShowToast('저장 공간이 부족합니다. 사진 수를 줄이거나 이미지 URL을 사용해주세요.', 'info'); return; }
      onUpdateNewsList(newList);
      onShowToast('새로운 소식이 등록되었습니다!', 'success');
    }

    setIsAdminModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteNews = (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`'${title}' 소식을 정말 삭제하시겠습니까?`)) return;
    const filtered = newsList.filter((item) => item.id !== id);
    onUpdateNewsList(filtered);
    if (selectedDetailNews?.id === id) {
      setSelectedDetailNews(null);
    }
    onShowToast('소식이 삭제되었습니다.', 'info');
  };

  const getTagBadgeStyle = (tag?: string) => {
    switch (tag) {
      case '공지':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case '신규 굿즈':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case '이벤트':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case '업데이트':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  // Determine items to display (if showAllNews is false and more than 3, display top 3; otherwise all)
  const displayedNews = showAllNews ? newsList : newsList.slice(0, 3);

  return (
    <>
      {/* Main Banner Container - Pure White Color & Multi-News View (색깔은 하얀색으로, 소식 여러 개 노출) */}
      <div className="py-2.5 border-t border-slate-100 dark:border-slate-800/80">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-3.5 shadow-xs transition-all space-y-3">
          {/* Top Header Bar: 📢 '새로운 소식' Title Badge, Count, and Admin Button */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white text-black border border-slate-200 text-xs font-extrabold shadow-2xs">
                <span aria-hidden="true">📢</span>
                <span>새로운 소식</span>
              </div>

              <span className="news-count text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                총 <strong className="text-current">{newsList.length}</strong>개의 공지 및 업데이트
              </span>
            </div>

            <div className="flex items-center gap-2">
              {newsList.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllNews(!showAllNews)}
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-0.5 transition-colors"
                >
                  <span>{showAllNews ? '간략히 보기' : `전체 보기 (${newsList.length})`}</span>
                  {showAllNews ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* Admin News Management Action Button */}
              {isAdmin ? (
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors"
                  title="관리자: 새로운 소식 등록 및 수정"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>소식 관리</span>
                </button>
              ) : onOpenLogin ? (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="hidden sm:flex items-center gap-1 px-2 py-1 text-[11px] text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors dark:text-slate-300"
                >
                  <span>관리자 등록</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Multi-News Cards Grid (소식 여러 개를 한 번에 볼 수 있는 화이트 카드 그리드) */}
          {newsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {displayedNews.map((news) => (
                <div
                  key={news.id}
                  onClick={() => setSelectedDetailNews(news)}
                  className="bg-white dark:bg-slate-850 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-purple-300 dark:hover:border-purple-600 transition-all hover:shadow-xs flex flex-col justify-between group cursor-pointer"
                  title="클릭하여 상세 소식 보기"
                >
                  <div className="space-y-2">
                    {/* Top Row: Tag, Pin, Date, and Admin Quick Edit */}
                    <div className="flex items-center justify-between gap-1 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold border ${getTagBadgeStyle(
                            news.tag
                          )}`}
                        >
                          {news.tag || '공지'}
                        </span>
                        {news.isPinned && (
                          <span className="flex items-center gap-0.5 text-amber-800 dark:text-amber-300 font-bold">
                            <Pin className="w-2.5 h-2.5 fill-amber-500" />
                            <span>고정</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-slate-600 font-mono dark:text-slate-300">{news.date}</span>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => handleStartEdit(news, e)}
                            className="p-1 text-slate-600 hover:text-purple-600 dark:hover:text-purple-400 rounded transition-colors dark:text-slate-300"
                            title="이 소식 수정"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Middle: Attached Image & Title */}
                    <div className="flex items-start gap-2.5">
                      {getNewsImages(news).length > 0 && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
                          <img
                            src={getNewsImages(news)[0]}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
                          {renderCustomText(news.title)}
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 pt-0.5">
                          {news.content}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Attached Link Button (if attached) - '자세히' 버튼은 제거됨 */}
                  {getNewsLinks(news).length > 0 && (
                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col items-start gap-2">
                      {getNewsLinks(news).map((link, linkIndex) => <a
                        key={linkIndex}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="theme-readable-text inline-flex items-center gap-1 text-[11px] font-bold hover:underline"
                        title={link.url}
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">
                          {link.label || '관련 링크 바로가기'}
                        </span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-600 italic dark:text-slate-300">
              등록된 새로운 소식이 없습니다. 관리자 모드에서 소식을 추가해보세요.
            </div>
          )}
        </div>
      </div>

      {/* 1. News Detail Modal for viewing full text and photo */}
      {selectedDetailNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Megaphone className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    <span>이세돌 아카이브 새로운 소식</span>
                  </h3>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300">공식 공지 및 굿즈 출시 안내</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      const item = selectedDetailNews;
                      setSelectedDetailNews(null);
                      handleStartEdit(item);
                    }}
                    className="p-1.5 text-slate-600 hover:text-purple-600 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors dark:text-slate-300"
                    title="이 소식 수정하기"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">수정</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedDetailNews(null)}
                  className="p-1.5 text-slate-600 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors dark:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="min-h-0 p-5 sm:p-6 overflow-y-auto space-y-4">
              {/* Meta row */}
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold border ${getTagBadgeStyle(
                      selectedDetailNews.tag
                    )}`}
                  >
                    {selectedDetailNews.tag || '공지'}
                  </span>
                  {selectedDetailNews.isPinned && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                      <Pin className="w-3 h-3 fill-amber-500" />
                      <span>중요 공지</span>
                    </span>
                  )}
                </div>
                <span className="font-mono">{selectedDetailNews.date}</span>
              </div>

              {/* Title */}
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                {renderCustomText(selectedDetailNews.title)}
              </h2>

              {/* Attached Photo */}
              {getNewsImages(selectedDetailNews).map((imageUrl, imageIndex) => (
                <div key={imageIndex} className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xs">
                  <img
                    src={imageUrl}
                    alt={`${selectedDetailNews.title} 사진 ${imageIndex + 1}`}
                    className="w-full max-h-[360px] object-contain bg-black/5"
                  />
                </div>
              ))}

              {/* Body Text */}
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                {renderCustomText(selectedDetailNews.content)}
              </div>

              {/* Attached Link Banner */}
              {getNewsLinks(selectedDetailNews).map((link, linkIndex) => (
                <div key={linkIndex} className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-2 bg-purple-600 text-white rounded-xl shrink-0">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block">
                        관련 링크 안내
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {link.label || '공식 페이지 바로가기'}
                      </p>
                    </div>
                  </div>

                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs transition-all"
                  >
                    <span>바로가기</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="shrink-0 p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedDetailNews(null)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Admin News Management & Editor Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-xl">
                  <Edit3 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    <span>{editingItem ? '소식 수정하기' : '새로운 소식 등록 및 관리'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full font-mono font-bold">
                      ADMIN
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300">
                    상단 '새로운 소식' 영역에 노출될 글, 사진, 링크를 자유롭게 작성하세요
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="소식 편집 닫기"
                disabled={uploadingPhotos}
                onClick={() => setIsAdminModalOpen(false)}
                className="p-1.5 text-slate-600 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors dark:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form & Management List */}
            <div className="min-h-0 p-5 sm:p-6 overflow-y-auto space-y-6">
              {/* Form Section */}
              <form onSubmit={handleSaveNewsForm} className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>{editingItem ? '선택된 소식 내용 편집' : '새 소식 글·사진·링크 작성'}</span>
                  </span>

                  {/* Title & Tag */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="sm:col-span-3">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        소식 제목 *
                      </label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="예: [공지] 2024 이세돌 단체 굿즈 아카이브 업데이트"
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        분류 태그
                      </label>
                      <select
                        aria-label="분류 태그 선택"
                        value={tagOptions.includes(formTag) ? formTag : ''}
                        onChange={event => setFormTag(event.target.value)}
                        className="w-full px-2.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        {tagOptions.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                        <option value="">직접 입력</option>
                      </select>
                      <input
                        type="text"
                        aria-label="분류 태그"
                        value={formTag}
                        onChange={event => setFormTag(event.target.value)}
                        onKeyDown={event => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) event.preventDefault(); }}
                        placeholder="새 태그 직접 입력"
                        className="mt-2 w-full px-2.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                      />
                      <p className="mt-1 text-[10px] text-slate-600 dark:text-slate-300">목록에서 선택하거나 직접 입력 후 저장하세요.</p>
                    </div>
                  </div>

                  {/* Content Body Text */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      소식 본문 글 *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      placeholder="팬들에게 전할 상세 공지 내용, 굿즈 발매 정보, 행사 일정 등을 자세히 적어주세요."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-purple-500 leading-relaxed"
                    />
                  </div>

                  <NewsAttachmentsEditor images={formImages} links={formLinks} onBusyChange={setUploadingPhotos} onImagesChange={setFormImages} onLinksChange={setFormLinks} onError={message => onShowToast(message, 'info')} />

                  {/* Pin Option */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={formIsPinned}
                        onChange={(e) => setFormIsPinned(e.target.checked)}
                        className="w-4 h-4 rounded accent-purple-600"
                      />
                      <span>📌 목록 상단에 항상 고정 (중요 공지)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      {editingItem && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(null);
                            setFormTitle('');
                            setFormContent('');
                            setFormImages([]);
                            setFormLinks([]);
                            setFormTag('공지');
                          }}
                          className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 rounded-lg font-semibold"
                        >
                          편집 취소
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={uploadingPhotos}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{editingItem ? '수정 내용 저장' : '소식 등록하기'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Existing News List Management */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>📋 등록된 소식 목록 ({newsList.length}건)</span>
                  </h4>
                  <span className="text-[10px] text-slate-600 dark:text-slate-300">클릭하여 즉시 수정하거나 삭제할 수 있습니다.</span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {newsList.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-xs font-mono text-slate-600 font-bold shrink-0 dark:text-slate-300">
                          #{idx + 1}
                        </span>

                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getTagBadgeStyle(
                                item.tag
                              )}`}
                            >
                              {item.tag || '공지'}
                            </span>
                            {item.isPinned && (
                              <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                                <Pin className="w-2.5 h-2.5 fill-amber-500" />
                                <span>고정</span>
                              </span>
                            )}
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {renderCustomText(item.title)}
                            </h5>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-md pt-0.5">
                            {item.content}
                          </p>
                          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300">{item.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleStartEdit(item, e)}
                          className="p-1.5 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/60 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          title="소식 수정"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">수정</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteNews(item.id, item.title, e)}
                          className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          title="소식 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Close Bar */}
            <div className="shrink-0 p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-300">
                작성 및 수정된 소식은 사이트 상단에 실시간으로 반영됩니다.
              </span>
              <button
                type="button"
                aria-label="소식 편집 닫기"
                disabled={uploadingPhotos}
                onClick={() => setIsAdminModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
