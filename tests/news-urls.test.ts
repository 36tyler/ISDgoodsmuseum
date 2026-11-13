import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isNewsImageUrl} from '../src/utils/newsUrls';
test('bundled images, uploaded photos and external images can survive news edits',()=>{
 for(const url of ['/bg-isegye.jpg','/assets/photo.png','data:image/webp;base64,aGVsbG8=','https://example.test/photo.png'])assert.equal(isNewsImageUrl(url),true);
 for(const url of ['javascript:alert(1)','//evil.test/image','/\\evil.test/image','data:text/html,test'])assert.equal(isNewsImageUrl(url),false);
});
