import {GoodsItem} from '../types';
export interface PersonalRecord {isOwned:boolean;isWishlist:boolean;userNote:string;checkedKeys:string[];}
export type PersonalCollection=Record<string,PersonalRecord>;
export function componentKeys(components:string[]=[]):string[] {
 const count=new Map<string,number>();
 return components.map(label=>{const occurrence=count.get(label)||0;count.set(label,occurrence+1);return JSON.stringify([label,occurrence]);});
}
export function personalRecord(item:GoodsItem):PersonalRecord {
 const keys=componentKeys(item.components||[]);
 return {isOwned:Boolean(item.isOwned),isWishlist:Boolean(item.isWishlist),userNote:typeof item.userNote==='string'?item.userNote:'',checkedKeys:item.isOwned?keys:[...new Set(item.checkedComponentIndices||[])].filter(index=>Number.isInteger(index)&&index>=0&&index<keys.length).map(index=>keys[index])};
}
export function mergePersonal(item:GoodsItem,record?:PersonalRecord):GoodsItem {
 const keys=componentKeys(item.components||[]);const checked=new Set(Array.isArray(record?.checkedKeys)?record.checkedKeys:[]);
 const indices=keys.flatMap((key,index)=>checked.has(key)?[index]:[]);
 const isOwned=keys.length?indices.length===keys.length:Boolean(record?.isOwned);
 return {...item,isOwned,isWishlist:!isOwned&&Boolean(record?.isWishlist),userNote:typeof record?.userNote==='string'?record.userNote:'',checkedComponentIndices:indices};
}
export function migratePersonal(items:GoodsItem[]):PersonalCollection {
 return Object.fromEntries(items.filter(item=>item&&typeof item.id==='string').map(item=>[item.id,personalRecord(item)]));
}
export function personalChanged(previous:GoodsItem|undefined,next:GoodsItem):boolean {
 if (!['isOwned','isWishlist','userNote','checkedComponentIndices'].some(key=>Object.hasOwn(next,key))) return false;
 return !previous || Boolean(previous.isOwned)!==Boolean(next.isOwned)||Boolean(previous.isWishlist)!==Boolean(next.isWishlist)||(previous.userNote||'')!==(next.userNote||'')||JSON.stringify(previous.checkedComponentIndices||[])!==JSON.stringify(next.checkedComponentIndices||[]);
}
