import React, {useState} from 'react';
import {CategoryItem, GoodsItem} from '../types';
import {getGoodsKind} from '../utils/goodsKind';
export function GoodsKindManager({kinds, goods, onChange}: {kinds:CategoryItem[];goods:GoodsItem[];onChange:(value:CategoryItem[])=>void}) {
  const [name,setName]=useState('');
  const [editing,setEditing]=useState<string|null>(null);
  const [draft,setDraft]=useState('');
  const [error,setError]=useState('');
  function valid(label:string, id?:string) {
    if (!label.trim()) {setError('종류 이름을 입력해주세요.');return false;}
    if (kinds.some(kind=>kind.id!==id && kind.label===label.trim())) {setError('같은 이름의 종류가 있습니다.');return false;}
    setError('');return true;
  }
  return <section aria-label="굿즈 종류 관리" className="p-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 space-y-3">
    <h3 className="text-sm font-bold">굿즈 종류 관리</h3>
    <p className="text-xs text-slate-600 dark:text-slate-300">이름 변경과 종류 추가는 도감, 굿즈 수정, 계산기에 함께 반영됩니다. 사용 중인 종류는 굿즈를 다른 종류로 옮긴 뒤 삭제할 수 있습니다.</p>
    {kinds.map(kind=>{
      const count=goods.filter(item=>getGoodsKind(item.rarity)===kind.id).length;
      return <div key={kind.id} className="flex flex-wrap items-center gap-2 text-xs">
        {editing===kind.id ? <><input aria-label="종류 이름 수정" maxLength={30} value={draft} onChange={e=>setDraft(e.target.value)} className="flex-1 min-w-28 border rounded-lg px-2 py-2 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600" />
          <button type="button" onClick={()=>{if(valid(draft,kind.id)){onChange(kinds.map(item=>item.id===kind.id?{...item,label:draft.trim()}:item));setEditing(null);}}} className="px-3 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black">저장</button>
          <button type="button" onClick={()=>{setEditing(null);setError('');}}>취소</button></> : <><span className="flex-1 font-bold">{kind.label} <span className="font-normal text-slate-600 dark:text-slate-300">({count}개)</span></span><button type="button" onClick={()=>{setEditing(kind.id);setDraft(kind.label);setError('');}} className="border rounded-lg px-3 py-2 border-slate-300 dark:border-slate-600">이름 수정</button></>}
        <button type="button" disabled={count>0||kinds.length<=1} title={count?'사용 중인 종류입니다.':kinds.length<=1?'종류는 최소 1개가 필요합니다.':'종류 삭제'} onClick={()=>{onChange(kinds.filter(item=>item.id!==kind.id));if(editing===kind.id)setEditing(null);}} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-40">삭제</button>
      </div>;
    })}
    <div className="flex gap-2"><input value={name} onChange={e=>setName(e.target.value)} maxLength={30} aria-label="새 종류 이름" placeholder="새 종류 이름" className="min-w-0 flex-1 rounded-lg px-3 py-2 text-xs border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" /><button type="button" onClick={()=>{if(valid(name)){onChange([...kinds,{id:`kind-${crypto.randomUUID()}`,label:name.trim()}]);setName('');}}} className="px-3 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-bold">종류 추가</button></div>
    {error&&<p role="alert" className="text-xs text-red-700 dark:text-red-300">{error}</p>}
  </section>;
}
