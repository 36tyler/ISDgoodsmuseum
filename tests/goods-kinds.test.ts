import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getGoodsKinds,DEFAULT_GOODS_KINDS} from '../src/utils/goodsKinds';
import {getGoodsKind,normalizeGoods} from '../src/utils/goodsKind';
import {getRarityLabel} from '../src/data/members';
import type {GoodsItem} from '../src/types';
test('existing and invalid settings retain the original kind defaults',()=>{
 assert.deepEqual(getGoodsKinds(),DEFAULT_GOODS_KINDS);
 assert.deepEqual(getGoodsKinds([]),DEFAULT_GOODS_KINDS);
 assert.deepEqual(getGoodsKinds([{id:'all',label:'reserved'},{id:'x',label:''}]),DEFAULT_GOODS_KINDS);
});
test('renaming preserves identity and custom kinds survive normalization and serialization',()=>{
 const kinds=getGoodsKinds([{id:'Official',label:'공식 굿즈'},{id:'custom-event',label:'행사'}]);
 assert.equal(getRarityLabel('Official',kinds),'공식 굿즈');
 const goods=normalizeGoods({id:'x',rarity:'custom-event',components:[]} as unknown as GoodsItem);
 assert.equal(goods.rarity,'custom-event');
 assert.equal(getRarityLabel(goods.rarity,JSON.parse(JSON.stringify(kinds))),'행사');
 assert.equal(getGoodsKind('Limited'),'Official');
 assert.equal(getGoodsKind('Legendary'),'Official');
});
test('invalid and duplicate IDs are ignored without losing custom kinds',()=>{
 assert.deepEqual(getGoodsKinds([{id:'a',label:' one '},{id:'a',label:'duplicate'},{id:'b',label:'two'}]),[{id:'a',label:'one'},{id:'b',label:'two'}]);
});
