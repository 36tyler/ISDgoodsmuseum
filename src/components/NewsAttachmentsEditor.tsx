import React, { useRef, useState } from 'react';
import { NewsItem } from '../types';

export const getNewsImages = (item: NewsItem) => item.imageUrls ?? (item.imageUrl ? [item.imageUrl] : []);
export const getNewsLinks = (item: NewsItem) => item.links ?? (item.linkUrl ? [{ url: item.linkUrl, label: item.linkLabel || '' }] : []);
type Link = { url: string; label: string };
const inputClass = 'min-w-0 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white';
const buttonClass = 'px-3 py-2 text-xs font-bold rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-800 text-purple-800 dark:text-purple-200';

async function readPhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'].includes(file.type)) throw Error('JPG, PNG, WebP 등 이미지 파일을 선택해주세요.');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image(); image.src = url; await image.decode();
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw Error('사진을 읽을 수 없습니다. 다시 선택해주세요.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/webp', 0.82);
  } finally { URL.revokeObjectURL(url); }
}

export function NewsAttachmentsEditor({ images, links, onImagesChange, onLinksChange, onError, onBusyChange }: {
  images: string[]; links: Link[]; onImagesChange: (images: string[]) => void;
  onLinksChange: (links: Link[]) => void; onError: (message: string) => void; onBusyChange: (busy: boolean) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  return <>
    <fieldset disabled={uploading} className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-3">
      <legend className="text-xs font-bold text-slate-800 dark:text-slate-200">사진 첨부 (여러 장 선택 가능)</legend>
      <div className="flex flex-wrap gap-2">
        <input ref={fileInput} aria-label="사진 파일 선택" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="hidden" onChange={async event => {
          const files = Array.from(event.target.files || []); event.target.value = '';
          if (!files.length) return;
          setUploading(true); onBusyChange(true);
          try {
            const photos: string[] = [];
            for (const file of files) photos.push(await readPhoto(file));
            onImagesChange([...images, ...photos]);
          } catch (error) { onError(error instanceof Error ? error.message : '사진을 불러오지 못했습니다.'); }
          finally { setUploading(false); onBusyChange(false); }
        }} />
        <button type="button" className={buttonClass} onClick={() => fileInput.current?.click()}>{uploading ? '사진 처리 중…' : '내 PC에서 사진 올리기'}</button>
        <button type="button" className={buttonClass} onClick={() => onImagesChange([...images, ''])}>이미지 URL 추가</button>
      </div>
      <div className="space-y-2">
        {images.map((url, index) => <div key={index} className="flex items-center gap-2">
          {url && <img src={url} alt={`첨부 사진 ${index + 1} 미리보기`} className="h-16 w-16 rounded-lg object-contain bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600" />}
          {url.startsWith('data:') ? <span className="flex-1 text-xs text-slate-700 dark:text-slate-300">첨부 사진 {index + 1}</span> : <input type="url" aria-label={`이미지 URL ${index + 1}`} placeholder="https://… 이미지 주소" value={url} onChange={event => onImagesChange(images.map((value, i) => i === index ? event.target.value : value))} className={inputClass} />}
          <button type="button" className={buttonClass} aria-label={`사진 ${index + 1} 삭제`} onClick={() => onImagesChange(images.filter((_, i) => i !== index))}>삭제</button>
        </div>)}
      </div>
    </fieldset>
    <fieldset className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-3">
      <legend className="text-xs font-bold text-slate-800 dark:text-slate-200">관련 링크 첨부</legend>
      {links.map((link, index) => <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        <input aria-label={`링크 이름 ${index + 1}`} placeholder="링크 버튼 이름" className={inputClass} value={link.label} onChange={event => onLinksChange(links.map((value, i) => i === index ? { ...value, label: event.target.value } : value))} />
        <input type="url" aria-label={`링크 URL ${index + 1}`} placeholder="https://…" className={inputClass} value={link.url} onChange={event => onLinksChange(links.map((value, i) => i === index ? { ...value, url: event.target.value } : value))} />
        <button type="button" className={buttonClass} aria-label={`링크 ${index + 1} 삭제`} onClick={() => onLinksChange(links.filter((_, i) => i !== index))}>삭제</button>
      </div>)}
      <button type="button" className={buttonClass} onClick={() => onLinksChange([...links, { url: '', label: '' }])}>링크 추가</button>
    </fieldset>
    {uploading && <p role="status" className="text-xs text-slate-700 dark:text-slate-300">사진을 준비하고 있어요. 완료 후 저장해주세요.</p>}
  </>;
}
