import {GoodsItem,SiteConfig,CategoryItem,NewsItem} from '../types';
import {sanitizeCatalog,publicGoods} from '../../shared/catalog.js';
import {mergePersonal,migratePersonal,personalRecord,personalChanged,PersonalCollection} from './personalCollection';
export interface SharedCatalog {goods:GoodsItem[];config:SiteConfig;categories:CategoryItem[];news:NewsItem[];}
export interface ArchiveState {data:SharedCatalog;personal:PersonalCollection;revision:number;ready:boolean;initialized:boolean;dirty:boolean;saving:boolean;paused:boolean;conflict:boolean;error:string;storageError:string;personalPending:boolean;}
export const PERSONAL_KEY='isegye_personal_collection_v3';
export const SHARED_CACHE_KEY='isegye_shared_catalog_cache_v3';
type StorageLike=Pick<Storage,'getItem'|'setItem'>;
type Update<T>=T|((previous:T)=>T);
export class ArchiveStore {
 private state:ArchiveState;
 private listeners=new Set<()=>void>();
 private admin=false;
 private generation=0;
 private loading=false;
 private lastCheck=0;
 constructor(initial:SharedCatalog,private storage:StorageLike,private transport:typeof fetch=fetch) {
  let data=sanitizeCatalog(initial) as SharedCatalog,personal:PersonalCollection={},revision=0,initialized=false,storageError='';
  const read=(key:string)=>{try{const raw=storage.getItem(key);return raw?JSON.parse(raw):null;}catch{return null;}};
  const saved=read(SHARED_CACHE_KEY);
  if(saved){try{data=sanitizeCatalog(saved.data) as SharedCatalog;revision=Number.isSafeInteger(saved.revision)?saved.revision:0;initialized=Boolean(saved.initialized);}catch{}}
  const savedPersonal=read(PERSONAL_KEY);
  if(savedPersonal&&typeof savedPersonal==='object'&&!Array.isArray(savedPersonal))personal=savedPersonal;
  else {
   const legacy=read('isegye_goods_archive_items_v2');
   personal=migratePersonal(Array.isArray(legacy)?legacy:[]);
   try{storage.setItem(PERSONAL_KEY,JSON.stringify(personal));}catch{storageError='개인 기록을 저장할 공간이 부족합니다. 브라우저 저장 공간을 확인해주세요.';}
  }
  this.state={data,personal,revision,initialized,ready:false,dirty:false,saving:false,paused:false,conflict:false,error:'',storageError,personalPending:Boolean(storageError)};
 }
 getSnapshot=()=>this.state;
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
 setAdmin(value:boolean){this.admin=value;}
 private emit(patch:Partial<ArchiveState>){this.state={...this.state,...patch};for(const listener of this.listeners)listener();}
 private cache(){try{this.storage.setItem(SHARED_CACHE_KEY,JSON.stringify({data:this.state.data,revision:this.state.revision,initialized:this.state.initialized}));}catch{this.emit({storageError:'최신 도감 정보를 이 브라우저에 저장하지 못했습니다. 개인 기록은 별도로 보관됩니다.'});}}
 syncPersonalFromStorage=()=>{
  if(this.state.personalPending)return;
  try{const raw=this.storage.getItem(PERSONAL_KEY);if(!raw)return;const personal=JSON.parse(raw);if(personal&&typeof personal==='object'&&!Array.isArray(personal)&&JSON.stringify(personal)!==JSON.stringify(this.state.personal))this.emit({personal});}catch{}
 };
 getGoods=()=>this.state.data.goods.map(item=>mergePersonal(item,this.state.personal[item.id]));
 setGoods=(update:Update<GoodsItem[]>)=>{
  this.syncPersonalFromStorage();
  const before=this.getGoods();const next=typeof update==='function'?update(before):update;
  let personal={...this.state.personal};let changed=false;
  for(const item of next){if(personalChanged(before.find(old=>old.id===item.id),item)){personal[item.id]=personalRecord(item);changed=true;}}
  if(changed){let storageError=this.state.storageError,personalPending=false;try{this.storage.setItem(PERSONAL_KEY,JSON.stringify(personal));if(storageError.startsWith('개인'))storageError='';}catch{personalPending=true;storageError='개인 소장 기록을 저장하지 못했습니다. 저장 공간을 확인해주세요.';}this.emit({personal,storageError,personalPending});}
  const shared=next.map(item=>publicGoods(item)) as GoodsItem[];
  if(this.admin&&JSON.stringify(shared)!==JSON.stringify(this.state.data.goods))this.updatePublic('goods',shared);
 };
 private updatePublic<K extends keyof SharedCatalog>(key:K,value:SharedCatalog[K]) {
  if(!this.admin)return;
  if(!this.state.ready){this.emit({error:'최신 공용 정보를 확인한 뒤 수정해주세요. 연결 상태를 확인해주세요.'});return;}
  if(JSON.stringify(value)===JSON.stringify(this.state.data[key]))return;
  let data:SharedCatalog;
  try {data=sanitizeCatalog({...this.state.data,[key]:value}) as SharedCatalog;} catch {this.emit({error:'저장할 데이터 형식을 확인해주세요. 카테고리는 최소 1개가 필요합니다.'});return;}
  this.generation++;this.emit({data,dirty:true,error:this.state.conflict?this.state.error:'',paused:this.state.conflict});
 }
 setConfig=(update:Update<SiteConfig>)=>this.updatePublic('config',typeof update==='function'?update(this.state.data.config):update);
 setCategories=(update:Update<CategoryItem[]>)=>this.updatePublic('categories',typeof update==='function'?update(this.state.data.categories):update);
 setNews=(update:Update<NewsItem[]>)=>this.updatePublic('news',typeof update==='function'?update(this.state.data.news):update);
 publishInitial=()=>{if(!this.admin||!this.state.ready)return;this.generation++;this.emit({dirty:true,paused:false,error:''});};
 async refresh(discardDraft=false, fresh=false) {
  if(this.loading || this.state.saving || (this.state.dirty&&!discardDraft))return;
  this.loading=true;
  const adminAtStart=this.admin;
  try{
   const response=await this.transport(fresh?`/api/catalog?fresh=${Date.now()}`:'/api/catalog',{credentials:'same-origin',headers:this.state.revision?{'If-None-Match':`"catalog-${this.state.revision}"`}:{}});
   if(response.status===304){this.emit({ready:true,error:''});return;}
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||'최신 정보를 불러오지 못했습니다.');
   if(!Number.isSafeInteger(result.revision)||result.revision<0)throw new Error('최신 정보를 확인하지 못했습니다.');
   if(this.state.dirty&&!discardDraft)return;
   if(this.admin&&!adminAtStart&&this.state.ready&&!discardDraft)return;
   if(result.snapshot===null){if(this.state.revision>0)throw new Error('공용 정보를 확인하지 못했습니다.');this.emit({ready:true,initialized:false,error:''});return;}
   if(result.revision<this.state.revision)return;
   const data=sanitizeCatalog(result.snapshot) as SharedCatalog;
   this.emit({data,revision:result.revision,ready:true,initialized:true,dirty:false,paused:false,conflict:false,error:''});this.cache();
  }catch(error){this.emit({error:error instanceof Error?error.message:'최신 정보를 불러오지 못했습니다.'});}
  finally{this.loading=false;this.lastCheck=Date.now();}
 }
 refreshIfStale=()=>{if(!this.admin&&Date.now()-this.lastCheck>15000)void this.refresh();};
 async save() {
  if(!this.admin||!this.state.ready||!this.state.dirty||this.state.saving||this.state.conflict)return;
  const generation=this.generation;const snapshot=this.state.data;
  const body=JSON.stringify({snapshot,expectedRevision:this.state.revision});
  if(new TextEncoder().encode(body).length>3*1024*1024){this.emit({paused:true,error:'저장할 내용이 너무 큽니다. 사진 수를 줄이거나 이미지 URL을 사용해주세요.'});return;}
  this.emit({saving:true,paused:false,error:''});
  try{
   const response=await this.transport('/api/catalog',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body});
   const result=await response.json();
   if(!response.ok){this.emit({conflict:response.status===409});throw new Error(result.error||'공용 저장에 실패했습니다.');}
   if(!Number.isSafeInteger(result.revision)||result.revision!==this.state.revision+1)throw new Error('저장 결과를 확인하지 못했습니다.');
   const dirty=this.generation!==generation;
   this.emit({revision:result.revision,initialized:true,dirty,paused:false,conflict:false});
   // Cache only acknowledged content; newer edits stay in memory and will save next.
   try{this.storage.setItem(SHARED_CACHE_KEY,JSON.stringify({data:snapshot,revision:result.revision,initialized:true}));}catch{this.emit({storageError:'공용 저장은 완료했지만 브라우저 캐시 공간이 부족합니다.'});}
  }catch(error){this.emit({paused:true,error:error instanceof Error?error.message:'공용 저장에 실패했습니다.'});}
  finally{this.emit({saving:false});}
 }
}
