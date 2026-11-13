import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ArchiveStore,PERSONAL_KEY,SHARED_CACHE_KEY,SharedCatalog} from '../src/utils/archiveStore';
import {componentKeys,mergePersonal,personalRecord} from '../src/utils/personalCollection';
import {sanitizeCatalog} from '../shared/catalog.js';
const fixture=():SharedCatalog=>({goods:[{id:'one',title:'앨범',memberId:'ine',category:'album',rarity:'Official',releaseDate:'2026.01.01',releaseYear:2026,originalPrice:1000,imageUrl:'',description:'',components:['A','B'],tags:[],favoriteCount:0,isOwned:true,userNote:'sample'}],config:{siteTitle:'박물관'} as any,categories:[{id:'album',label:'음반'}],news:[]});
class MemoryStorage {map=new Map<string,string>();getItem(key:string){return this.map.get(key)||null;}setItem(key:string,value:string){this.map.set(key,value);}}
function backend(initial=fixture()) {
 let snapshot=sanitizeCatalog(initial),revision=1;const requests:any[]=[];
 const transport:typeof fetch=async(_url,options)=>{requests.push(options);if(options?.method==='PUT'){const body=JSON.parse(options.body as string);if(body.expectedRevision!==revision)return Response.json({error:'conflict'},{status:409});snapshot=sanitizeCatalog(body.snapshot);return Response.json({revision:++revision});}return Response.json({revision,snapshot});};
 return {transport,requests,get snapshot(){return snapshot;},get revision(){return revision;}};
}
test('fresh browsers never inherit sample owned flags or notes',async()=>{
 const store=new ArchiveStore(fixture(),new MemoryStorage(),backend().transport);
 assert.equal(store.getGoods()[0].isOwned,false);assert.equal(store.getGoods()[0].userNote,'');
 await store.refresh();assert.equal(store.getGoods()[0].isOwned,false);
});
test('legacy personal records migrate once, remain browser-specific, and never reach shared storage',async()=>{
 const db=backend();const a=new MemoryStorage(),b=new MemoryStorage();
 a.setItem('isegye_goods_archive_items_v2',JSON.stringify([{...fixture().goods[0],isOwned:true,userNote:'A의 메모'}]));
 b.setItem('isegye_goods_archive_items_v2',JSON.stringify([{...fixture().goods[0],isOwned:false,isWishlist:true,checkedComponentIndices:[1],userNote:'B의 메모'}]));
 const admin=new ArchiveStore(fixture(),a,db.transport),visitor=new ArchiveStore(fixture(),b,db.transport);admin.setAdmin(true);
 await Promise.all([admin.refresh(),visitor.refresh()]);
 assert.equal(admin.getGoods()[0].isOwned,true);assert.equal(visitor.getGoods()[0].isWishlist,true);
 admin.setGoods(items=>items.map(item=>({...item,originalPrice:2500,components:['B','A','C']})));
 await admin.save();await visitor.refresh();
 assert.equal(visitor.getGoods()[0].originalPrice,2500);assert.equal(visitor.getGoods()[0].userNote,'B의 메모');assert.deepEqual(visitor.getGoods()[0].checkedComponentIndices,[0]);
 assert.deepEqual(admin.getGoods()[0].checkedComponentIndices,[0,1]);assert.equal(admin.getGoods()[0].isOwned,false);
 const published=JSON.stringify(db.snapshot);for(const secret of ['A의 메모','B의 메모','isOwned','isWishlist','checkedComponentIndices','userNote'])assert.equal(published.includes(secret),false);
 const puts=db.requests.filter(r=>r?.method==='PUT').length;
 visitor.setGoods(items=>items.map(item=>({...item,isOwned:true,checkedComponentIndices:[0,1,2]})));await visitor.save();
 assert.equal(db.requests.filter(r=>r?.method==='PUT').length,puts);assert.equal(visitor.getGoods()[0].isOwned,true);
 const reopened=new ArchiveStore(fixture(),b,db.transport);await reopened.refresh();assert.equal(reopened.getGoods()[0].isOwned,true);assert.equal(reopened.getGoods()[0].userNote,'B의 메모');assert.ok(b.getItem(PERSONAL_KEY));
});
test('nonadmins cannot change public goods, categories, news or config',async()=>{
 const db=backend();const store=new ArchiveStore(fixture(),new MemoryStorage(),db.transport);await store.refresh();
 store.setGoods(items=>items.map(item=>({...item,title:'forged'})));store.setConfig({siteTitle:'forged'} as any);store.setNews([{id:'forged'} as any]);store.setCategories([{id:'fake',label:'fake'}]);
 assert.equal(store.getGoods()[0].title,'앨범');assert.equal(store.getSnapshot().data.config.siteTitle,'박물관');assert.equal(store.getSnapshot().dirty,false);
});
test('conflicting admin edits cannot overwrite the latest revision and reloading preserves personal notes',async()=>{
 const db=backend(),storage=new MemoryStorage();storage.setItem('isegye_goods_archive_items_v2',JSON.stringify([{...fixture().goods[0],userNote:'keep'}]));
 const first=new ArchiveStore(fixture(),new MemoryStorage(),db.transport),second=new ArchiveStore(fixture(),storage,db.transport);first.setAdmin(true);second.setAdmin(true);await first.refresh();await second.refresh();
 first.setConfig({siteTitle:'newest'} as any);await first.save();second.setConfig({siteTitle:'stale'} as any);await second.save();
 assert.equal(second.getSnapshot().conflict,true);assert.equal(second.getSnapshot().dirty,true);assert.equal(db.snapshot.config.siteTitle,'newest');
 await second.refresh(true);assert.equal(second.getSnapshot().data.config.siteTitle,'newest');assert.equal(second.getGoods()[0].userNote,'keep');assert.equal(second.getSnapshot().dirty,false);
});
test('edits made during saving stay dirty and save with the next revision',async()=>{
 const db=backend();let unblock:()=>void=()=>{};let started:()=>void=()=>{};const hasStarted=new Promise<void>(resolve=>started=resolve);let block=true;
 const transport:typeof fetch=async(url,options)=>{if(options?.method==='PUT'&&block){started();await new Promise<void>(resolve=>unblock=resolve);block=false;}return db.transport(url,options);};
 const storage=new MemoryStorage(),store=new ArchiveStore(fixture(),storage,transport);store.setAdmin(true);await store.refresh();store.setConfig({siteTitle:'first'} as any);const saving=store.save();await hasStarted;store.setConfig({siteTitle:'second'} as any);unblock();await saving;
 assert.equal(store.getSnapshot().dirty,true);assert.equal(JSON.parse(storage.getItem(SHARED_CACHE_KEY)!).data.config.siteTitle,'first');await store.save();assert.equal(db.snapshot.config.siteTitle,'second');assert.equal(store.getSnapshot().dirty,false);
});
test('failed saves keep the draft and errors pause automatic retry',async()=>{
 const db=backend();const transport:typeof fetch=(url,options)=>options?.method==='PUT'?Promise.resolve(Response.json({error:'offline'},{status:503})):db.transport(url,options);
 const store=new ArchiveStore(fixture(),new MemoryStorage(),transport);store.setAdmin(true);await store.refresh();store.setConfig({siteTitle:'draft'} as any);await store.save();
 assert.equal(store.getSnapshot().dirty,true);assert.equal(store.getSnapshot().paused,true);assert.equal(store.getSnapshot().data.config.siteTitle,'draft');store.setConfig({siteTitle:'smaller draft'} as any);assert.equal(store.getSnapshot().paused,false);
});
test('duplicate component labels remain distinct and reordering preserves checks',()=>{
 const item={...fixture().goods[0],isOwned:false,components:['A','A','B'],checkedComponentIndices:[1]};const record=personalRecord(item);
 assert.equal(new Set(componentKeys(item.components)).size,3);assert.deepEqual(mergePersonal({...item,components:['B','A','A']},record).checkedComponentIndices,[2]);
});

test('an older refresh cannot replace edits made while it was in flight',async()=>{
 const db=backend();let release:()=>void=()=>{};let delay=false;
 const transport:typeof fetch=async(url,options)=>{const response=await db.transport(url,options);if(delay&&options?.method!=='PUT')await new Promise<void>(resolve=>release=resolve);return response;};
 const store=new ArchiveStore(fixture(),new MemoryStorage(),transport);store.setAdmin(true);await store.refresh();delay=true;const refreshing=store.refresh();await new Promise(resolve=>setTimeout(resolve,0));store.setConfig({siteTitle:'unsaved local edit'} as any);release();await refreshing;
 assert.equal(store.getSnapshot().data.config.siteTitle,'unsaved local edit');assert.equal(store.getSnapshot().dirty,true);
});
test('deleting shared goods does not delete private records and public-only reset preserves notes',async()=>{
 const db=backend(),storage=new MemoryStorage();storage.setItem('isegye_goods_archive_items_v2',JSON.stringify([{...fixture().goods[0],userNote:'preserve'}]));
 const store=new ArchiveStore(fixture(),storage,db.transport);store.setAdmin(true);await store.refresh();store.setGoods([]);await store.save();assert.equal(store.getGoods().length,0);
 store.setGoods(sanitizeCatalog(fixture()).goods as any);assert.equal(store.getGoods()[0].userNote,'preserve');assert.equal(store.getGoods()[0].isOwned,true);
});

test('malformed public edits fail safely without losing the current catalog',async()=>{
 const db=backend(),store=new ArchiveStore(fixture(),new MemoryStorage(),db.transport);store.setAdmin(true);await store.refresh();
 assert.doesNotThrow(()=>store.setCategories([]));assert.equal(store.getSnapshot().data.categories.length,1);assert.ok(store.getSnapshot().error);
});

test('an administrator checking their own collection does not publish it',async()=>{
 const db=backend(),store=new ArchiveStore(fixture(),new MemoryStorage(),db.transport);store.setAdmin(true);await store.refresh();
 store.setGoods(items=>items.map(item=>({...item,isOwned:true,checkedComponentIndices:[0,1],userNote:'admin private note'})));await store.save();
 assert.equal(store.getSnapshot().dirty,false);assert.equal(db.requests.filter(r=>r?.method==='PUT').length,0);assert.equal(store.getGoods()[0].userNote,'admin private note');
});

test('tabs in one browser preserve each other\'s personal changes without publishing them',async()=>{
 const db=backend(),storage=new MemoryStorage();const a=new ArchiveStore(fixture(),storage,db.transport),b=new ArchiveStore(fixture(),storage,db.transport);
 await a.refresh();await b.refresh();a.setGoods(items=>items.map(item=>({...item,isOwned:true,checkedComponentIndices:[0,1]})));
 b.setGoods(items=>items.map(item=>({...item,userNote:'same browser note'})));a.syncPersonalFromStorage();
 assert.equal(a.getGoods()[0].userNote,'same browser note');assert.equal(b.getGoods()[0].isOwned,true);assert.equal(db.requests.filter(r=>r?.method==='PUT').length,0);
});

test('private write failures keep in-memory records and warn before leaving',async()=>{
 const db=backend(),storage=new MemoryStorage();const store=new ArchiveStore(fixture(),storage,db.transport);await store.refresh();
 storage.setItem=()=>{throw new Error('quota');};
 store.setGoods(items=>items.map(item=>({...item,isOwned:true,checkedComponentIndices:[0,1]})));
 store.setGoods(items=>items.map(item=>({...item,userNote:'not yet persisted'})));
 assert.equal(store.getGoods()[0].isOwned,true);assert.equal(store.getGoods()[0].userNote,'not yet persisted');assert.equal(store.getSnapshot().personalPending,true);assert.ok(store.getSnapshot().storageError);
});
