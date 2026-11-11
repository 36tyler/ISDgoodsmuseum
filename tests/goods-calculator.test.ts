import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getCalculatorLines, normalizeQuantity} from '../src/utils/goodsCalculator';
import type {GoodsItem} from '../src/types';
const goods = [{id:'a', originalPrice:48000}, {id:'b',originalPrice:24000}] as GoodsItem[];
test('multiple items and quantities use release prices',()=>{
 const lines=getCalculatorLines(goods,{a:2,b:3});
 assert.deepEqual(lines.map(x=>x.subtotal),[96000,72000]);
 assert.equal(lines.reduce((sum,x)=>sum+x.subtotal,0),168000);
 assert.equal(lines.reduce((sum,x)=>sum+x.quantity,0),5);
});
test('quantity changes, removal, reset and deleted goods update totals',()=>{
 assert.equal(getCalculatorLines(goods,{a:1,b:0})[0].subtotal,48000);
 assert.equal(getCalculatorLines(goods,{}).length,0);
 assert.equal(getCalculatorLines(goods,{deleted:5}).length,0);
 assert.equal(getCalculatorLines([goods[1]],{a:2,b:1})[0].subtotal,24000);
});
test('invalid quantities and prices cannot create negative or NaN totals',()=>{
 assert.deepEqual([-1,NaN,Infinity,1.9,1000].map(normalizeQuantity),[0,0,0,1,999]);
 for(const price of [-1,NaN,Infinity])assert.equal(getCalculatorLines([{id:'c',originalPrice:price}] as GoodsItem[],{c:1})[0].subtotal,0);
});

test('member, kind and text filters work together while totals retain all selected goods',async()=>{
 const {filterCalculatorGoods}=await import('../src/utils/goodsCalculator');
 const items=[
  {id:'ine',memberId:'ine',title:'아이네 포토카드',rarity:'Official',originalPrice:1000},
  {id:'ine-collab',memberId:'ine',title:'아이네 콜라보 키링',rarity:'Collab',originalPrice:2000},
  {id:'lilpa',memberId:'lilpa',title:'릴파 키링',rarity:'Official',originalPrice:3000},
  {id:'group',memberId:'group',title:'단체 앨범',rarity:'Official',originalPrice:4000},
 ] as GoodsItem[];
 assert.equal(filterCalculatorGoods(items,{query:'',kind:'all',member:'all'}).length,4);
 assert.deepEqual(filterCalculatorGoods(items,{query:'',kind:'all',member:'ine'}).map(x=>x.id),['ine','ine-collab']);
 assert.deepEqual(filterCalculatorGoods(items,{query:'키링',kind:'Collab',member:'ine'}).map(x=>x.id),['ine-collab']);
 assert.deepEqual(filterCalculatorGoods(items,{query:'',kind:'Official',member:'group'}).map(x=>x.id),['group']);
 assert.equal(filterCalculatorGoods(items,{query:'없는 이름',kind:'all',member:'all'}).length,0);
 assert.equal(getCalculatorLines(items,{ine:2,lilpa:1}).reduce((sum,x)=>sum+x.subtotal,0),5000);
});
