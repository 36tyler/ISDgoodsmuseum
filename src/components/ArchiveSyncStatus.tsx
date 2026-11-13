import React from 'react';
import {ArchiveState} from '../utils/archiveStore';
interface Props {state:ArchiveState;isAdmin:boolean;onRetry:()=>void;onPublish:()=>void;onReload:()=>void;onRefresh:()=>void;}
export function ArchiveSyncStatus({state,isAdmin,onRetry,onPublish,onReload,onRefresh}:Props) {
 const backup=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({...state.data,version:'shared-1',revision:state.revision},null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='isegye-shared-draft.json';link.click();URL.revokeObjectURL(url);};
 if(!isAdmin&&!state.error&&!state.storageError&&!state.dirty)return null;
 return <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-3" role="status" aria-live="polite">
  <div className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-slate-100 space-y-2">
   {isAdmin&&<><p className="font-bold">{state.saving?'공용 변경사항을 저장하고 있습니다…':state.conflict?'다른 관리자 또는 탭의 변경사항과 충돌했습니다.':state.dirty?'공용 변경사항이 아직 저장되지 않았습니다.':!state.ready?'공용 저장소 연결을 확인하고 있습니다.':!state.initialized?'공용 도감을 처음 게시해주세요.':'공용 정보가 최신 상태입니다.'}</p>
    <p className="text-slate-600 dark:text-slate-300">굿즈·공지·설정만 공유됩니다. 소장·위시·구성품 체크·개인 메모는 각 브라우저에 보관됩니다.</p></>}
   {!isAdmin&&state.dirty&&<p>공용 변경사항이 아직 저장되지 않았습니다. 관리자 모드에 다시 로그인한 뒤 저장을 재시도해주세요.</p>}
   {state.error&&<p className="text-amber-900 dark:text-amber-200">{isAdmin?state.error:'최신 굿즈 정보를 불러오지 못했습니다. 저장된 정보를 표시합니다.'}</p>}
   {state.storageError&&<p className="text-red-800 dark:text-red-200">{state.storageError}</p>}
   <div className="flex flex-wrap gap-3 items-center">
    {isAdmin&&state.ready&&!state.dirty&&<button type="button" onClick={onRefresh} className="underline underline-offset-2">최신 공용 정보 불러오기</button>}
    {isAdmin&&state.ready&&!state.initialized&&!state.dirty&&<button type="button" onClick={onPublish} className="px-3 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black font-bold">현재 목록 공용 게시</button>}
    {!isAdmin&&state.dirty&&<p>공용 변경사항이 아직 저장되지 않았습니다. 관리자 모드에 다시 로그인한 뒤 저장을 재시도해주세요.</p>}
   {state.error&&!state.conflict&&<button type="button" disabled={state.saving} onClick={onRetry} className="underline underline-offset-2 disabled:opacity-50">다시 시도</button>}
    {state.dirty&&<button type="button" onClick={backup} className="underline underline-offset-2">변경 내용 백업</button>}
    {isAdmin&&state.conflict&&<button type="button" onClick={()=>{if(window.confirm('저장하지 못한 공용 변경사항을 버리고 서버의 최신 내용을 불러올까요? 필요한 경우 먼저 변경 내용을 백업해주세요. 개인 소장 기록은 유지됩니다.'))onReload();}} className="underline underline-offset-2">서버 최신 내용 불러오기</button>}
   </div>
  </div>
 </div>;
}
