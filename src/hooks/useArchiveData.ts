import {useEffect,useMemo,useRef,useSyncExternalStore} from 'react';
import {ArchiveStore,SharedCatalog} from '../utils/archiveStore';
import {INITIAL_GOODS,DEFAULT_SITE_CONFIG} from '../data/initialGoods';
import {INITIAL_NEWS,STORAGE_KEY_NEWS} from '../data/initialNews';
import {DEFAULT_CATEGORIES} from '../data/members';
function initialCatalog():SharedCatalog {
 const read=(key:string,fallback:unknown)=>{try{const value=localStorage.getItem(key);return value?JSON.parse(value):fallback;}catch{return fallback;}};
 return {goods:read('isegye_goods_archive_items_v2',INITIAL_GOODS),news:read(STORAGE_KEY_NEWS,INITIAL_NEWS),categories:read('isegye_goods_archive_categories_v2',DEFAULT_CATEGORIES),config:{...DEFAULT_SITE_CONFIG,...read('isegye_goods_archive_config_v2',{})}} as SharedCatalog;
}
function browserStorage():Pick<Storage,'getItem'|'setItem'> {
 try {return window.localStorage;}catch{return {getItem:()=>null,setItem:()=>{throw new Error('Browser storage unavailable');}};}
}
export function useArchiveData(isAdmin:boolean) {
 const ref=useRef<ArchiveStore|null>(null);
 if(!ref.current){try{ref.current=new ArchiveStore(initialCatalog(),browserStorage());}catch{ref.current=new ArchiveStore({goods:INITIAL_GOODS,news:INITIAL_NEWS,categories:DEFAULT_CATEGORIES,config:DEFAULT_SITE_CONFIG},browserStorage());}}
 const store=ref.current;
 store.setAdmin(isAdmin);
 const state=useSyncExternalStore(store.subscribe,store.getSnapshot);
 const goods=useMemo(()=>store.getGoods(),[store,state.data.goods,state.personal]);
 useEffect(()=>{
  void store.refresh();
  const refresh=()=>{if(!document.hidden)store.refreshIfStale();};
  const timer=window.setInterval(refresh,60000+Math.floor(Math.random()*15000));
  const personalChanged=(event:StorageEvent)=>{if(event.key==='isegye_personal_collection_v3')store.syncPersonalFromStorage();};
  window.addEventListener('storage',personalChanged);
  window.addEventListener('focus',refresh);window.addEventListener('online',refresh);document.addEventListener('visibilitychange',refresh);
  return()=>{clearInterval(timer);window.removeEventListener('storage',personalChanged);window.removeEventListener('focus',refresh);window.removeEventListener('online',refresh);document.removeEventListener('visibilitychange',refresh);};
 },[store]);
 useEffect(()=>{if(!isAdmin||!state.dirty||state.saving||state.paused||state.conflict)return;const timer=setTimeout(()=>void store.save(),1200);return()=>clearTimeout(timer);},[store,isAdmin,state.data,state.dirty,state.saving,state.paused,state.conflict]);
 useEffect(()=>{
  if(!state.dirty&&!state.personalPending)return;
  const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};
  window.addEventListener('beforeunload',warn);
  return()=>window.removeEventListener('beforeunload',warn);
 },[state.dirty,state.personalPending]);
 return {goods,setGoods:store.setGoods,config:state.data.config,setConfig:store.setConfig,categories:state.data.categories,setCategories:store.setCategories,news:state.data.news,setNews:store.setNews,state,save:()=>store.save(),refresh:(discard=false)=>store.refresh(discard,true),publishInitial:store.publishInitial};
}
